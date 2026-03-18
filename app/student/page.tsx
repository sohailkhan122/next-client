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
  Spin,
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
  FileTextOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { apiGetMe } from '../lib/authApi';
import { apiGetAllJobs, type Job as ApiJob } from '../lib/jobsApi';

const { Option } = Select;

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
}

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
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filtered, setFiltered] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiGetMe();
        setProfileCompleted(Boolean(me.profileCompleted));
      } catch {
        router.replace('/login');
        return;
      }
      try {
        const apiJobs: ApiJob[] = await apiGetAllJobs();
        const mapped: Job[] = apiJobs.map((j) => ({
          id: j._id,
          title: j.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          companyName: (j.companyId as any)?.name ?? (j.companyId as any)?.company ?? 'Company',
          location: j.location,
          salary: j.salary,
          experience: j.experience,
          deadline: j.deadline.substring(0, 10),
          type: j.type,
          category: j.category,
          applicants: j.applicants?.length ?? 0,
        }));
        setAllJobs(mapped);
        setFiltered(mapped);
      } catch {
        setAllJobs([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  useEffect(() => {
    let result = [...allJobs];
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
  }, [search, typeFilter, categoryFilter, allJobs]);

  const categories = Array.from(new Set(allJobs.map((j) => j.category)));

  if (loading) {
    return (
      <div className="page-bg">
        <Navbar title="Job Board" />
        <div className="page-content flex items-center justify-center" style={{ minHeight: 400 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

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
            Explore {allJobs.length} opportunities from top companies worldwide
          </p>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            size="large"
            shape="round"
            style={{ marginTop: 18, background: '#6366f1', borderColor: '#6366f1', fontWeight: 700, fontSize: 15, height: 46, paddingInline: 28 }}
            onClick={() => router.push(profileCompleted ? '/resume' : '/resume/create')}
          >
            {profileCompleted ? 'View Resume' : 'Create Resume'}
          </Button>
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
          Showing <strong>{filtered.length}</strong> of <strong>{allJobs.length}</strong> jobs
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
                      styles={{
                        body: {
                          padding: '22px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                        },
                      }}
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
