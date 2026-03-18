'use client';

import { useState } from 'react';
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
    phone: string;
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
        phone: values.phone,
        contactEmail: values.contactEmail,
        linkedIn: values.linkedin,
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
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-stretch">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden md:flex w-[40%] bg-gradient-to-br from-orange-600 to-red-600 p-10 lg:p-14 flex-col justify-center text-white"
      >
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-[22px]">
            <SolutionOutlined />
          </div>
          <span className="text-[22px] font-extrabold tracking-tight">JobBridge</span>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1
            variants={itemVariants}
            className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4"
          >
            Set Up Your
            <br />
            <span className="text-orange-200">Company Profile</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-[15px] text-white/80 leading-relaxed mb-10"
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
              className="flex gap-4 mb-6"
            >
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-bold text-[15px]">{item.title}</div>
                <div className="text-[13px] text-white/65 mt-0.5">{item.desc}</div>
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
        className="flex-1 p-8 sm:p-12 md:p-14 lg:p-16 overflow-y-auto flex flex-col justify-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-[600px] w-full mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5"
          >
            Company Details
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-slate-500 text-[14px] sm:text-[15px] mb-8"
          >
            This information will be shown on your company profile and job listings.
          </motion.p>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
            className="space-y-1"
          >
            {/* ─── Company Identity ─────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Form.Item
                label={<span className="font-medium text-slate-700">Company Name</span>}
                name="companyName"
                rules={[{ required: true, message: 'Company name is required' }]}
              >
                <Input prefix={<BankOutlined className="text-slate-400" />} placeholder="e.g. TechCorp Inc." className="rounded-xl px-4 py-3" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <Form.Item
                  label={<span className="font-medium text-slate-700">Industry</span>}
                  name="industry"
                  className="flex-1"
                  rules={[{ required: true, message: 'Industry is required' }]}
                >
                  <Select placeholder="Select industry" className="[&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:py-1.5 [&_.ant-select-selector]:h-auto">
                    {INDUSTRIES.map((ind) => (
                      <Option key={ind} value={ind}>{ind}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700">Company Size</span>}
                  name="size"
                  className="flex-1"
                  rules={[{ required: true, message: 'Company size is required' }]}
                >
                  <Select placeholder="No. of employees" className="[&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:py-1.5 [&_.ant-select-selector]:h-auto">
                    {COMPANY_SIZES.map((s) => (
                      <Option key={s} value={s}>{s}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <Form.Item
                  label={<span className="font-medium text-slate-700">Founded Year</span>}
                  name="foundedYear"
                  className="sm:w-[140px]"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g. 2015" maxLength={4} className="rounded-xl px-4 py-3" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700">Location</span>}
                  name="location"
                  className="flex-1"
                  rules={[{ required: true, message: 'Location is required' }]}
                >
                  <Input prefix={<EnvironmentOutlined className="text-slate-400" />} placeholder="e.g. Karachi, Pakistan" className="rounded-xl px-4 py-3" />
                </Form.Item>
              </div>
            </motion.div>

            {/* ─── Description ──────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Form.Item
                label={<span className="font-medium text-slate-700">Company Description</span>}
                name="description"
                rules={[{ required: true, message: 'Please describe your company' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="What does your company do? Describe your mission, products, and culture..."
                  showCount
                  maxLength={500}
                  className="rounded-xl px-4 py-3"
                />
              </Form.Item>
            </motion.div>

            {/* ─── Contact & Web ─────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <div className="flex flex-col sm:flex-row sm:gap-4 mt-2">
                <Form.Item
                  label={<span className="font-medium text-slate-700">Contact Phone</span>}
                  name="phone"
                  className="flex-1"
                  rules={[{ required: true, message: 'Contact phone is required' }]}
                >
                  <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="+92 300 0000000" className="rounded-xl px-4 py-3" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700">Contact Email</span>}
                  name="contactEmail"
                  className="flex-1"
                  rules={[
                    { required: true, message: 'Contact email is required' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="hr@company.com" className="rounded-xl px-4 py-3" />
                </Form.Item>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item label={<span className="font-medium text-slate-700">Website (optional)</span>} name="website">
                <Input prefix={<LinkOutlined className="text-slate-400" />} placeholder="https://yourcompany.com" className="rounded-xl px-4 py-3" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item label={<span className="font-medium text-slate-700">LinkedIn Page (optional)</span>} name="linkedin">
                <Input prefix={<LinkedinOutlined className="text-slate-400" />} placeholder="https://linkedin.com/company/yourcompany" className="rounded-xl px-4 py-3" />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item className="mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<ArrowRightOutlined />}
                  className="w-full h-14 rounded-xl text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 border-none shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.01] transition-all"
                >
                  Save & Go to Dashboard
                </Button>
              </Form.Item>
            </motion.div>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
}
