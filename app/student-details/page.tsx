'use client';

import React from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  LinkedinOutlined,
  LinkOutlined,
  SolutionOutlined,
  BookOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { motion, type Variants } from 'framer-motion';
import { apiUpsertStudentDetail } from '../lib/studentDetailApi';
import { apiRefreshToken } from '../lib/authApi';
import { useRouter } from 'next/navigation';

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

const SKILLS_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'Git',
  'Docker',
  'Figma',
  'Communication',
  'Project Management',
  'Data Analysis',
  'Machine Learning',
  'UI/UX Design',
];

export default function StudentDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: {
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  skills: string[];
  degree: string;
  institution: string;
  graduationYear: Number;
  linkedIn?: string;
  fieldOfStudy: string;
}) => {
  try {
    const res = await apiUpsertStudentDetail({
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      bio: values.bio,
      skills: values.skills,
      degree: values.degree,
      fieldOfStudy: values.fieldOfStudy,
      institution: values.institution,
      graduationYear: values.graduationYear,
      linkedIn: values.linkedIn,
    });

    console.log("API Response:", res);
    // Refresh the JWT so profileCompleted is updated in the token
    await apiRefreshToken();
    message.success("Student details saved successfully");
    router.push('/student');

  } catch (error) {
    console.error(error);
    message.error("Failed to save student details");
  }
};

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
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
          background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 100%)',
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
          <span style={{ fontSize: 22, fontWeight: 800 }}>JobBridge</span>
        </motion.div>

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2 }}>
          Complete Your
          <br />
          <span style={{ color: '#a5b4fc' }}>Student Profile</span>
        </h1>

        <p
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.75,
            marginTop: 16,
          }}
        >
          Fill in your details so companies can discover your skills and reach out
          with the right opportunities.
        </p>
      </motion.div>

      {/* Right panel */}
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
        <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 6,
            }}
          >
            Tell us about yourself
          </h2>

          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 36 }}>
            This information will appear on your profile and help companies find you.
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
          >
            {/* Phone + DOB */}
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                label="Phone Number"
                name="phone"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+92 300 0000000"
                />
              </Form.Item>

              <Form.Item
                label="Date of Birth"
                name="dateOfBirth"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Date of birth is required' }]}
              >
                <Input type="date" />
              </Form.Item>
            </div>

            {/* Gender */}
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: 'Please select your gender' }]}
            >
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
                <Option value="prefer_not">Prefer not to say</Option>
              </Select>
            </Form.Item>

            {/* Bio */}
            <Form.Item
              label="Bio / About Me"
              name="bio"
              rules={[{ required: true, message: 'Please write a short bio' }]}
            >
              <TextArea
                rows={3}
                placeholder="A brief summary about yourself..."
                showCount
                maxLength={300}
              />
            </Form.Item>

            {/* Skills */}
            <Form.Item
              label="Skills"
              name="skills"
              rules={[{ required: true, message: 'Please select at least one skill' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select or type your skills"
                allowClear
              >
                {SKILLS_OPTIONS.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Degree + Graduation */}
           <div style={{ display: 'flex', gap: 16 }}>
  <Form.Item
    label="Degree"
    name="degree"
    style={{ flex: 1 }}
    rules={[{ required: true, message: 'Degree is required' }]}
  >
    <Input
      prefix={<BookOutlined />}
      placeholder="B.Sc"
    />
  </Form.Item>

  <Form.Item
    label="Field of Study"
    name="fieldOfStudy"
    style={{ flex: 1 }}
    rules={[{ required: true, message: 'Field of study is required' }]}
  >
    <Input placeholder="Computer Science" />
  </Form.Item>

  <Form.Item
    label="Graduation Year"
    name="graduationYear"
    style={{ width: 160 }}
    rules={[{ required: true, message: 'Required' }]}
  >
    <Input placeholder="2025" maxLength={4} />
  </Form.Item>
</div>

            {/* Institution */}
            <Form.Item
              label="Institution"
              name="institution"
              rules={[{ required: true, message: 'Institution is required' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="LUMS, NUST, IBA..."
              />
            </Form.Item>
            

            {/* LinkedIn */}
            <Form.Item label="linkedIn Profile (optional)" name="linkedIn">
              <Input
                prefix={<LinkedinOutlined />}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Form.Item>
            {/* Submit */}
            <Form.Item style={{ marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<ArrowRightOutlined />}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none',
                }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
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