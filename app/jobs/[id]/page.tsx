'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  message,
  Modal,
  Row,
  Skeleton,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  BankOutlined,
  CalendarOutlined,
  TrophyOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { CardSkeleton } from '../../components/skeletons';
import { apiGetMe, type AuthUser } from '../../lib/authApi';
import { apiGetJobById, apiApplyToJob, type Job as ApiJob } from '../../lib/jobsApi';
import { apiCreateOrGetConversation } from '../../lib/messagesApi';

interface Job {
  id: string;
  title: string;
  companyName: string;
  companyUserId: string;
  location: string;
  salary: string;
  experience: string;
  deadline: string;
  type: string;
  category: string;
  applicants: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  postedAt: string;
}

const typeColors: Record<string, string> = {
  'Full-time': 'green',
  'Part-time': 'blue',
  Remote: 'purple',
  Contract: 'orange',
  Internship: 'cyan',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [messagingCompany, setMessagingCompany] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const load = async () => {
      let me: AuthUser | null = null;
      try {
        me = await apiGetMe();
        setAuthUser(me);
      } catch {
        router.replace('/login');
        return;
      }
      try {
        const apiJob: ApiJob = await apiGetJobById(jobId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const companyObj = apiJob.companyId as any;
        const companyName: string =
          companyObj?.name ?? companyObj?.company ?? companyObj?.email ?? 'Company';
        const companyUserId: string = companyObj?._id ?? '';
        const userId = me?.id ?? me?._id;
        const alreadyApplied = apiJob.applicants?.some((a) => {
          const aid = typeof a.userId === 'string' ? a.userId : (a.userId as Record<string, unknown>)?._id ?? (a.userId as Record<string, unknown>)?.id;
          return aid === userId;
        }) ?? false;
        setApplied(alreadyApplied);
        setJob({
          id: apiJob._id,
          title: apiJob.title,
          companyName,
          companyUserId,
          location: apiJob.location,
          salary: apiJob.salary,
          experience: apiJob.experience,
          deadline: apiJob.deadline.substring(0, 10),
          type: apiJob.type,
          category: apiJob.category,
          applicants: apiJob.applicants?.length ?? 0,
          description: apiJob.description,
          requirements: apiJob.requirements ?? [],
          responsibilities: apiJob.responsibilities ?? [],
          benefits: apiJob.benefits ?? [],
          postedAt: apiJob.createdAt?.substring(0, 10) ?? '',
        });
      } catch {
        messageApi.error('Job not found.');
        router.push('/student');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, router, messageApi]);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      await apiApplyToJob(jobId);
      setApplied(true);
      setApplyModal(false);
      form.resetFields();
      messageApi.success('Application submitted successfully! 🎉');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      messageApi.error(e?.response?.data?.message || e?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageCompany = async () => {
    if (!job?.companyUserId) return;
    setMessagingCompany(true);
    try {
      const conv = await apiCreateOrGetConversation(job.companyUserId);
      router.push(`/messages/${conv._id}`);
    } catch {
      messageApi.error('Could not open conversation.');
    } finally {
      setMessagingCompany(false);
    }
  };

  if (loading) {
    return (
      <div className="page-bg">
        <Navbar title="Job Details" />
        <div className="page-content mx-auto" style={{ maxWidth: 900 }}>
          <div className="mb-5">
            <Skeleton.Button active style={{ height: 40, width: 144 }} />
          </div>

          <div className="jd-hero-card mb-4">
            <div className="jd-hero-left">
              <Skeleton.Avatar active size={62} shape="circle" />
              <div>
                <Skeleton.Input active className="max-w-full" style={{ height: 28, width: 256 }} />
                <div className="mt-2"><Skeleton.Input active style={{ height: 16, width: 144 }} /></div>
                <div className="mt-3 flex gap-2">
                  <Skeleton.Button active size="small" style={{ height: 24, width: 80 }} />
                  <Skeleton.Button active size="small" style={{ height: 24, width: 80 }} />
                </div>
              </div>
            </div>
            <Skeleton.Button active style={{ height: 48, width: 144 }} />
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Col xs={12} sm={8} md={4} key={index}>
                <div className="jd-info-chip">
                  <Skeleton.Input active style={{ height: 12, width: 32 }} />
                  <div className="mt-2"><Skeleton.Input active style={{ height: 16, width: 48 }} /></div>
                </div>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <CardSkeleton count={1} showHeader={false} showActions={false} />
               <CardSkeleton count={1} showHeader={false} showActions={false} />
                <CardSkeleton count={1} showHeader={false} showActions={false} />
               <CardSkeleton count={1} showHeader={false} showActions={false} />
            </Col>
            <Col xs={24} lg={8}>
              <CardSkeleton count={2} showHeader={false} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="page-bg">
      {contextHolder}
      <Navbar title="Job Details" />

      <div className="page-content" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

          {/* Back */}
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{ borderRadius: 10, fontWeight: 600, color: '#6366f1', borderColor: '#c7d2fe', background: '#eef2ff' }}
            >
              Back to Jobs
            </Button>
          </motion.div>

          {/* Hero Card */}
          <motion.div variants={fadeUp}>
            <div className="jd-hero-card">
              <div className="jd-hero-left">
                <div className="jd-company-logo">{job.companyName.charAt(0)}</div>
                <div>
                  <h1 className="jd-title">{job.title}</h1>
                  <div className="jd-company">{job.companyName}</div>
                  <div className="jd-tags">
                    <Tag color={typeColors[job.type]} style={{ borderRadius: 20 }}>{job.type}</Tag>
                    <Tag color="geekblue" style={{ borderRadius: 20 }}>{job.category}</Tag>
                  </div>
                </div>
              </div>
              <div className="jd-hero-right">
                {applied ? (
                  <Button
                    size="large"
                    icon={<MessageOutlined />}
                    loading={messagingCompany}
                    onClick={handleMessageCompany}
                    style={{ borderRadius: 12, background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe', fontWeight: 700, height: 48, padding: '0 28px' }}
                  >
                    Message
                  </Button>
                ) : !authUser?.profileCompleted ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    className="submit-btn"
                    style={{ height: 48, padding: '0 28px', width: 'auto' }}
                    onClick={() => router.push('/resume/create')}
                  >
                    Please Create Resume
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    className="submit-btn"
                    style={{ height: 48, padding: '0 28px', width: 'auto' }}
                    onClick={() => setApplyModal(true)}
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info Grid */}
          <motion.div variants={fadeUp}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {[
                { icon: <EnvironmentOutlined />, label: 'Location', value: job.location },
                { icon: <DollarOutlined />, label: 'Salary', value: job.salary },
                { icon: <TeamOutlined />, label: 'Experience', value: job.experience },
                { icon: <TrophyOutlined />, label: 'Applicants', value: String(job.applicants || 0) },
                { icon: <CalendarOutlined />, label: 'Posted', value: job.postedAt },
                { icon: <ClockCircleOutlined />, label: 'Deadline', value: job.deadline },
              ].map((item, i) => (
                <Col xs={12} sm={8} md={4} key={i}>
                  <div className="jd-info-chip">
                    <div className="jd-info-icon">{item.icon}</div>
                    <div className="jd-info-label">{item.label}</div>
                    <div className="jd-info-value">{item.value}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </motion.div>

          {/* Main Content */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <motion.div variants={fadeUp}>
                <div className="jd-section-card">
                  <h3 className="jd-section-title">
                    <BankOutlined style={{ color: '#6366f1', marginRight: 8 }} /> About the Role
                  </h3>
                  <p className="jd-body-text">{job.description}</p>

                  {job.responsibilities.length > 0 && (
                    <>
                      <Divider />
                      <h3 className="jd-section-title">Key Responsibilities</h3>
                      <ul className="jd-list">
                        {job.responsibilities.map((r, i) => (
                          <li key={i} className="jd-list-item">
                            <CheckCircleOutlined style={{ color: '#6366f1', marginRight: 8, flexShrink: 0 }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {job.requirements.length > 0 && (
                    <>
                      <Divider />
                      <h3 className="jd-section-title">Requirements</h3>
                      <ul className="jd-list">
                        {job.requirements.map((r, i) => (
                          <li key={i} className="jd-list-item">
                            <CheckCircleOutlined style={{ color: '#10b981', marginRight: 8, flexShrink: 0 }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </motion.div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div variants={fadeUp}>
                {job.benefits.length > 0 && (
                  <div className="jd-section-card">
                    <h3 className="jd-section-title">🎁 Benefits</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {job.benefits.map((b, i) => (
                        <div key={i} className="benefit-chip">
                          <CheckCircleOutlined style={{ color: '#10b981', flexShrink: 0 }} />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="jd-section-card" style={{ marginTop: 16 }}>
                  <h3 className="jd-section-title">📩 Ready to Apply?</h3>
                  <p style={{ color: '#64748b', fontSize: 13.5, marginBottom: 16 }}>
                    Submit your application and cover letter directly to {job.companyName}.
                  </p>
                  {applied ? (
                    <Button
                      block
                      size="large"
                      icon={<MessageOutlined />}
                      loading={messagingCompany}
                      onClick={handleMessageCompany}
                      style={{ borderRadius: 10, background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe', fontWeight: 700 }}
                    >
                      Message Company
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<SendOutlined />}
                      className="submit-btn"
                      onClick={() => setApplyModal(true)}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>

      {/* Apply Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            Apply for <span style={{ color: '#6366f1' }}>{job.title}</span>
          </div>
        }
        open={applyModal}
        onCancel={() => { setApplyModal(false); form.resetFields(); }}
        footer={null}
        width={540}
      >
        {authUser && (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
              marginTop: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{authUser.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{authUser.email}</div>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleApply} requiredMark={false}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button size="large" onClick={() => { setApplyModal(false); form.resetFields(); }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              icon={<SendOutlined />}
              className="submit-btn"
              style={{ width: 160 }}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
