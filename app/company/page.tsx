'use client';

import { useState, useEffect } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  message,
  Row,
  Skeleton,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  BankOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  EditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import JobPostModal from '../components/JobPostModal';
import { CardSkeleton, ProfileSkeleton } from '../components/skeletons';
import { apiGetMe, type AuthUser } from '../lib/authApi';
import { apiGetMyCompanyDetail } from '../lib/companyDetailApi';
import { apiCreateJob, apiUpdateJob, apiDeleteJob, apiGetMyJobs, type Job as ApiJob } from '../lib/jobsApi';

interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship';
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  deadline: string;
  postedAt: string;
  category: string;
  experience: string;
  applicants: number;
}





const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const typeColors: Record<string, string> = {
  'Full-time': 'green',
  'Part-time': 'blue',
  Remote: 'purple',
  Contract: 'orange',
  Internship: 'cyan',
};

export default function CompanyPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companyDetail, setCompanyDetail] = useState<Record<string, any> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm] = Form.useForm();
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await apiGetMe();
        setAuthUser(me);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let detail: Record<string, any> | null = null;
        try { detail = await apiGetMyCompanyDetail(); setCompanyDetail(detail); } catch { setCompanyDetail(null); }
        try {
          const apiJobs = await apiGetMyJobs();
          const mapped: Job[] = apiJobs.map((j) => ({
            id: j._id,
            title: j.title,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            companyId: typeof j.companyId === 'string' ? j.companyId : (j.companyId as any)?._id ?? '',
            companyName: detail?.companyName || me.company || me.name || 'My Company',
            location: j.location,
            type: j.type as Job['type'],
            salary: j.salary,
            description: j.description,
            requirements: j.requirements,
            responsibilities: j.responsibilities,
            benefits: j.benefits,
            deadline: j.deadline,
            postedAt: j.createdAt?.split('T')[0] ?? '',
            category: j.category,
            experience: j.experience,
            applicants: j.applicants?.length ?? 0,
          }));
          setJobs(mapped);
        } catch { setJobs([]); }
      } catch {
        router.replace('/login');
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [router]);
  console.log('Company detail:', companyDetail);
  console.log('Auth user:', authUser);

  const handleCreateJob = async (values: Record<string, string>) => {
    setSubmitting(true);
    try {
      const created: ApiJob = await apiCreateJob({
        title: values.title,
        location: values.location,
        type: values.type as ApiJob['type'],
        salary: values.salary,
        description: values.description,
        category: values.category,
        experience: values.experience,
        deadline: values.deadline,
        requirements: values.requirements
          ? values.requirements.split('\n').filter((r) => r.trim())
          : [],
        responsibilities: values.responsibilities
          ? values.responsibilities.split('\n').filter((r) => r.trim())
          : [],
        benefits: values.benefits
          ? values.benefits.split('\n').filter((r) => r.trim())
          : [],
      });

      // Map API response to local Job shape
      const newJob: Job = {
        id: created._id,
        title: created.title,
        companyId: typeof created.companyId === 'string' ? created.companyId : (created.companyId as any)?._id ?? '',
        companyName: companyDetail?.companyName || authUser?.company || authUser?.name || 'My Company',
        location: created.location,
        type: created.type as Job['type'],
        salary: created.salary,
        description: created.description,
        requirements: created.requirements,
        responsibilities: created.responsibilities,
        benefits: created.benefits,
        deadline: created.deadline,
        postedAt: created.createdAt?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        category: created.category,
        experience: created.experience,
        applicants: created.applicants?.length ?? 0,
      };

      setJobs((prev) => [newJob, ...prev]);
      setModalOpen(false);
      form.resetFields();
      messageApi.success('Job posted successfully! 🎉');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      messageApi.error(e?.response?.data?.message || e?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    editForm.setFieldsValue({
      title: job.title,
      type: job.type,
      location: job.location,
      salary: job.salary,
      category: job.category,
      experience: job.experience,
      deadline: job.deadline,
      description: job.description,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
      benefits: job.benefits.join('\n'),
    });
    setEditModalOpen(true);
  };

  const handleUpdateJob = async (values: Record<string, string>) => {
    if (!editingJob) return;
    setEditSubmitting(true);
    try {
      const updated: ApiJob = await apiUpdateJob(editingJob.id, {
        title: values.title,
        location: values.location,
        type: values.type as ApiJob['type'],
        salary: values.salary,
        description: values.description,
        category: values.category,
        experience: values.experience,
        deadline: values.deadline,
        requirements: values.requirements
          ? values.requirements.split('\n').filter((r) => r.trim())
          : [],
        responsibilities: values.responsibilities
          ? values.responsibilities.split('\n').filter((r) => r.trim())
          : [],
        benefits: values.benefits
          ? values.benefits.split('\n').filter((r) => r.trim())
          : [],
      });

      const updatedJob: Job = {
        ...editingJob,
        title: updated.title,
        location: updated.location,
        type: updated.type as Job['type'],
        salary: updated.salary,
        description: updated.description,
        category: updated.category,
        experience: updated.experience,
        deadline: updated.deadline,
        requirements: updated.requirements,
        responsibilities: updated.responsibilities,
        benefits: updated.benefits,
      };

      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updatedJob : j)));
      setEditModalOpen(false);
      setEditingJob(null);
      editForm.resetFields();
      messageApi.success('Job updated successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      messageApi.error(e?.response?.data?.message || e?.message || 'Failed to update job');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleAiGenerate = async (field: 'description' | 'requirements' | 'responsibilities' | 'benefits') => {
    const values = form.getFieldsValue();
    const title = values.title || 'this role';
    const type = values.type || 'Full-time';
    const category = values.category || 'Engineering';
    const experience = values.experience || '2-4 years';

    const prompts: Record<string, string> = {
      description: `Write a concise, professional job description (3-4 sentences) for a ${type} ${title} position in the ${category} department requiring ${experience} of experience. Use plain text, no markdown, no bullet points.`,
      requirements: `List 6 clear job requirements for a ${title} role in ${category} requiring ${experience} of experience. Output one requirement per line, no numbering, no markdown, no bullet symbols.`,
      responsibilities: `List 6 key responsibilities for a ${title} role in ${category}. Output one responsibility per line, no numbering, no markdown, no bullet symbols.`,
      benefits: `List 5 attractive employee benefits for a ${type} ${title} position. Output one benefit per line, no numbering, no markdown, no bullet symbols.`,
    };

    setAiLoading(field);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error('NEXT_PUBLIC_GROQ_API_KEY is not set in .env.local');

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompts[field] }],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();
      const content: string = data.choices?.[0]?.message?.content?.trim() ?? '';
      form.setFieldsValue({ [field]: content });
      messageApi.success(`AI generated ${field} ✨`);
    } catch (err: unknown) {
      const e = err as Error;
      messageApi.error(`AI generation failed: ${e.message || 'Unknown error'}`);
    } finally {
      setAiLoading(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="page-bg">
        <Navbar title="Company Portal" />
        <div className="page-content">
          <ProfileSkeleton className="mb-6" />
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Skeleton.Input active style={{ height: 24, width: 160 }} />
              <div className="mt-2">
                <Skeleton.Input active style={{ height: 16, width: 112 }} />
              </div>
            </div>
            <Skeleton.Button active style={{ height: 40, width: 144 }} />
          </div>
          <CardSkeleton count={4} />
        </div>
      </div>
    );
  }

  const companyName = companyDetail?.companyName || authUser?.company || authUser?.name || '—';
  const companyEmail = companyDetail?.contactEmail || authUser?.email || '—';
  const phone = companyDetail?.phone || '—';
  const joinedDate = authUser?.createdAt ? authUser.createdAt.substring(0, 10) : '—';

  return (
    <div className="page-bg">
      {contextHolder}
      <Navbar title="Company Portal" />

      <div className="page-content">

        {/* Company Profile Card */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Card
              className="rounded-[20px] mb-6 border border-slate-100 overflow-hidden"
              styles={{
                body: { padding: 0 }
              }}
            >
              {/* Gradient Cover */}
              <div className="h-32 bg-linear-to-br from-[#1e1b4b] via-[#4338ca] to-[#6366f1]" />

              <div className="px-8 pb-7">
                <div className="flex items-end gap-5 -mt-8 mb-4">
                  <div className="w-18 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-[30px] text-indigo-500 shrink-0">
                    <BankOutlined />
                  </div>
                  <div className="mb-1">
                    <div className="text-xl font-bold text-slate-900">{companyName}</div>
                    <div className="text-sm text-slate-500">{companyEmail}</div>
                  </div>
                </div>

                <Row gutter={[24, 12]}>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <TeamOutlined className="text-indigo-500" />
                      <span><strong>Contact:</strong> {phone}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <FileTextOutlined className="text-indigo-500" />
                      <span><strong>Jobs Posted:</strong> {jobs.length}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <ClockCircleOutlined className="text-indigo-500" />
                      <span><strong>Joined:</strong> {joinedDate}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </motion.div>

          {/* Jobs Section Header */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 m-2">Posted Jobs</h2>
                <p className="text-slate-500 mt-1 text-sm m-2">
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
                </p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="submit-btn"
                style={{ width: 'auto', padding: '0 28px' }}
                onClick={() => setModalOpen(true)}
              >
                Post New Job
              </Button>
            </div>
          </motion.div>

          {/* Jobs Grid */}
          {jobs.length === 0 ? (
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl text-center border border-dashed border-indigo-200">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <p className="text-slate-500 mb-4">
                        No jobs posted yet. Create your first job listing!
                      </p>
                    </div>
                  }
                />
              </Card>
            </motion.div>
          ) : (
            <Row gutter={[20, 20]}>
              {jobs.map((job) => (
                <Col xs={24} md={12} key={job.id}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.15)' }}
                  >
                    <Card
                      className="rounded-2xl border border-slate-100 h-full"
                      styles={{
                        body: { padding: '22px 24px' }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-[17px] font-extrabold text-slate-900 mb-1.5">
                            {job.title}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Tag color={typeColors[job.type] || 'default'} className="rounded-full">
                              {job.type}
                            </Tag>
                            <Tag color="geekblue" className="rounded-full">
                              {job.category}
                            </Tag>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-500 text-[13px]">
                              <EnvironmentOutlined className="mr-1" />{job.location}
                            </span>
                            <span className="text-slate-500 text-[13px]">
                              <DollarOutlined className="mr-1" />{job.salary}
                            </span>
                            <span className="text-slate-500 text-[13px]">
                              <TeamOutlined className="mr-1" />{job.applicants || 0} applicants
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Tooltip title="View Details">
                            <Button
                              shape="circle"
                              icon={<EyeOutlined />}
                              size="small"
                              className="border border-indigo-200 text-indigo-500"
                              onClick={() => router.push('/company/jobs/' + job.id)}
                            />
                          </Tooltip>
                          <Tooltip title="View Applicants">
                            <Badge count={job.applicants} size="small" offset={[-2, 2]}>
                              <Button
                                shape="circle"
                                icon={<TeamOutlined />}
                                size="small"
                                className="border border-indigo-200 text-indigo-500"
                                onClick={() => router.push(`/applicants/${job.id}`)}
                              />
                            </Badge>
                          </Tooltip>
                        </div>
                      </div>
                      <Divider className="my-3.5" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Posted: {job.postedAt}</span>
                        <span className="text-xs text-amber-500 font-semibold">
                          Deadline: {job.deadline}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.div>
      </div>

      {/* Create Job Modal */}
      <JobPostModal
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onFinish={handleCreateJob}
        form={form}
        submitting={submitting}
        aiLoading={aiLoading}
        onAiGenerate={handleAiGenerate}
      />

      {/* Edit Job Modal */}
      <JobPostModal
        open={editModalOpen}
        modalTitle={<><EditOutlined className="text-indigo-500" /> Edit Job</>}
        onCancel={() => { setEditModalOpen(false); setEditingJob(null); editForm.resetFields(); }}
        onFinish={handleUpdateJob}
        form={editForm}
        submitting={editSubmitting}
        aiLoading={aiLoading}
        onAiGenerate={handleAiGenerate}
      />
    </div>
  );
}
