'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Select, message, Alert } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiRegister } from '../lib/authApi';
import Link from 'next/link';

const { Option } = Select;

const steps = [
  { num: '01', title: 'Create Account', desc: 'Fill in your details to register' },
  { num: '02', title: 'Pending Review', desc: 'Admin reviews your application' },
  { num: '03', title: 'Get Approved', desc: 'Access your personalised dashboard' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  // const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'student' | 'company';
  }) => {
    setLoading(true);
    setError('');
    try {
      await apiRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      message.success('Register Success! Your account is pending review by our admin team.');
      await new Promise((r) => setTimeout(r, 700));
      router.replace('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosErr?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* {contextHolder} */}
      <motion.div className="auth-left" variants={slideLeft} initial="hidden" animate="visible">
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="brand-icon"><SolutionOutlined /></div>
          <span className="brand-name">JobBridge</span>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
          <motion.h1 variants={itemVariants} className="hero-title">
            Join<br />
            <span className="hero-accent">JobBridge</span><br />
            Today
          </motion.h1>
          <motion.p variants={itemVariants} className="hero-subtitle">
            Create your account and connect with top companies or talented candidates. Get started in minutes.
          </motion.p>

          <motion.div variants={containerVariants} className="steps-list">
            {steps.map((s) => (
              <motion.div key={s.num} variants={itemVariants} className="step-item">
                <div className="step-number">{s.num}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="testimonial-card" style={{ marginTop: 'auto' }}>
            <p className="testimonial-quote">
              &ldquo;JobBridge helped me land my first full-time role in just 3 weeks. The process was seamless!&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">AR</div>
              <div>
                <div className="testimonial-name">Ahmed Raza</div>
                <div className="testimonial-role">Software Engineer · TechCorp</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="deco-circle deco-circle-1" />
        <div className="deco-circle deco-circle-2" />
      </motion.div>

      <motion.div
        className="auth-right register-right"
        variants={slideRight}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="auth-card register-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="card-header">
            <h2 className="card-title">Create an account</h2>
            <p className="card-subtitle">Fill in the details below to get started. Your account will be reviewed by an admin.</p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Alert message={error} type="error" showIcon />
            </motion.div>
          )}

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            autoComplete="off"
            initialValues={{ role: 'student' }}
          >
            <motion.div variants={itemVariants}>
              <Form.Item
                name="name"
                label={<span className="field-label">Full Name</span>}
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="John Doe"
                  size="large"
                  className="auth-input"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                name="email"
                label={<span className="field-label">Email address</span>}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="input-icon" />}
                  placeholder="you@example.com"
                  size="large"
                  className="auth-input"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                name="role"
                label={<span className="field-label">I am a</span>}
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  className="auth-select"
                >
                  <Option value="student">Job Seeker / Student</Option>
                  <Option value="company">Company / Employer</Option>
                </Select>
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                name="password"
                label={<span className="field-label">Password</span>}
                rules={[
                  { required: true, message: 'Please enter a password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Min. 6 characters"
                  size="large"
                  className="auth-input"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                name="confirmPassword"
                label={<span className="field-label">Confirm Password</span>}
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Repeat password"
                  size="large"
                  className="auth-input"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
              <Form.Item noStyle>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  className="submit-btn"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                  {!loading && <ArrowRightOutlined />}
                </Button>
              </Form.Item>
            </motion.div>
          </Form>

          <motion.p variants={itemVariants} className="switch-text">
            Already have an account?{' '}
            <Link href="/login" replace className="switch-link">Sign in</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
