'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  BankOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  EditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

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

const COMPANY_USER = {
  id: 'company-1',
  name: 'TechCorp HR',
  email: 'company@test.com',
  company: 'TechCorp',
  createdAt: '2026-01-10',
};

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    companyId: 'company-1',
    companyName: 'TechCorp',
    location: 'New York, USA',
    type: 'Full-time',
    salary: '$80,000 - $100,000',
    description: 'Build modern web interfaces using React and TypeScript.',
    requirements: ['3+ years React experience', 'Strong TypeScript skills', 'CSS proficiency'],
    responsibilities: ['Build scalable UI components', 'Code reviews', 'Collaborate with design team'],
    benefits: ['Health insurance', 'Remote work option', '401k matching'],
    deadline: '2026-04-15',
    postedAt: '2026-03-01',
    category: 'Engineering',
    experience: '2-4 years',
    applicants: 42,
  },
  {
    id: 'job-2',
    title: 'Backend Engineer',
    companyId: 'company-1',
    companyName: 'TechCorp',
    location: 'San Francisco, USA',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    description: 'Design and build scalable backend services and APIs.',
    requirements: ['Node.js expertise', 'Database design experience', 'REST API knowledge'],
    responsibilities: ['Design microservices', 'Database optimization', 'API documentation'],
    benefits: ['Health insurance', 'Stock options', 'Flexible hours'],
    deadline: '2026-04-20',
    postedAt: '2026-03-02',
    category: 'Engineering',
    experience: '3-5 years',
    applicants: 35,
  },
];

const { TextArea } = Input;
const { Option } = Select;

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
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleCreateJob = async (values: Record<string, string>) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const newJob: Job = {
      id: 'job-' + Date.now(),
      title: values.title,
      companyId: COMPANY_USER.id,
      companyName: COMPANY_USER.company,
      location: values.location,
      type: values.type as Job['type'],
      salary: values.salary,
      description: values.description,
      requirements: values.requirements
        ? values.requirements.split('\n').filter((r) => r.trim())
        : [],
      responsibilities: values.responsibilities
        ? values.responsibilities.split('\n').filter((r) => r.trim())
        : [],
      benefits: values.benefits
        ? values.benefits.split('\n').filter((r) => r.trim())
        : [],
      deadline: values.deadline,
      postedAt: new Date().toISOString().split('T')[0],
      category: values.category,
      experience: values.experience,
      applicants: 0,
    };

    setJobs((prev) => [...prev, newJob]);
    setSubmitting(false);
    setModalOpen(false);
    form.resetFields();
    messageApi.success('Job posted successfully! 🎉');
  };

  return (
    <div className="page-bg">
      {contextHolder}
      <Navbar title="Company Portal" />

      <div className="page-content">

        {/* Company Profile Card */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Card
              style={{ borderRadius: 20, marginBottom: 24, border: '1px solid #f1f5f9', overflow: 'hidden' }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Cover */}
              <div style={{
                height: 120,
                background: 'linear-gradient(135deg, #1e1b4b, #4338ca, #6366f1)',
                position: 'relative',
              }} />

              <div style={{ padding: '0 32px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -36, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 16,
                      background: '#fff',
                      border: '4px solid #fff',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                      color: '#6366f1',
                      flexShrink: 0,
                    }}
                  >
                    <BankOutlined />
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                      {COMPANY_USER.company}
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>{COMPANY_USER.email}</div>
                  </div>
                </div>

                <Row gutter={[24, 12]}>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <TeamOutlined style={{ color: '#6366f1' }} />
                      <span><strong>Contact:</strong> {COMPANY_USER.name}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <FileTextOutlined style={{ color: '#6366f1' }} />
                      <span><strong>Jobs Posted:</strong> {jobs.length}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <ClockCircleOutlined style={{ color: '#6366f1' }} />
                      <span><strong>Joined:</strong> {COMPANY_USER.createdAt}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </motion.div>

          {/* Jobs Section Header */}
          <motion.div variants={fadeUp}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Posted Jobs</h2>
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
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
              <Card style={{ borderRadius: 16, textAlign: 'center', border: '1px dashed #c7d2fe' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <p style={{ color: '#64748b', marginBottom: 16 }}>
                        No jobs posted yet. Create your first job listing!
                      </p>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                        Post a Job
                      </Button>
                    </div>
                  }
                />
              </Card>
            </motion.div>
          ) : (
            <Row gutter={[20, 20]}>
              {jobs.map((job, i) => (
                <Col xs={24} md={12} key={job.id}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.15)' }}
                  >
                    <Card
                      style={{ borderRadius: 16, border: '1px solid #f1f5f9', height: '100%' }}
                      bodyStyle={{ padding: '22px 24px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                            {job.title}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            <Tag color={typeColors[job.type] || 'default'} style={{ borderRadius: 20 }}>
                              {job.type}
                            </Tag>
                            <Tag color="geekblue" style={{ borderRadius: 20 }}>
                              {job.category}
                            </Tag>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ color: '#64748b', fontSize: 13 }}>
                              <EnvironmentOutlined style={{ marginRight: 4 }} />{job.location}
                            </span>
                            <span style={{ color: '#64748b', fontSize: 13 }}>
                              <DollarOutlined style={{ marginRight: 4 }} />{job.salary}
                            </span>
                            <span style={{ color: '#64748b', fontSize: 13 }}>
                              <TeamOutlined style={{ marginRight: 4 }} />{job.applicants || 0} applicants
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <Tooltip title="Edit (coming soon)">
                            <Button shape="circle" icon={<EditOutlined />} size="small" style={{ border: '1px solid #e2e8f0' }} />
                          </Tooltip>
                        </div>
                      </div>
                      <Divider style={{ margin: '14px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Posted: {job.postedAt}</span>
                        <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
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
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800 }}>
            <PlusOutlined style={{ color: '#6366f1' }} /> Post a New Job
          </div>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={660}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateJob}
          requiredMark={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={14}>
            <Col xs={24} sm={14}>
              <Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Senior Frontend Developer" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="type" label="Job Type" rules={[{ required: true, message: 'Required' }]}>
                <Select size="large" placeholder="Select type">
                  {['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map((t) => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col xs={24} sm={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input placeholder="e.g. Karachi, Pakistan" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="salary" label="Salary Range" rules={[{ required: true }]}>
                <Input placeholder="e.g. PKR 100,000 – 150,000/mo" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col xs={24} sm={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select category">
                  {['Engineering', 'Design', 'Product', 'Marketing', 'Data & AI', 'Finance', 'HR', 'Sales'].map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="experience" label="Experience Required" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select experience">
                  {['Entry level', '1–2 years', '2–4 years', '4+ years', '5+ years', '7+ years'].map((e) => (
                    <Option key={e} value={e}>{e}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="deadline" label="Application Deadline" rules={[{ required: true }]}>
            <Input type="date" size="large" />
          </Form.Item>
          <Form.Item name="description" label="Job Description" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Describe the role, team, and what you're looking for..." />
          </Form.Item>
          <Form.Item name="requirements" label="Requirements (one per line)">
            <TextArea rows={3} placeholder="5+ years React experience&#10;Strong TypeScript skills&#10;..." />
          </Form.Item>
          <Form.Item name="responsibilities" label="Responsibilities (one per line)">
            <TextArea rows={3} placeholder="Build scalable features&#10;Code reviews&#10;..." />
          </Form.Item>
          <Form.Item name="benefits" label="Benefits (one per line)">
            <TextArea rows={2} placeholder="Health insurance&#10;Remote work&#10;..." />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button size="large" onClick={() => { setModalOpen(false); form.resetFields(); }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              className="submit-btn"
              style={{ width: 160 }}
            >
              {submitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
