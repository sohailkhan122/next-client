'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  LinkedinOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import {
  apiGetJobById,
  apiGetJobApplicants,
  apiUpdateApplicantStatus,
  type Applicant,
  type ApplicantStatus,
  type Job as ApiJob,
} from '../../lib/jobsApi';
import { apiGetStudentDetailByUserId } from '../../lib/studentDetailApi';
import { apiGetMe } from '../../lib/authApi';
import { apiCreateOrGetConversation } from '../../lib/messagesApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
  phone?: string;
  bio?: string;
  skills?: string[];
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
  linkedIn?: string;
  location?: string;
  gender?: string;
  dateOfBirth?: string;
}

interface EnrichedApplicant {
  userId: string;
  name: string;
  email: string;
  appliedAt: string;
  status: ApplicantStatus;
  profile: StudentProfile | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<ApplicantStatus, string> = {
  pending: 'orange',
  reviewed: 'blue',
  shortlisted: 'green',
  rejected: 'red',
};

const statusOptions: { label: string; value: ApplicantStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Rejected', value: 'rejected' },
];

const SKILL_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<ApiJob | null>(null);
  const [applicants, setApplicants] = useState<EnrichedApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<EnrichedApplicant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleMessage = async (applicant: EnrichedApplicant) => {
    if (!applicant.userId) return;
    setMessagingId(applicant.userId);
    try {
      const conv = await apiCreateOrGetConversation(applicant.userId);
      router.push(`/messages/${conv._id}`);
    } catch {
      messageApi.error('Could not open conversation.');
    } finally {
      setMessagingId(null);
    }
  };

  const loadData = useCallback(async () => {
    try {
      await apiGetMe(); // guard: redirect if not authed
    } catch {
      router.replace('/login');
      return;
    }

    try {
      const [jobData, rawApplicants] = await Promise.all([
        apiGetJobById(jobId),
        apiGetJobApplicants(jobId),
      ]);
      setJob(jobData);

      // Enrich each applicant with student profile
      const enriched: EnrichedApplicant[] = await Promise.all(
        rawApplicants.map(async (a: Applicant) => {
          // userId may be a populated object from MongoDB
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userObj = a.userId as any;
          const resolvedId: string =
            typeof a.userId === 'string' ? a.userId : (userObj?._id ?? '');
          const name: string =
            typeof a.userId === 'object' ? (userObj?.name ?? 'Student') : 'Student';
          const email: string =
            typeof a.userId === 'object' ? (userObj?.email ?? '') : '';

          let profile: StudentProfile | null = null;
          if (resolvedId) {
            try {
              profile = await apiGetStudentDetailByUserId(resolvedId);
            } catch {
              profile = null;
            }
          }

          return {
            userId: resolvedId,
            name,
            email,
            appliedAt: a.appliedAt,
            status: a.status,
            profile,
          };
        }),
      );

      setApplicants(enriched);
    } catch {
      messageApi.error('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, [jobId, router, messageApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (applicant: EnrichedApplicant, newStatus: ApplicantStatus) => {
    setUpdatingId(applicant.userId);
    try {
      await apiUpdateApplicantStatus(jobId, applicant.userId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.userId === applicant.userId ? { ...a, status: newStatus } : a)),
      );
      if (selectedApplicant?.userId === applicant.userId) {
        setSelectedApplicant((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
      messageApi.success('Status updated.');
    } catch {
      messageApi.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-bg">
        <Navbar title="Applicants" />
        <div className="page-content flex items-center justify-center" style={{ minHeight: 400 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg">
      {contextHolder}
      <Navbar title="Applicants" />

      <div className="page-content">
        <motion.div variants={stagger} initial="hidden" animate="visible">

          {/* Header & Stats Display */}
          <motion.div variants={fadeUp} className="mb-6 space-y-4">

            {/* Header Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    className="mb-3 sm:mb-4 -ml-3 text-slate-500 hover:text-indigo-600 font-medium"
                  >
                    Back to Jobs
                  </Button>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 m-0 tracking-tight leading-tight">
                    {job?.title ?? 'Loading Role...'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-slate-500 font-medium">
                    <span className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-[13px] sm:text-sm whitespace-nowrap">
                      <TeamOutlined className="mr-1.5" />
                      {applicants.length} Total Applicant{applicants.length !== 1 ? 's' : ''}
                    </span>
                    {job && (
                      <span className="flex items-center text-[13px] sm:text-sm whitespace-nowrap">
                        <EnvironmentOutlined className="mr-1 text-slate-400" />{job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Statistics Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center mb-4">
                <div className="h-6 w-1.5 bg-indigo-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-slate-800 m-0">Application Pipeline Status</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {(['pending', 'reviewed', 'shortlisted', 'rejected'] as ApplicantStatus[]).map((s) => {
                  const count = applicants.filter((a) => a.status === s).length;

                  // Refined styling map for statistical boxes
                  const styleMap: Record<string, string> = {
                    pending: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 text-orange-600 hover:shadow-orange-100',
                    reviewed: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 text-blue-600 hover:shadow-blue-100',
                    shortlisted: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700 hover:shadow-emerald-100',
                    rejected: 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200 text-rose-600 hover:shadow-rose-100',
                  };

                  return (
                    <div
                      key={s}
                      className={`flex flex-col justify-center items-center px-4 py-4 sm:py-5 rounded-2xl border ${styleMap[s]} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default`}
                    >
                      <span className="text-3xl sm:text-4xl font-black leading-none mb-2">{count}</span>
                      <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest opacity-80">{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>

          {/* Applicant Cards */}
          {applicants.length === 0 ? (
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl text-center border border-dashed border-indigo-200">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<p className="text-slate-500">No applicants yet for this job.</p>}
                />
              </Card>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {applicants.map((applicant) => (
                <motion.div
                  key={applicant.userId}
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-white rounded-[24px] border border-slate-200 p-5 sm:p-6 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] hover:border-indigo-100 transition-all duration-400 ease-out relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 sm:gap-6">
                    {/* Left: Avatar & Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 flex-1 w-full">
                      {/* Avatar and Mobile Name/Status (Left Side) */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Avatar
                          size={64}
                          className="shadow-md shadow-indigo-100/50"
                          style={{ background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', flexShrink: 0, border: '2px solid white' }}
                          icon={<UserOutlined />}
                        />
                        <div className="flex flex-col gap-1.5 sm:hidden min-w-0">
                          <h3 className="text-xl font-black text-slate-800 m-0 truncate tracking-tight">{applicant.name}</h3>
                          <div className="self-start">
                            <Tag
                              color={statusColors[applicant.status]}
                              className="rounded-full capitalize text-[10px] font-bold tracking-widest px-3 py-0.5 border-none m-0 shadow-sm"
                            >
                              {applicant.status}
                            </Tag>
                          </div>
                        </div>
                      </div>

                      {/* Details & Skills (Bottom aligned on mobile, side on desktop) */}
                      <div className="min-w-0 pt-0 sm:pt-0.5 w-full">
                        {/* Desktop Name/Status */}
                        <div className="hidden sm:flex items-center gap-3 mb-1.5">
                          <h3 className="text-xl font-black text-slate-800 m-0 truncate tracking-tight">{applicant.name}</h3>
                          <Tag
                            color={statusColors[applicant.status]}
                            className="rounded-full capitalize text-[10px] font-bold tracking-widest px-3 py-0.5 border-none m-0 shadow-sm"
                          >
                            {applicant.status}
                          </Tag>
                        </div>

                        <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-2 sm:gap-y-1.5 font-medium">
                          {applicant.email && (
                            <span className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"><MailOutlined className="mr-1.5 text-slate-400" />{applicant.email}</span>
                          )}
                          {applicant.profile?.phone && (
                            <span className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"><PhoneOutlined className="mr-1.5 text-slate-400" />{applicant.profile.phone}</span>
                          )}
                          <span className="flex items-center"><CalendarOutlined className="mr-1.5 text-slate-400" />{new Date(applicant.appliedAt).toLocaleDateString()}</span>
                        </div>
                        {applicant.profile?.skills && applicant.profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                            {applicant.profile.skills.slice(0, 5).map((skill, i) => (
                              <span
                                key={skill}
                                className={`text-[12px] font-bold px-3 py-1 rounded-lg ${SKILL_COLORS[i % SKILL_COLORS.length]} shadow-sm opacity-90 hover:opacity-100 transition-opacity`}
                              >
                                {skill}
                              </span>
                            ))}
                            {applicant.profile.skills.length > 5 && (
                              <span className="text-[12px] font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-600 shadow-sm">
                                +{applicant.profile.skills.length - 5} MORE
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between xl:justify-end gap-5 sm:gap-6 border-t xl:border-t-0 pt-4 xl:pt-0 border-slate-100 mt-2 xl:mt-0 w-full xl:w-auto flex-shrink-0">

                      {/* Status Dropdown (Full width on mobile) */}
                      <div className="flex flex-col w-full sm:w-auto gap-1.5">
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Update Status</span>
                        <Select
                          size="large"
                          value={applicant.status}
                          loading={updatingId === applicant.userId}
                          className="w-full sm:w-44 font-bold text-[13px] tracking-wide [&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-slate-300 [&_.ant-select-selector]:bg-slate-50 hover:[&_.ant-select-selector]:border-indigo-400 hover:[&_.ant-select-selector]:bg-white focus:[&_.ant-select-selector]:border-indigo-500 focus:[&_.ant-select-selector]:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all"
                          onChange={(val) => handleStatusChange(applicant, val)}
                          options={statusOptions}
                        />
                      </div>

                      <div className="flex items-center justify-around sm:justify-end gap-3 sm:gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                        <Tooltip title="View Details">
                          <Button
                            shape="circle"
                            size="large"
                            icon={<EyeOutlined />}
                            onClick={() => { setSelectedApplicant(applicant); setDetailOpen(true); }}
                            className="bg-indigo-50 border-transparent text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 w-[42px] h-[42px] sm:w-[36px] sm:h-[36px] sm:text-base flex items-center justify-center shadow-sm"
                          />
                        </Tooltip>
                        {applicant.userId && (
                          <Tooltip title="View Resume">
                            <Button
                              shape="circle"
                              size="large"
                              icon={<FileTextOutlined />}
                              onClick={() => router.push(`/resume?userId=${applicant.userId}&name=${encodeURIComponent(applicant.name)}&email=${encodeURIComponent(applicant.email)}`)}
                              className="bg-emerald-50 border-transparent text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 w-[42px] h-[42px] sm:w-[36px] sm:h-[36px] sm:text-base flex items-center justify-center shadow-sm"
                            />
                          </Tooltip>
                        )}
                        {applicant.userId && (
                          <Tooltip title="Send Message">
                            <Button
                              type="primary"
                              shape="circle"
                              size="large"
                              icon={<MessageOutlined />}
                              loading={messagingId === applicant.userId}
                              onClick={() => handleMessage(applicant)}
                              className="bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 border-none w-[42px] h-[42px] sm:w-[36px] sm:h-[36px] sm:text-base flex items-center justify-center shadow-md shadow-indigo-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Applicant Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2.5">
            <SolutionOutlined className="text-indigo-500" />
            <span className="text-lg font-extrabold">{selectedApplicant?.name}</span>
          </div>
        }
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedApplicant(null); }}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setDetailOpen(false); setSelectedApplicant(null); }}>Close</Button>
            {selectedApplicant?.userId && (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => { setDetailOpen(false); router.push(`/resume?userId=${selectedApplicant.userId}&name=${encodeURIComponent(selectedApplicant.name)}&email=${encodeURIComponent(selectedApplicant.email)}`); }}
              >
                View Resume
              </Button>
            )}
            {selectedApplicant?.userId && (
              <Button
                type="primary"
                icon={<MessageOutlined />}
                loading={messagingId === selectedApplicant.userId}
                onClick={() => { setDetailOpen(false); handleMessage(selectedApplicant!); }}
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none' }}
              >
                Message
              </Button>
            )}
          </div>
        }
        width={600}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '72vh', overflowY: 'auto', paddingRight: 8 } }}
        classNames={{ body: 'modal-scroll' }}
      >
        {selectedApplicant && (
          <div className="space-y-4 mt-2">
            {/* Status + change */}
            <div className="flex items-center justify-between">
              <Tag color={statusColors[selectedApplicant.status]} className="rounded-full capitalize text-sm px-3 py-0.5 font-semibold">
                {selectedApplicant.status}
              </Tag>
              <Select
                value={selectedApplicant.status}
                loading={updatingId === selectedApplicant.userId}
                style={{ width: 140 }}
                onChange={(val) => handleStatusChange(selectedApplicant, val)}
                options={statusOptions}
              />
            </div>

            <Divider className="my-2" />

            {/* Contact info */}
            <Row gutter={[16, 10]}>
              {selectedApplicant.email && (
                <Col xs={24} sm={12}>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Email</div>
                  <div className="text-sm font-medium"><MailOutlined className="mr-1 text-indigo-400" />{selectedApplicant.email}</div>
                </Col>
              )}
              {selectedApplicant.profile?.phone && (
                <Col xs={24} sm={12}>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Phone</div>
                  <div className="text-sm font-medium"><PhoneOutlined className="mr-1 text-indigo-400" />{selectedApplicant.profile.phone}</div>
                </Col>
              )}
              {selectedApplicant.profile?.location && (
                <Col xs={24} sm={12}>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Location</div>
                  <div className="text-sm font-medium"><EnvironmentOutlined className="mr-1 text-indigo-400" />{selectedApplicant.profile.location}</div>
                </Col>
              )}
              {selectedApplicant.profile?.linkedIn && (
                <Col xs={24} sm={12}>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">LinkedIn</div>
                  <div className="text-sm font-medium">
                    <LinkedinOutlined className="mr-1 text-indigo-400" />
                    <a href={selectedApplicant.profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                      Profile
                    </a>
                  </div>
                </Col>
              )}
              <Col xs={24} sm={12}>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Applied On</div>
                <div className="text-sm font-medium"><CalendarOutlined className="mr-1 text-indigo-400" />{new Date(selectedApplicant.appliedAt).toLocaleDateString()}</div>
              </Col>
            </Row>

            {/* Bio */}
            {selectedApplicant.profile?.bio && (
              <>
                <Divider className="my-2" />
                <div>
                  <div className="font-bold text-slate-800 mb-1"><UserOutlined className="mr-1 text-indigo-500" />About</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedApplicant.profile.bio}</p>
                </div>
              </>
            )}

            {/* Education */}
            {(selectedApplicant.profile?.degree || selectedApplicant.profile?.institution) && (
              <>
                <Divider className="my-2" />
                <div>
                  <div className="font-bold text-slate-800 mb-2"><SolutionOutlined className="mr-1 text-indigo-500" />Education</div>
                  <div className="text-sm text-slate-700">
                    {selectedApplicant.profile.degree && <span className="font-semibold">{selectedApplicant.profile.degree}</span>}
                    {selectedApplicant.profile.fieldOfStudy && <span> in {selectedApplicant.profile.fieldOfStudy}</span>}
                  </div>
                  {selectedApplicant.profile.institution && (
                    <div className="text-sm text-slate-500 mt-0.5">{selectedApplicant.profile.institution}</div>
                  )}
                  {selectedApplicant.profile.graduationYear && (
                    <div className="text-xs text-slate-400 mt-0.5">Graduated: {selectedApplicant.profile.graduationYear}</div>
                  )}
                </div>
              </>
            )}

            {/* Skills */}
            {selectedApplicant.profile?.skills && selectedApplicant.profile.skills.length > 0 && (
              <>
                <Divider className="my-2" />
                <div>
                  <div className="font-bold text-slate-800 mb-2"><CheckCircleOutlined className="mr-1 text-indigo-500" />Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApplicant.profile.skills.map((skill, i) => (
                      <span
                        key={skill}
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
