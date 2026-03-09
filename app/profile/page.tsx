'use client';

import React, { useState, useEffect } from 'react';
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
  Tag,
} from 'antd';
import {
  BankOutlined,
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

interface ProfileData {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  bio: string;
  createdAt: string;
}

const INITIAL_PROFILE: ProfileData = {
  name: 'TechCorp HR',
  email: 'company@test.com',
  company: 'TechCorp',
  role: 'Company',
  phone: '+1 (555) 000-0000',
  location: 'New York, USA',
  website: 'https://techcorp.com',
  linkedin: 'https://linkedin.com/company/techcorp',
  bio: 'TechCorp is a leading technology company specialising in building scalable software solutions for enterprise clients worldwide.',
  createdAt: '2026-01-10',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Auto-open edit modal if ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setEditOpen(true);
    }
  }, [searchParams]);

  const openEdit = () => {
    form.setFieldsValue(profile);
    setEditOpen(true);
  };

  const handleSave = async (values: ProfileData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setProfile((prev) => ({ ...prev, ...values }));
    setSaving(false);
    setEditOpen(false);
    messageApi.success('Profile updated successfully ✨');
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

  return (
    <div className="page-bg">
      {contextHolder}
      <Navbar title="Profile" />

      <div className="page-content">
        <motion.div variants={stagger} initial="hidden" animate="visible">

          {/* Profile Header Card */}
          <motion.div variants={fadeUp}>
            <Card
              className="rounded-[20px] mb-6 border border-slate-100 overflow-hidden"
              bodyStyle={{ padding: 0 }}
            >
              {/* Gradient Cover */}
              <div className="h-32 bg-linear-to-br from-[#1e1b4b] via-[#4338ca] to-[#6366f1] relative">
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
                      icon={<UserOutlined />}
                      className="border-4! border-white! shadow-lg shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    />
                    <div className="mb-0">
                      <div className="text-xl font-bold text-slate-900">{profile.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag color="purple" className="rounded-full m-0">{profile.role}</Tag>
                        <span className="text-sm text-slate-500">{profile.company}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="bg-slate-50 border border-indigo-100 rounded-xl px-4 py-3.5 mb-5 text-sm text-slate-600 leading-relaxed">
                    {profile.bio}
                  </div>
                )}

                <Row gutter={[32, 0]}>
                  <Col xs={24} md={12}>
                    <InfoRow icon={<MailOutlined />} label="Email" value={profile.email} />
                    <InfoRow icon={<PhoneOutlined />} label="Phone" value={profile.phone} />
                    <InfoRow icon={<EnvironmentOutlined />} label="Location" value={profile.location} />
                    <InfoRow icon={<CalendarOutlined />} label="Member Since" value={profile.createdAt} />
                  </Col>
                  <Col xs={24} md={12}>
                    <InfoRow icon={<BankOutlined />} label="Company" value={profile.company} />
                    <InfoRow icon={<GlobalOutlined />} label="Website" value={profile.website} />
                    <InfoRow icon={<LinkedinOutlined />} label="LinkedIn" value={profile.linkedin} />
                    <InfoRow icon={<FileTextOutlined />} label="Role" value={profile.role} />
                  </Col>
                </Row>
              </div>
            </Card>
          </motion.div>

          {/* Stats Strip */}
          <motion.div variants={fadeUp}>
            <Row gutter={[16, 16]}>
              {[
                { label: 'Jobs Posted', value: '2', color: 'text-indigo-500' },
                { label: 'Total Applicants', value: '77', color: 'text-emerald-500' },
                { label: 'Active Listings', value: '2', color: 'text-amber-500' },
              ].map((stat) => (
                <Col xs={24} sm={8} key={stat.label}>
                  <Card
                    className="rounded-2xl border border-slate-100 text-center mt-1"
                    bodyStyle={{ padding: '20px 16px' }}
                  >
                    <div className={`text-[28px] font-extrabold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[13px] text-slate-500 mt-1">{stat.label}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </motion.div>

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
          initialValues={profile}
          requiredMark={false}
          className="mt-4"
        >
          <Row gutter={14}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Required' }]}>
                <Input prefix={<UserOutlined className="text-indigo-500" />} size="large" placeholder="Your name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Required' }]}>
                <Input prefix={<BankOutlined className="text-indigo-500" />} size="large" placeholder="Company name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input prefix={<MailOutlined className="text-indigo-500" />} size="large" placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone">
                <Input prefix={<PhoneOutlined className="text-indigo-500" />} size="large" placeholder="+1 (555) 000-0000" />
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
              <Form.Item name="website" label="Website">
                <Input prefix={<GlobalOutlined className="text-indigo-500" />} size="large" placeholder="https://yoursite.com" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="linkedin" label="LinkedIn">
            <Input prefix={<LinkedinOutlined className="text-indigo-500" />} size="large" placeholder="https://linkedin.com/company/..." />
          </Form.Item>
          <Form.Item name="bio" label="Bio / About">
            <Input.TextArea rows={3} placeholder="Tell us about your company..." />
          </Form.Item>

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
