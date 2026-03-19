'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Skeleton,
  Tag,
} from 'antd';
import {
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import { ListSkeleton, ProfileSkeleton, TableSkeleton } from '../components/skeletons';
import { apiGetMe, updateCurrentUser, type AuthUser } from '../lib/authApi';
import { apiGetMyCompanyDetail, apiUpsertCompanyDetail } from '../lib/companyDetailApi';
import { apiGetMyStudentDetail, apiUpsertStudentDetail } from '../lib/studentDetailApi';
import { apiGetAllJobs, Job, Applicant } from '../lib/jobsApi';

const { Option } = Select;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSuspenseSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileSuspenseSkeleton() {
  return (
    <div className="page-bg">
      <Navbar title="Profile" />
      <div className="page-content">
        <ProfileSkeleton className="mb-6" />
        <TableSkeleton rows={4} columns={3} />
      </div>
    </div>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiGetMe();
        setUser(me);
        if (me.role === 'company') {
          try { setDetail(await apiGetMyCompanyDetail()); } catch { setDetail(null); }
        } else if (me.role === 'student') {
          try { setDetail(await apiGetMyStudentDetail()); } catch { setDetail(null); }
          try {
            const allJobs = await apiGetAllJobs();
            const myApps = allJobs.filter((job) =>
              job.applicants?.some((app: Applicant) => {
                const appId = typeof app.userId === 'object' && app.userId !== null ? (app.userId as any)._id : app.userId;
                return appId === me.id || appId === me._id;
              })
            );
            setAppliedJobs(myApps);
          } catch { setAppliedJobs([]); }
        }
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  useEffect(() => {
    if (!loading && searchParams.get('edit') === 'true') setEditOpen(true);
  }, [loading, searchParams]);
  
  const openEdit = () => {
    if (user?.role === 'company') {
      form.setFieldsValue({
        name: user?.name || '',
        companyName: detail?.companyName || user?.company || '',
        industry: detail?.industry || '',
        foundedYear: detail?.foundedYear || '',
        website: detail?.website || '',
        location: detail?.location || detail?.address || '',
        description: detail?.description || '',
        contactPhone: detail?.phone || '',
        contactEmail: detail?.contactEmail || user?.email || '',
        linkedin: detail?.linkedIn || '',
      });
    } else if (user?.role === 'student') {
      form.setFieldsValue({
        name: user?.name || '',
        phone: detail?.phone || '',
        dateOfBirth: detail?.dateOfBirth ? String(detail.dateOfBirth).substring(0, 10) : '',
        gender: detail?.gender || '',
        bio: detail?.bio || '',
        skills: detail?.skills || [],
        degree: detail?.degree || '',
        fieldOfStudy: detail?.fieldOfStudy || '',
        institution: detail?.institution || '',
        graduationYear: detail?.graduationYear || '',
        linkedIn: detail?.linkedIn || '',
      });
    }
    setEditOpen(true);
  };

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      // Update basic user profile details (like Name)
      if (values.name && values.name !== user?.name) {
        await updateCurrentUser(user!.id || user!._id!, { name: values.name as string });
        setUser((prev) => prev ? { ...prev, name: values.name as string } : null);
      }

      if (user?.role === 'company') {
        const updated = await apiUpsertCompanyDetail({
          companyName: values.companyName as string,
          industry: values.industry as string,
          size: (detail?.companysize || detail?.size || '') as string,
          foundedYear: values.foundedYear as string,
          website: values.website as string,
          location: values.location as string,
          description: values.description as string,
          phone: values.contactPhone as string,
          contactEmail: values.contactEmail as string,
          linkedIn: values.linkedin as string,
        });
        setDetail(updated);
      } else if (user?.role === 'student') {
        const updated = await apiUpsertStudentDetail({
          phone: values.phone as string,
          dateOfBirth: values.dateOfBirth as string,
          gender: values.gender as string,
          bio: values.bio as string,
          skills: values.skills as string[],
          degree: values.degree as string,
          fieldOfStudy: values.fieldOfStudy as string,
          institution: values.institution as string,
          graduationYear: values.graduationYear as string,
          linkedIn: values.linkedIn as string,
        });
        setDetail(updated);
      }
      setEditOpen(false);
      message.success('Profile updated successfully ✨');
    } catch {
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100">
      <div className="text-indigo-500 text-base mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
        <div className="text-sm text-slate-900 mt-0.5">{value || '—'}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="page-bg">
        <Navbar title="Profile" />
        <div className="page-content">
          <ProfileSkeleton className="mb-6" />
          {searchParams.get('role') === 'student' ? (
            <ListSkeleton count={3} withAvatar={false} />
          ) : (
            <TableSkeleton rows={4} columns={3} />
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Skeleton.Button active style={{ height: 40, width: 112 }} />
            <Skeleton.Button active style={{ height: 40, width: 144 }} />
          </div>
        </div>
      </div>
    );
  }

  const isCompany = user?.role === 'company';
  const isStudent = user?.role === 'student';
  const coverGradient = isCompany
    ? 'bg-linear-to-br from-[#1e1b4b] via-[#4338ca] to-[#6366f1]'
    : 'bg-linear-to-br from-[#14532d] via-[#15803d] to-[#4ade80]';
  const avatarBg = isCompany
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    : 'linear-gradient(135deg, #15803d, #4ade80)';
  const tagColor = isCompany ? 'purple' : 'green';

  return (
    <div className="page-bg">
      <Navbar title="Profile" />

      <div className="page-content">
        <motion.div variants={stagger} initial="hidden" animate="visible">

          {/* Profile Header Card */}
          <motion.div variants={fadeUp}>
            <Card
              className="rounded-[20px] mb-6 border border-slate-100 overflow-hidden"
              styles={{
                body: { padding: 0 }
              }}
            >
              {/* Gradient Cover */}
              <div className={`h-32 ${coverGradient} relative`}>
                <Button
                  icon={<EditOutlined />}
                  onClick={openEdit}
                  className="absolute! top-4! right-4! text-white! border-white/30! bg-white/15!"
                >
                  Edit Profile
                </Button>
              </div>

              <div className="px-10 pb-7">
                {/* Avatar + Name */}
                <div className="flex items-end justify-between -mt-8 mb-5">
                  <div className="flex items-end gap-4">
                    <Avatar
                      size={80}
                      icon={isCompany ? <BankOutlined /> : <UserOutlined />}
                      className="border-4! border-white! shadow-lg shrink-0"
                      style={{ background: avatarBg }}
                    />
                    <div className="mb-0">
                      <div className="text-xl font-bold text-slate-900">
                        {isCompany ? (detail?.companyName || user?.name || '—') : (user?.name || '—')}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag color={tagColor} className="rounded-full m-0">
                          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                        </Tag>
                        {isCompany && detail?.industry && (
                          <span className="text-sm text-slate-500">{detail.industry}</span>
                        )}
                        {isStudent && detail?.institution && (
                          <span className="text-sm text-slate-500">{detail.institution}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio / Description */}
                {(detail?.description || detail?.bio) && (
                  <div className="bg-slate-50 border border-indigo-100 rounded-xl px-4 py-3.5 mb-5 text-sm text-slate-600 leading-relaxed">
                    {detail.description || detail.bio}
                  </div>
                )}

                {/* ── Company Info ── */}
                {isCompany && (
                  <Row gutter={[32, 0]}>
                    <Col xs={24} md={12}>
                      <InfoRow icon={<MailOutlined />} label="Contact Email" value={detail?.contactEmail || user?.email || '—'} />
                      <InfoRow icon={<PhoneOutlined />} label="Phone" value={detail?.phone || '—'} />
                      <InfoRow icon={<EnvironmentOutlined />} label="Location" value={detail?.location || detail?.address || '—'} />
                      <InfoRow icon={<CalendarOutlined />} label="Member Since" value={user?.createdAt ? user.createdAt.substring(0, 10) : '—'} />
                    </Col>
                    <Col xs={24} md={12}>
                      <InfoRow icon={<BankOutlined />} label="Industry" value={detail?.industry || '—'} />
                      <InfoRow icon={<GlobalOutlined />} label="Website" value={detail?.website || '—'} />
                      <InfoRow icon={<LinkedinOutlined />} label="LinkedIn" value={detail?.linkedIn || '—'} />
                      <InfoRow icon={<CalendarOutlined />} label="Founded Year" value={detail?.foundedYear || '—'} />
                    </Col>
                  </Row>
                )}

                {/* ── Student Info ── */}
                {isStudent && (
                  <Row gutter={[32, 0]}>
                    <Col xs={24} md={12}>
                      <InfoRow icon={<MailOutlined />} label="Email" value={user?.email || '—'} />
                      <InfoRow icon={<PhoneOutlined />} label="Phone" value={detail?.phone || '—'} />
                      <InfoRow icon={<CalendarOutlined />} label="Date of Birth" value={detail?.dateOfBirth ? String(detail.dateOfBirth).substring(0, 10) : '—'} />
                      <InfoRow icon={<UserOutlined />} label="Gender" value={detail?.gender || '—'} />
                    </Col>
                    <Col xs={24} md={12}>
                      <InfoRow icon={<BookOutlined />} label="Degree" value={[detail?.degree, detail?.fieldOfStudy].filter(Boolean).join(' — ') || '—'} />
                      <InfoRow icon={<BankOutlined />} label="Institution" value={detail?.institution || '—'} />
                      <InfoRow icon={<CalendarOutlined />} label="Graduation Year" value={detail?.graduationYear ? String(detail.graduationYear) : '—'} />
                      <InfoRow icon={<LinkedinOutlined />} label="LinkedIn" value={detail?.linkedIn || '—'} />
                    </Col>
                    {Array.isArray(detail?.skills) && detail.skills.length > 0 && (
                      <Col xs={24} className="mt-3">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Skills</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(detail.skills as string[]).map((skill: string) => (
                            <Tag key={skill} color="geekblue" className="rounded-full">{skill}</Tag>
                          ))}
                        </div>
                      </Col>
                    )}
                  </Row>
                )}

                {/* Fallback if no detail yet */}
                {!isCompany && !isStudent && (
                  <div className="text-slate-500 text-sm py-4">
                    <InfoRow icon={<MailOutlined />} label="Email" value={user?.email || '—'} />
                    <InfoRow icon={<FileTextOutlined />} label="Role" value={user?.role || '—'} />
                    <InfoRow icon={<CalendarOutlined />} label="Member Since" value={user?.createdAt ? user.createdAt.substring(0, 10) : '—'} />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Applied Jobs Section */}
          {isStudent && (
            <motion.div variants={fadeUp}>
              <Card
                className="rounded-[20px] mb-6 border border-slate-100 shadow-xs"
                title={<span className="text-lg font-bold text-slate-800">Applied Jobs</span>}
              >
                {appliedJobs.length === 0 ? (
                  <p className="text-slate-500 text-sm">You haven't applied to any jobs yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {appliedJobs.map((job) => {
                      const myApp = job.applicants.find((app) => {
                         const appId = typeof app.userId === 'object' && app.userId ? (app.userId as any)._id : app.userId;
                         return appId === user?.id || appId === user?._id;
                      });
                      let statusColor = 'blue';
                      if (myApp?.status === 'shortlisted') statusColor = 'green';
                      if (myApp?.status === 'rejected') statusColor = 'red';
                      if (myApp?.status === 'reviewed') statusColor = 'purple';
                      return (
                        <Card key={job._id} className="rounded-xl border border-slate-100 shadow-none hover:shadow-xs transition bg-slate-50/50">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div>
                              <div className="text-base font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition" onClick={() => router.push(`/jobs/${job._id}`)}>
                                {job.title}
                              </div>
                              <div className="text-sm text-slate-500 mt-1">
                                {typeof job.companyId === 'object' ? (job.companyId as any).name || (job.companyId as any).companyName : 'Company'} &bull; {job.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                               <Tag color={statusColor} className="uppercase font-semibold tracking-wider m-0 rounded-full text-xs px-2 py-0.5">
                                 {myApp?.status || 'Unknown'}
                               </Tag>
                               <Button size="medium" onClick={() => router.push(`/jobs/${job._id}`)} className="text-indigo-600 border-indigo-200 hover:border-indigo-500 hover:text-indigo-700">
                                 View
                               </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2.5 text-lg font-extrabold">
            <EditOutlined className="text-indigo-500" /> Edit Profile
          </div>
        }
        open={editOpen}
        onCancel={() => { setEditOpen(false); router.replace('/profile'); }}
        footer={null}
        width={620}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          requiredMark={false}
          className="mt-4"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Required' }]}>
            <Input prefix={<UserOutlined className="text-indigo-500" />} size="large" placeholder="Your full name" />
          </Form.Item>

          {/* ── Company Edit Fields ── */}
          {isCompany && (
            <>
              <Row gutter={14}>
                <Col xs={24} sm={12}>
                  <Form.Item name="companyName" label="Company Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<BankOutlined className="text-indigo-500" />} size="large" placeholder="Company name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="industry" label="Industry" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<FileTextOutlined className="text-indigo-500" />} size="large" placeholder="e.g. Technology" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={14}>
                <Col xs={24} sm={12}>
                  <Form.Item name="contactEmail" label="Contact Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                    <Input prefix={<MailOutlined className="text-indigo-500" />} size="large" placeholder="email@company.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="contactPhone" label="Phone">
                    <Input type="tel" prefix={<PhoneOutlined className="text-indigo-500" />} size="large" placeholder="+1 (555) 000-0000" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={14}>
                <Col xs={24} sm={12}>
                  <Form.Item name="location" label="Location">
                    <Input prefix={<EnvironmentOutlined className="text-indigo-500" />} size="large" placeholder="City, Country" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="foundedYear" label="Founded Year">
                    <Input size="large" placeholder="e.g. 2010" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="website" label="Website">
                <Input prefix={<GlobalOutlined className="text-indigo-500" />} size="large" placeholder="https://yoursite.com" />
              </Form.Item>
              <Form.Item name="linkedin" label="LinkedIn">
                <Input prefix={<LinkedinOutlined className="text-indigo-500" />} size="large" placeholder="https://linkedin.com/company/..." />
              </Form.Item>
              <Form.Item name="description" label="About Company">
                <Input.TextArea rows={3} placeholder="Tell us about your company..." />
              </Form.Item>
            </>
          )}

          {/* ── Student Edit Fields ── */}
          {isStudent && (
            <>
              <Row gutter={14}>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Required' }]}>
                    <Input type="tel" prefix={<PhoneOutlined className="text-indigo-500" />} size="large" placeholder="+1 (555) 000-0000" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: 'Required' }]}>
                    <Input type="date" size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Required' }]}>
                <Select size="large" placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
              <Row gutter={14}>
                <Col xs={24} sm={12}>
                  <Form.Item name="degree" label="Degree" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<BookOutlined className="text-indigo-500" />} size="large" placeholder="e.g. Bachelor's" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="fieldOfStudy" label="Field of Study" rules={[{ required: true, message: 'Required' }]}>
                    <Input size="large" placeholder="e.g. Computer Science" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={14}>
                <Col xs={24} sm={12}>
                  <Form.Item name="institution" label="Institution" rules={[{ required: true, message: 'Required' }]}>
                    <Input size="large" placeholder="e.g. MIT" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="graduationYear" label="Graduation Year" rules={[{ required: true, message: 'Required' }]}>
                    <Input type="number" size="large" placeholder="e.g. 2026" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="skills" label="Skills">
                <Select mode="tags" size="large" placeholder="Add skills (press Enter)..." />
              </Form.Item>
              <Form.Item name="linkedIn" label="LinkedIn">
                <Input prefix={<LinkedinOutlined className="text-indigo-500" />} size="large" placeholder="https://linkedin.com/in/..." />
              </Form.Item>
              <Form.Item name="bio" label="Bio">
                <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
              </Form.Item>
            </>
          )}

          <Divider />
          <div className="flex gap-3 justify-end">
            <Button size="large" onClick={() => { setEditOpen(false); router.replace('/profile'); }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
              className="submit-btn"
              style={{ width: 140 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
