'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
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
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';

const { TextArea } = Input;

interface Job {
  id: string;
  title: string;
  companyName: string;
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

const JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    companyName: 'TechCorp',
    location: 'New York, USA',
    salary: '$80,000 - $100,000',
    experience: '2-4 years',
    deadline: '2026-04-15',
    type: 'Full-time',
    category: 'Engineering',
    applicants: 42,
    postedAt: '2026-03-01',
    description: 'Build modern, responsive web interfaces using React and TypeScript. Work closely with the design and product teams to deliver exceptional user experiences.',
    requirements: ['3+ years React experience', 'Strong TypeScript skills', 'CSS/Tailwind proficiency', 'Familiarity with REST APIs'],
    responsibilities: ['Build scalable UI components', 'Conduct code reviews', 'Collaborate with design team', 'Optimize for performance'],
    benefits: ['Health insurance', 'Remote work option', '401k matching', 'Annual learning budget'],
  },
  {
    id: '2',
    title: 'Backend Engineer',
    companyName: 'DataSystems',
    location: 'San Francisco, USA',
    salary: '$90,000 - $120,000',
    experience: '3-5 years',
    deadline: '2026-04-20',
    type: 'Full-time',
    category: 'Engineering',
    applicants: 35,
    postedAt: '2026-03-02',
    description: 'Design and build scalable backend services and APIs for our data platform serving millions of users.',
    requirements: ['Node.js expertise', 'Database design experience', 'REST & GraphQL knowledge', 'AWS/GCP experience'],
    responsibilities: ['Design microservices', 'Database optimization', 'API documentation', 'Performance monitoring'],
    benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Home office stipend'],
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    companyName: 'CreativeHub',
    location: 'Remote',
    salary: '$60,000 - $80,000',
    experience: '1-3 years',
    deadline: '2026-04-10',
    type: 'Remote',
    category: 'Design',
    applicants: 28,
    postedAt: '2026-03-03',
    description: 'Create beautiful and intuitive user experiences for web and mobile products.',
    requirements: ['Proficiency in Figma', 'User research skills', 'Prototyping experience', 'Design system knowledge'],
    responsibilities: ['Create wireframes & prototypes', 'Conduct user testing', 'Maintain design system', 'Work with developers'],
    benefits: ['Fully remote', 'Flexible schedule', 'Design tools provided', 'Professional development'],
  },
  {
    id: '4',
    title: 'Data Analyst',
    companyName: 'InsightCo',
    location: 'Chicago, USA',
    salary: '$70,000 - $90,000',
    experience: '2-3 years',
    deadline: '2026-04-25',
    type: 'Full-time',
    category: 'Analytics',
    applicants: 19,
    postedAt: '2026-03-04',
    description: 'Turn complex data into actionable business insights to drive strategic decisions.',
    requirements: ['SQL expertise', 'Python/R proficiency', 'Tableau/Power BI experience', 'Statistical analysis skills'],
    responsibilities: ['Build dashboards', 'Run A/B tests', 'Data pipeline maintenance', 'Present findings to stakeholders'],
    benefits: ['Health & dental', 'Gym membership', 'Conference budget', 'Hybrid work'],
  },
  {
    id: '5',
    title: 'Marketing Intern',
    companyName: 'BrandBoost',
    location: 'Austin, USA',
    salary: '$20/hr',
    experience: '0-1 year',
    deadline: '2026-03-30',
    type: 'Internship',
    category: 'Marketing',
    applicants: 55,
    postedAt: '2026-03-05',
    description: 'Support the marketing team with campaigns, content creation and social media management.',
    requirements: ['Marketing or related degree in progress', 'Social media knowledge', 'Strong communication skills'],
    responsibilities: ['Assist with social media', 'Help create content', 'Support email campaigns', 'Market research'],
    benefits: ['Mentorship program', 'Paid internship', 'Networking events', 'Potential full-time offer'],
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    companyName: 'CloudBase',
    location: 'Seattle, USA',
    salary: '$100,000 - $130,000',
    experience: '4-6 years',
    deadline: '2026-05-01',
    type: 'Contract',
    category: 'Engineering',
    applicants: 14,
    postedAt: '2026-03-06',
    description: 'Build and maintain CI/CD pipelines, infrastructure, and cloud environments.',
    requirements: ['Kubernetes & Docker', 'AWS/Azure/GCP expertise', 'Terraform/Ansible', 'Strong scripting skills'],
    responsibilities: ['Manage cloud infrastructure', 'Automate deployments', 'Monitor system reliability', 'Security hardening'],
    benefits: ['Competitive contract rate', 'Remote allowed', 'Latest tooling'],
  },
  {
    id: '7',
    title: 'Product Manager',
    companyName: 'LaunchPad',
    location: 'Remote',
    salary: '$95,000 - $115,000',
    experience: '3-6 years',
    deadline: '2026-04-18',
    type: 'Remote',
    category: 'Management',
    applicants: 31,
    postedAt: '2026-03-07',
    description: 'Drive product vision and strategy for our SaaS platform used by over 50,000 businesses.',
    requirements: ['PM experience in SaaS', 'Agile/Scrum knowledge', 'Data-driven mindset', 'Excellent communication'],
    responsibilities: ['Define product roadmap', 'Work with engineering', 'Gather user feedback', 'Track KPIs'],
    benefits: ['Equity package', 'Fully remote', 'Wellness allowance', 'Unlimited PTO'],
  },
  {
    id: '8',
    title: 'React Native Developer',
    companyName: 'MobileFirst',
    location: 'Boston, USA',
    salary: '$85,000 - $105,000',
    experience: '2-4 years',
    deadline: '2026-04-22',
    type: 'Part-time',
    category: 'Engineering',
    applicants: 23,
    postedAt: '2026-03-08',
    description: 'Build cross-platform mobile apps for iOS and Android using React Native.',
    requirements: ['React Native expertise', 'TypeScript proficiency', 'App Store / Play Store deployments', 'Redux/Zustand'],
    responsibilities: ['Develop mobile features', 'Performance optimisation', 'App store releases', 'Bug fixing'],
    benefits: ['Part-time flexible hours', 'Remote-friendly', 'Equity options'],
  },
];

const CURRENT_STUDENT = {
  name: 'Alice Johnson',
  email: 'student@test.com',
};

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
  const [applyModal, setApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const found = JOBS.find((j) => j.id === jobId);
    if (!found) { router.push('/student'); return; }
    setJob(found);
  }, [jobId, router]);

  const handleApply = async (values: { coverLetter: string }) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setApplied(true);
    setSubmitting(false);
    setApplyModal(false);
    form.resetFields();
    messageApi.success('Application submitted successfully! 🎉');
  };

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
                    icon={<CheckCircleOutlined />}
                    disabled
                    style={{ borderRadius: 12, background: '#ecfdf5', color: '#10b981', borderColor: '#a7f3d0', fontWeight: 700, height: 48, padding: '0 28px' }}
                  >
                    Applied ✓
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
                    <Alert
                      message="You've already applied for this job."
                      type="success"
                      showIcon
                      style={{ borderRadius: 10 }}
                    />
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
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{CURRENT_STUDENT.name}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{CURRENT_STUDENT.email}</div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleApply} requiredMark={false}>
          <Form.Item
            name="coverLetter"
            label={<span style={{ fontWeight: 600 }}>Cover Letter</span>}
            rules={[
              { required: true, message: 'Please write a cover letter' },
              { min: 80, message: 'At least 80 characters' },
            ]}
          >
            <TextArea
              rows={6}
              placeholder={`Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position at ${job.companyName}...`}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
