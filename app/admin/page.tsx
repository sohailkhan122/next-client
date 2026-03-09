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
import { getAllUsers, getAllJobs, updateUserStatus, AuthUser } from '../lib/authApi';

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

export default function AdminDashboard() {
  // const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    try {
      // const [fetchedUsers, fetchedJobs] = await Promise.all([getAllUsers(), getAllJobs()]);
      const fetchedUsers = await getAllUsers();
      // const fetchedJobs = await getAllJobs();
      setUsers(fetchedUsers);
      // setJobs(fetchedJobs);
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
    try {
      await updateUserStatus(id, 'approved');
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, status: 'approved' as const } : u));
      messageApi.success('User approved successfully!');
    } catch {
      messageApi.error('Failed to approve user.');
    }
  };

  const rejectUser = async (id: string) => {
    try {
      await updateUserStatus(id, 'blocked');
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, status: 'blocked' as const } : u));
      messageApi.warning('User blocked.');
    } catch {
      messageApi.error('Failed to block user.');
    }
  };

  const pending = users.filter((u) => u.status === 'pending');
  const companies = users.filter((u) => u.role === 'company');

  const statCards = [
    { title: 'Total Users', value: users.length, icon: <TeamOutlined />, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Pending Approvals', value: pending.length, icon: <ClockCircleOutlined />, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Companies', value: companies.length, icon: <BankOutlined />, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Active Jobs', value: jobs.length, icon: <FileTextOutlined />, color: '#3b82f6', bg: '#eff6ff' },
  ];

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: AuthUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            style={{
              background: record.role === 'admin' ? '#ef4444' : record.role === 'company' ? '#f59e0b' : '#6366f1',
              flexShrink: 0,
            }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColor[role]} style={{ borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' }}>
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
          text={<span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>}
        />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <span style={{ color: '#64748b', fontSize: 13 }}>{date}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AuthUser) => {
        if (record.role === 'admin') return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {record.status !== 'approved' && (
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  shape="round"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
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
                  icon={<CloseCircleOutlined />}
                  style={{ fontWeight: 600 }}
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
          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
            {statCards.map((s, i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <motion.div variants={fadeUp}>
                  <Card
                    className="stat-card-new"
                    style={{ borderRadius: 16, border: '1px solid #f1f5f9' }}
                    bodyStyle={{ padding: '20px 24px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: s.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          color: s.color,
                          flexShrink: 0,
                        }}
                      >
                        {s.icon}
                      </div>
                      <Statistic
                        title={<span style={{ fontSize: 13, color: '#64748b' }}>{s.title}</span>}
                        value={s.value}
                        valueStyle={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
                  <span style={{ fontWeight: 700 }}>Pending Approvals</span>
                  <Tag color="warning" style={{ borderRadius: 20, fontWeight: 700, marginLeft: 4 }}>
                    {pending.length}
                  </Tag>
                </div>
              }
              style={{ borderRadius: 16, border: '1px solid #fde68a', marginBottom: 24 }}
              bodyStyle={{ padding: 0 }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TeamOutlined style={{ color: '#6366f1', fontSize: 18 }} />
                <span style={{ fontWeight: 700 }}>All Users</span>
                <Tag color="purple" style={{ borderRadius: 20, fontWeight: 700, marginLeft: 4 }}>
                  {users.length}
                </Tag>
              </div>
            }
            style={{ borderRadius: 16, border: '1px solid #f1f5f9' }}
            bodyStyle={{ padding: 0 }}
          >
            {users.length === 0 ? (
              <Empty style={{ padding: 40 }} description="No users found" />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileTextOutlined style={{ color: '#3b82f6', fontSize: 18 }} />
                <span style={{ fontWeight: 700 }}>Posted Jobs</span>
                <Tag color="blue" style={{ borderRadius: 20, fontWeight: 700, marginLeft: 4 }}>
                  {jobs.length}
                </Tag>
              </div>
            }
            style={{ borderRadius: 16, border: '1px solid #f1f5f9', marginTop: 24 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={jobs}
              rowKey="id"
              pagination={{ pageSize: 6, showSizeChanger: false }}
              size="middle"
              columns={[
                {
                  title: 'Job Title',
                  dataIndex: 'title',
                  render: (t: string) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{t}</span>,
                },
                { title: 'Company', dataIndex: 'companyName', render: (c: string) => <span style={{ color: '#64748b' }}>{c}</span> },
                {
                  title: 'Type',
                  dataIndex: 'type',
                  render: (t: string) => <Tag color="geekblue" style={{ borderRadius: 20 }}>{t}</Tag>,
                },
                { title: 'Location', dataIndex: 'location', render: (l: string) => <span style={{ color: '#64748b', fontSize: 13 }}>{l}</span> },
                { title: 'Applicants', dataIndex: 'applicants', render: (a: number) => <Tag color="green">{a || 0}</Tag> },
              ]}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
