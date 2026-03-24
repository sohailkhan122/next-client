'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  message,
  Popconfirm,
  Row,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  BankOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
// import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { getAllUsers, updateUserStatus, AuthUser } from '../lib/authApi';
import { apiAdminGetAllJobs, Job } from '../lib/jobsApi';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const statusColor: Record<string, string> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  blocked: 'default',
};

const roleColor: Record<string, string> = {
  admin: 'red',
  company: 'orange',
  student: 'geekblue',
};

const roleAvatarClass: Record<AuthUser['role'], string> = {
  admin: '!bg-red-500',
  company: '!bg-amber-500',
  student: '!bg-indigo-500',
};

export default function AdminDashboard() {
  // const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    try {
      const [fetchedUsers, fetchedJobs] = await Promise.all([
        getAllUsers(),
        apiAdminGetAllJobs(),
      ]);
      setUsers(fetchedUsers);
      setJobs(fetchedJobs);
    } catch {
      messageApi.error('Failed to load data.');
    }
  };

  useEffect(() => {
    // if (!loading) {
    //   if (!user) { router.push('/login'); return; }
    //   if (user.role !== 'admin') { router.push('/login'); return; }
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveUser = async (id: string) => {
    setActionLoading(id);
    try {
      await updateUserStatus(id, 'approved');
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, status: 'approved' as const } : u));
      messageApi.success('User approved successfully!');
    } catch {
      messageApi.error('Failed to approve user.');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (id: string) => {
    setActionLoading(id);
    try {
      await updateUserStatus(id, 'blocked');
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, status: 'blocked' as const } : u));
      messageApi.warning('User blocked.');
    } catch {
      messageApi.error('Failed to block user.');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = users.filter((u) => u.status === 'pending');
  const companies = users.filter((u) => u.role === 'company');

  const statCards = [
    { title: 'Total Users', value: users.length, icon: <TeamOutlined />, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
    { title: 'Pending Approvals', value: pending.length, icon: <ClockCircleOutlined />, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
    { title: 'Companies', value: companies.length, icon: <BankOutlined />, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
    { title: 'Active Jobs', value: jobs.length, icon: <FileTextOutlined />, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  ];

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: AuthUser) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            className={`${roleAvatarClass[record.role]} shrink-0`}
            icon={<UserOutlined />}
          />
          <div>
            <div className="text-sm font-semibold text-slate-900">{record.name}</div>
            <div className="text-xs text-slate-400">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColor[role]} className="rounded-full font-semibold capitalize">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={statusColor[status] as 'success' | 'warning' | 'error'}
          text={<span className="font-semibold capitalize">{status}</span>}
        />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <span className="text-[13px] text-slate-500">{date}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AuthUser) => {
        if (record.role === 'admin') return <span className="text-xs text-slate-400">-</span>;
        return (
          <div className="flex gap-2">
            {record.status !== 'approved' && (
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  shape="round"
                  size="small"
                  loading={actionLoading === (record._id || record.id)}
                  icon={<CheckCircleOutlined />}
                  className="border-emerald-500! bg-emerald-500! font-semibold!"
                  onClick={() => approveUser(record._id || record.id)}
                >
                  Approve
                </Button>
              </Tooltip>
            )}
            {record.status !== 'blocked' && (
              <Popconfirm
                title="Block this user?"
                onConfirm={() => rejectUser(record._id || record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  shape="round"
                  size="small"
                  loading={actionLoading === (record._id || record.id)}
                  icon={<CloseCircleOutlined />}
                  className="font-semibold"
                >
                  Reject
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  // if (loading) return null;

  return (
    <div className="page-bg">
      {contextHolder}
      <Navbar title="Admin Dashboard" />

      <div className="page-content">
        {/* Stats */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <Row gutter={[20, 20]} className="mb-7">
            {statCards.map((s, i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <motion.div variants={fadeUp}>
                  <Card
                    classNames={{ body: 'px-6 py-5' }}
                    className="stat-card-new rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[22px] ${s.iconBg} ${s.iconColor}`}>
                        {s.icon}
                      </div>
                      <Statistic
                        title={<span className="text-[13px] text-slate-500">{s.title}</span>}
                        value={s.value}
                        formatter={(value) => <span className="text-[28px] font-extrabold text-slate-900">{value}</span>}
                      />
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Pending Section */}
        {pending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card
              title={
                <div className="flex items-center gap-2.5">
                  <ClockCircleOutlined className="text-lg text-amber-500" />
                  <span className="font-bold">Pending Approvals</span>
                  <Tag color="warning" className="ml-1 rounded-full font-bold">
                    {pending.length}
                  </Tag>
                </div>
              }
              className="mb-6 rounded-2xl border border-amber-200"
              classNames={{ body: 'p-0' }}
            >
              <Table
                dataSource={pending}
                columns={columns}
                rowKey={(r) => r._id || r.id}
                pagination={false}
                size="middle"
              />
            </Card>
          </motion.div>
        )}

        {/* All Users */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card
            title={
              <div className="flex items-center gap-2.5">
                <TeamOutlined className="text-lg text-indigo-500" />
                <span className="font-bold">All Users</span>
                <Tag color="purple" className="ml-1 rounded-full font-bold">
                  {users.length}
                </Tag>
              </div>
            }
            className="rounded-2xl border border-slate-100"
            classNames={{ body: 'p-0' }}
          >
            {users.length === 0 ? (
              <Empty className="py-10" description="No users found" />
            ) : (
              <Table
                dataSource={users}
                columns={columns}
                rowKey={(r) => r._id || r.id}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                size="middle"
              />
            )}
          </Card>
        </motion.div>

        {/* Jobs Overview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card
            title={
              <div className="flex items-center gap-2.5">
                <FileTextOutlined className="text-lg text-blue-500" />
                <span className="font-bold">Posted Jobs</span>
                <Tag color="blue" className="ml-1 rounded-full font-bold">
                  {jobs.length}
                </Tag>
              </div>
            }
            className="mt-6 rounded-2xl border border-slate-100"
            classNames={{ body: 'p-0' }}
          >
            <Table
              dataSource={jobs}
              rowKey={(r: Job) => r._id}
              pagination={{ pageSize: 6, showSizeChanger: false }}
              size="middle"
              columns={[
                {
                  title: 'Job Title',
                  dataIndex: 'title',
                  render: (t: string) => <span className="font-semibold text-slate-900">{t}</span>,
                },
                {
                  title: 'Company',
                  dataIndex: 'companyId',
                  render: (companyId: Job['companyId']) => {
                    if (typeof companyId === 'object' && companyId !== null) {
                      const company = companyId as { name?: string; company?: string; companyName?: string };
                      return <span className="text-slate-500">{company.name || company.company || company.companyName || 'Company'}</span>;
                    }
                    return <span className="text-slate-500">Company</span>;
                  },
                },
                {
                  title: 'Type',
                  dataIndex: 'type',
                  render: (t: string) => <Tag color="geekblue" className="rounded-full">{t}</Tag>,
                },
                { title: 'Location', dataIndex: 'location', render: (l: string) => <span className="text-[13px] text-slate-500">{l}</span> },
                { title: 'Applicants', dataIndex: 'applicants', render: (a: Job['applicants']) => <Tag color="green">{a?.length || 0}</Tag> },
              ]}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
