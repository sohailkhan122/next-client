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
  RobotOutlined,
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
  const [aiLoading, setAiLoading] = useState<string | null>(null);

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
              bodyStyle={{ padding: 0 }}
            >
              {/* Gradient Cover */}
              <div className="h-32 bg-linear-to-br from-[#1e1b4b] via-[#4338ca] to-[#6366f1]" />

              <div className="px-8 pb-7">
                <div className="flex items-end gap-5 -mt-8 mb-4">
                  <div className="w-[72px] h-[80px] rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-[30px] text-indigo-500 shrink-0">
                    <BankOutlined />
                  </div>
                  <div className="mb-1">
                    <div className="text-xl font-bold text-slate-900">
                      {COMPANY_USER.company}
                    </div>
                    <div className="text-sm text-slate-500">{COMPANY_USER.email}</div>
                  </div>
                </div>

                <Row gutter={[24, 12]}>
                  <Col xs={24} sm={8}>
                    <div className="profile-info-item">
                      <TeamOutlined className="text-indigo-500" />
                      <span><strong>Contact:</strong> {COMPANY_USER.name}</span>
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
                      <span><strong>Joined:</strong> {COMPANY_USER.createdAt}</span>
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
              {jobs.map((job) => (
                <Col xs={24} md={12} key={job.id}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.15)' }}
                  >
                    <Card
                      className="rounded-2xl border border-slate-100 h-full"
                      bodyStyle={{ padding: '22px 24px' }}
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
                          <Tooltip title="Edit (coming soon)">
                            <Button shape="circle" icon={<EditOutlined />} size="small" className="border border-slate-200" />
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
      <Modal
        title={
          <div className="flex items-center gap-2.5 text-lg font-extrabold">
            <PlusOutlined className="text-indigo-500" /> Post a New Job
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
          className="mt-4"
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
              <Form.Item name="salary" label="Salary Range" rules={[{ required: true, message: 'Required' }]}>
                <Select size="large" placeholder="Select salary range">
                  {[
                    'Under $30,000',
                    '$30,000 – $50,000',
                    '$50,000 – $70,000',
                    '$70,000 – $90,000',
                    '$90,000 – $120,000',
                    '$120,000 – $150,000',
                    '$150,000 – $200,000',
                    '$200,000+',
                    'PKR 50,000 – 100,000/mo',
                    'PKR 100,000 – 150,000/mo',
                    'PKR 150,000 – 250,000/mo',
                    'PKR 250,000+/mo',
                    'Competitive / Negotiable',
                  ].map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
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
          <Form.Item
            name="description"
            label={
              <div className="flex w-full justify-between items-center">
                <span>Job Description</span>
                <Button
                  size="small"
                  type="dashed"
                  icon={<RobotOutlined className="text-indigo-500" />}
                  loading={aiLoading === 'description'}
                  onClick={(e) => { e.preventDefault(); handleAiGenerate('description'); }}
                  className="text-xs text-indigo-500 border-indigo-300"
                  style={{ height: 26 }}
                >
                  AI Generate
                </Button>
              </div>
            }
            rules={[{ required: true }]}
          >
            <TextArea rows={3} placeholder="Describe the role, team, and what you're looking for..." />
          </Form.Item>
          <Form.Item
            name="requirements"
            label={
              <div className="flex w-full justify-between items-center">
                <span>Requirements (one per line)</span>
                <Button
                  size="small"
                  type="dashed"
                  icon={<RobotOutlined className="text-indigo-500" />}
                  loading={aiLoading === 'requirements'}
                  onClick={(e) => { e.preventDefault(); handleAiGenerate('requirements'); }}
                  className="text-xs text-indigo-500 border-indigo-300"
                  style={{ height: 26 }}
                >
                  AI Generate
                </Button>
              </div>
            }
          >
            <TextArea rows={3} placeholder={`5+ years React experience\nStrong TypeScript skills\n...`} />
          </Form.Item>
          <Form.Item
            name="responsibilities"
            label={
              <div className="flex w-full justify-between items-center">
                <span>Responsibilities (one per line)</span>
                <Button
                  size="small"
                  type="dashed"
                  icon={<RobotOutlined className="text-indigo-500" />}
                  loading={aiLoading === 'responsibilities'}
                  onClick={(e) => { e.preventDefault(); handleAiGenerate('responsibilities'); }}
                  className="text-xs text-indigo-500 border-indigo-300"
                  style={{ height: 26 }}
                >
                  AI Generate
                </Button>
              </div>
            }
          >
            <TextArea rows={3} placeholder={`Build scalable features\nCode reviews\n...`} />
          </Form.Item>
          <Form.Item
            name="benefits"
            label={
              <div className="flex w-full justify-between items-center">
                <span>Benefits (one per line)</span>
                <Button
                  size="small"
                  type="dashed"
                  icon={<RobotOutlined className="text-indigo-500" />}
                  loading={aiLoading === 'benefits'}
                  onClick={(e) => { e.preventDefault(); handleAiGenerate('benefits'); }}
                  className="text-xs text-indigo-500 border-indigo-300"
                  style={{ height: 26 }}
                >
                  AI Generate
                </Button>
              </div>
            }
          >
            <TextArea rows={2} placeholder={`Health insurance\nRemote work\n...`} />
          </Form.Item>
          <div className="flex gap-3 justify-end mt-2">
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
