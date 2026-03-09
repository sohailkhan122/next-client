'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Spin,
} from 'antd';
import {
  BankOutlined,
  PhoneOutlined,
  LinkedinOutlined,
  LinkOutlined,
  SolutionOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiGetMe, apiRefreshToken } from '../lib/authApi';
import { apiUpsertCompanyDetail } from '../lib/companyDetailApi';

const { TextArea } = Input;
const { Option } = Select;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
  'Manufacturing', 'Marketing & Advertising', 'Consulting', 'Media & Entertainment',
  'Telecommunications', 'Real Estate', 'Logistics & Supply Chain', 'Other',
];

const COMPANY_SIZES = [
  '1–10', '11–50', '51–200', '201–500', '501–1000', '1001–5000', '5000+',
];

export default function CompanyDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');

//   useEffect(() => {
//     (async () => {
//       try {
//         const user = await apiGetMe();
//         // if (!user) { router.push('/login'); return; }
//         // if (user.role !== 'company') { router.push('/login'); return; }

//         const id = user._id || user.id;
//         setUserId(id);

//         // If details already completed, redirect to company dashboard
//         const existing = localStorage.getItem(`jb_profile_${id}`);
//         // if (existing) { router.push('/company'); return; }

//         form.setFieldsValue({ companyName: user.company || user.name, contactEmail: user.email });
//         setLoading(false);
//       } catch {
//         // router.push('/login');
//       }
//     })();
//   }, [form, router]);

  const onFinish = async (values: {
    companyName: string;
    industry: string;
    size: string;
    foundedYear: string;
    website?: string;
    location: string;
    description: string;
    contactPhone: string;
    contactEmail: string;
    linkedin?: string;
  }) => {
   setSubmitting(true);
   try {
      const res = await apiUpsertCompanyDetail({
        companyName: values.companyName,
        industry: values.industry,
        size: values.size,
        foundedYear: values.foundedYear,
        website: values.website,
        location: values.location,
        description: values.description,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        linkedin: values.linkedin,
      });
  
      console.log("API Response:", res);
      // Refresh the JWT so profileCompleted is updated in the token
      await apiRefreshToken();
      message.success("Company details saved successfully");
      router.replace('/company');
  
    } catch (error) {
      console.error(error);
      message.error("Failed to save company details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fff7ed 100%)',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: '40%',
          background: 'linear-gradient(145deg, #ea580c 0%, #dc2626 100%)',
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#fff',
        }}
        className="details-left-panel"
      >
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            <SolutionOutlined />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>JobBridge</span>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1
            variants={itemVariants}
            style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}
          >
            Set Up Your
            <br />
            <span style={{ color: '#fed7aa' }}>Company Profile</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: 40 }}
          >
            Help talented candidates discover your company by filling in key details about your organisation and culture.
          </motion.p>

          {[
            { step: '01', title: 'Company Info', desc: 'Industry, size & founding year' },
            { step: '02', title: 'Location & Web', desc: 'Where you operate & your site' },
            { step: '03', title: 'Contact Details', desc: 'How candidates can reach you' },
          ].map((item) => (
            <motion.div
              key={item.step}
              variants={itemVariants}
              style={{ display: 'flex', gap: 16, marginBottom: 24 }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right panel – form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          flex: 1,
          padding: '56px 64px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
        className="details-right-panel"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}
        >
          <motion.h2
            variants={itemVariants}
            style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}
          >
            Company Details
          </motion.h2>
          <motion.p
            variants={itemVariants}
            style={{ color: '#64748b', fontSize: 15, marginBottom: 36 }}
          >
            This information will be shown on your company profile and job listings.
          </motion.p>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
          >
            {/* ─── Company Identity ─────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: 'Company name is required' }]}
              >
                <Input prefix={<BankOutlined style={{ color: '#94a3b8' }} />} placeholder="e.g. TechCorp Inc." />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  label="Industry"
                  name="industry"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Industry is required' }]}
                >
                  <Select placeholder="Select industry">
                    {INDUSTRIES.map((ind) => (
                      <Option key={ind} value={ind}>{ind}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Company Size"
                  name="size"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Company size is required' }]}
                >
                  <Select placeholder="No. of employees">
                    {COMPANY_SIZES.map((s) => (
                      <Option key={s} value={s}>{s}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  label="Founded Year"
                  name="foundedYear"
                  style={{ width: 140 }}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g. 2015" maxLength={4} />
                </Form.Item>

                <Form.Item
                  label="Headquarters Location"
                  name="location"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Location is required' }]}
                >
                  <Input prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />} placeholder="e.g. Karachi, Pakistan" />
                </Form.Item>
              </div>
            </motion.div>

            {/* ─── Description ──────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Form.Item
                label="Company Description"
                name="description"
                rules={[{ required: true, message: 'Please describe your company' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="What does your company do? Describe your mission, products, and culture..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </motion.div>

            {/* ─── Contact & Web ─────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  label="Contact Phone"
                  name="contactPhone"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Contact phone is required' }]}
                >
                  <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="+92 300 0000000" />
                </Form.Item>

                <Form.Item
                  label="Contact Email"
                  name="contactEmail"
                  style={{ flex: 1 }}
                  rules={[
                    { required: true, message: 'Contact email is required' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="hr@company.com" />
                </Form.Item>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item label="Website (optional)" name="website">
                <Input prefix={<LinkOutlined style={{ color: '#94a3b8' }} />} placeholder="https://yourcompany.com" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item label="LinkedIn Page (optional)" name="linkedin">
                <Input prefix={<LinkedinOutlined style={{ color: '#94a3b8' }} />} placeholder="https://linkedin.com/company/yourcompany" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<ArrowRightOutlined />}
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                    border: 'none',
                  }}
                >
                  Save & Go to Dashboard
                </Button>
              </Form.Item>
            </motion.div>
          </Form>
        </motion.div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .details-left-panel { display: none !important; }
          .details-right-panel { padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}
