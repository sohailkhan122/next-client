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
  Skeleton,
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
  FileTextOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { CardSkeleton } from '../components/skeletons';
import { apiGetMe } from '../lib/authApi';
import { apiGetAllJobs, type Job as ApiJob } from '../lib/jobsApi';
import { apiGetMyStudentDetail } from '../lib/studentDetailApi';

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
  relevanceScore: number;
}

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();

const tokenize = (value: string) =>
  normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);

const computeRelevanceScore = (job: Pick<Job, 'title' | 'category'>, requiredJob: string, requiredField: string) => {
  const title = normalizeText(job.title);
  const category = normalizeText(job.category);
  const requiredJobNorm = normalizeText(requiredJob);
  const fieldNorm = normalizeText(requiredField);

  let score = 0;

  if (requiredJobNorm && title.includes(requiredJobNorm)) {
    score += 6;
  }
  if (fieldNorm && (title.includes(fieldNorm) || category.includes(fieldNorm))) {
    score += 4;
  }

  const keywords = [...new Set([...tokenize(requiredJob), ...tokenize(requiredField)])];
  for (const word of keywords) {
    if (title.includes(word)) score += 2;
    if (category.includes(word)) score += 1;
  }

  return score;
};

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
  const [requiredJob, setRequiredJob] = useState('');
  const [requiredField, setRequiredField] = useState('');
  const [showRelevantOnly, setShowRelevantOnly] = useState(true);

  useEffect(() => {
    const load = async () => {
      let preferredJob = '';
      let preferredField = '';

      try {
        const me = await apiGetMe();
        setProfileCompleted(Boolean(me.profileCompleted));
        try {
          const detail = await apiGetMyStudentDetail();
          preferredJob = (detail.requiredJob ?? '').trim();
          preferredField = (detail.fieldOfStudy ?? '').trim();
          setRequiredJob(preferredJob);
          setRequiredField(preferredField);
        } catch {
          setRequiredJob('');
          setRequiredField('');
        }
      } catch {
        router.replace('/login');
        return;
      }
      try {
        const apiJobs: ApiJob[] = await apiGetAllJobs();
        const mapped: Job[] = apiJobs
          .map((j) => {
            const job: Job = {
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
              relevanceScore: computeRelevanceScore(
                { title: j.title, category: j.category },
                preferredJob,
                preferredField,
              ),
            };
            return job;
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
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

    // Filter strictly by preference ONLY if we haven't interacted with filters yet
    if (showRelevantOnly && requiredJob.trim()) {
      const q = requiredJob.toLowerCase();
      result = result.filter((j) => j.title.toLowerCase().includes(q));
    }

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
    result.sort((a, b) => b.relevanceScore - a.relevanceScore);
    setFiltered(result);
  }, [search, typeFilter, categoryFilter, allJobs, requiredJob, requiredField]);

  const categories = Array.from(new Set(allJobs.map((j) => j.category)));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setShowRelevantOnly(false);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setShowRelevantOnly(false);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setShowRelevantOnly(false);
  };

  if (loading) {
    return (
      <div className="page-bg">
        <Navbar title="Job Board" />
        <div className="page-content">
          <div className="student-hero">
            <Skeleton.Input active className="max-w-full" style={{ height: 40, width: 256 }} />
            <div className="mt-3">
              <Skeleton.Input active className="max-w-full" style={{ height: 20, width: 320 }} />
            </div>
            <div className="mt-5">
              <Skeleton.Button active className="rounded-full" style={{ height: 46, width: 160 }} />
            </div>
          </div>

          <div className="filters-bar">
            <Skeleton.Input active className="w-full" style={{ height: 40 }} />
            <Skeleton.Input active style={{ height: 40, width: 160 }} />
            <Skeleton.Input active style={{ height: 40, width: 176 }} />
          </div>

          <div className="mb-5 mt-5">
            <Skeleton.Input active className="max-w-full" style={{ height: 16, width: 288 }} />
          </div>

          <CardSkeleton count={6} />
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
            onChange={handleSearchChange}
            style={{ flex: 1, minWidth: 220, borderRadius: 10 }}
            allowClear
          />
          <Select
            size="large"
            value={typeFilter}
            onChange={handleTypeChange}
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
            onChange={handleCategoryChange}
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
          {!search.trim() && typeFilter === 'all' && categoryFilter === 'all' && (requiredJob || requiredField) && (
            <span style={{ marginLeft: 8, color: '#4f46e5', fontWeight: 600 }}>
              (Relevant to your profile)
            </span>
          )}
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
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {requiredJob && job.title.toLowerCase().includes(requiredJob.toLowerCase()) && (
                            <Tag color="geekblue" style={{ borderRadius: 20, fontWeight: 700 }}>
                              Relevant
                            </Tag>
                          )}
                          <Tag color={typeColors[job.type] || 'default'} style={{ borderRadius: 20, fontWeight: 600 }}>
                            {job.type}
                          </Tag>
                        </div>
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
