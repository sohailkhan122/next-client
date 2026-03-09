'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const { Option } = Select;

interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  experience: string;
  deadline: string;
  type: string;
  category: string;
  applicants: number;
}

const JOBS: Job[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    companyName: 'TechCorp',
    location: 'New York, USA',
    salary: '$80,000 - $100,000',
    experience: '2-4 years',
    deadline: '2026-04-15',
    type: 'Full-time',
    category: 'Engineering',
    applicants: 42,
  },
  {
    id: 2,
    title: 'Backend Engineer',
    companyName: 'DataSystems',
    location: 'San Francisco, USA',
    salary: '$90,000 - $120,000',
    experience: '3-5 years',
    deadline: '2026-04-20',
    type: 'Full-time',
    category: 'Engineering',
    applicants: 35,
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    companyName: 'CreativeHub',
    location: 'Remote',
    salary: '$60,000 - $80,000',
    experience: '1-3 years',
    deadline: '2026-04-10',
    type: 'Remote',
    category: 'Design',
    applicants: 28,
  },
  {
    id: 4,
    title: 'Data Analyst',
    companyName: 'InsightCo',
    location: 'Chicago, USA',
    salary: '$70,000 - $90,000',
    experience: '2-3 years',
    deadline: '2026-04-25',
    type: 'Full-time',
    category: 'Analytics',
    applicants: 19,
  },
  {
    id: 5,
    title: 'Marketing Intern',
    companyName: 'BrandBoost',
    location: 'Austin, USA',
    salary: '$20/hr',
    experience: '0-1 year',
    deadline: '2026-03-30',
    type: 'Internship',
    category: 'Marketing',
    applicants: 55,
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    companyName: 'CloudBase',
    location: 'Seattle, USA',
    salary: '$100,000 - $130,000',
    experience: '4-6 years',
    deadline: '2026-05-01',
    type: 'Contract',
    category: 'Engineering',
    applicants: 14,
  },
  {
    id: 7,
    title: 'Product Manager',
    companyName: 'LaunchPad',
    location: 'Remote',
    salary: '$95,000 - $115,000',
    experience: '3-6 years',
    deadline: '2026-04-18',
    type: 'Remote',
    category: 'Management',
    applicants: 31,
  },
  {
    id: 8,
    title: 'React Native Developer',
    companyName: 'MobileFirst',
    location: 'Boston, USA',
    salary: '$85,000 - $105,000',
    experience: '2-4 years',
    deadline: '2026-04-22',
    type: 'Part-time',
    category: 'Engineering',
    applicants: 23,
  },
];

const typeColors: Record<string, string> = {
  'Full-time': 'green',
  'Part-time': 'blue',
  Remote: 'purple',
  Contract: 'orange',
  Internship: 'cyan',
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudentPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filtered, setFiltered] = useState<Job[]>(JOBS);

  useEffect(() => {
    let result = [...JOBS];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') result = result.filter((j) => j.type === typeFilter);
    if (categoryFilter !== 'all') result = result.filter((j) => j.category === categoryFilter);
    setFiltered(result);
  }, [search, typeFilter, categoryFilter]);

  const categories = Array.from(new Set(JOBS.map((j) => j.category)));

  return (
    <div className="page-bg">
      <Navbar title="Job Board" />

      <div className="page-content">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="student-hero"
        >
          <h1 className="student-hero-title">
            Find Your <span className="hero-accent-dark">Dream Job</span>
          </h1>
          <p className="student-hero-sub">
            Explore {JOBS.length} opportunities from top companies worldwide
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="filters-bar"
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search job title, company, location…"
            size="large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, borderRadius: 10 }}
            allowClear
          />
          <Select
            size="large"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 160 }}
          >
            <Option value="all">All Types</Option>
            {['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map((t) => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
          <Select
            size="large"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 180 }}
          >
            <Option value="all">All Categories</Option>
            {categories.map((c) => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
        </motion.div>

        {/* Results info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 20, color: '#64748b', fontSize: 14 }}
        >
          <FilterOutlined style={{ marginRight: 6 }} />
          Showing <strong>{filtered.length}</strong> of <strong>{JOBS.length}</strong> jobs
        </motion.div>

        {/* Job Cards */}
        {filtered.length === 0 ? (
          <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
            <Empty description="No jobs match your search. Try adjusting filters." />
          </Card>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <Row gutter={[20, 20]}>
              {filtered.map((job) => (
                <Col xs={24} md={12} xl={8} key={job.id}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className="job-card"
                      style={{ borderRadius: 18, border: '1px solid #f1f5f9', height: '100%' }}
                      bodyStyle={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            color: '#6366f1',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {job.companyName.charAt(0)}
                        </div>
                        <Tag color={typeColors[job.type] || 'default'} style={{ borderRadius: 20, fontWeight: 600 }}>
                          {job.type}
                        </Tag>
                      </div>

                      <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: 13.5, color: '#6366f1', fontWeight: 600, marginBottom: 12 }}>
                        {job.companyName}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <EnvironmentOutlined /> {job.location}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <DollarOutlined /> {job.salary}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <TeamOutlined /> {job.experience}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ClockCircleOutlined /> Deadline: {job.deadline}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 'auto' }}>
                        <Badge
                          count={job.applicants || 0}
                          showZero
                          style={{ background: '#e0e7ff', color: '#6366f1', fontWeight: 700, boxShadow: 'none', fontSize: 11 }}
                        >
                          <span style={{ fontSize: 12, color: '#94a3b8', paddingRight: 8 }}>applicants</span>
                        </Badge>
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          shape="round"
                          style={{ background: '#6366f1', borderColor: '#6366f1', fontWeight: 600 }}
                          onClick={() => router.push('/jobs/' + job.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        )}
      </div>
    </div>
  );
}
