'use client';
import { useState } from 'react';
import { Button, Form, Input, Alert } from 'antd';
import { MailOutlined, SolutionOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { apiForgotPassword } from '../lib/authApi';

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError('');
    try {
      await apiForgotPassword(values.email);
      setSent(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left decorative panel */}
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
      >
        <div className="auth-brand">
          <div className="brand-icon">
            <SolutionOutlined />
          </div>
          <span className="brand-name">JobBridge</span>
        </div>

        <motion.div
          className="auth-hero"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="hero-title">
            Forgot Your
            <br />
            <span className="hero-accent">Password?</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="hero-subtitle">
            No worries — enter your email and we&apos;ll send you a secure link to reset
            your password and get back on track.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right form panel */}
      <motion.div
        className="auth-right"
        variants={slideRight}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="auth-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sent ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ textAlign: 'center', padding: '24px 0' }}
            >
              <motion.div variants={itemVariants}>
                <CheckCircleOutlined style={{ fontSize: 56, color: '#4f46e5', marginBottom: 16 }} />
              </motion.div>
              <motion.h2 variants={itemVariants} className="card-title">
                Check your inbox
              </motion.h2>
              <motion.p variants={itemVariants} className="card-subtitle" style={{ marginBottom: 32 }}>
                If an account exists for that email, we&apos;ve sent a password reset link.
                The link expires in <strong>1 hour</strong>.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link href="/login" replace>
                  <Button type="primary" icon={<ArrowLeftOutlined />} size="large" block>
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="card-header">
                <h2 className="card-title">Reset Password</h2>
                <p className="card-subtitle">
                  Enter your registered email and we&apos;ll send you a reset link.
                </p>
              </motion.div>

              {error && (
                <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
                  <Alert message={error} type="error" showIcon />
                </motion.div>
              )}

              <Form
                form={form}
                name="forgot-password"
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                autoComplete="off"
              >
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
                      prefix={<MailOutlined />}
                      placeholder="you@example.com"
                      size="large"
                    />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </motion.div>
              </Form>

              <motion.p variants={itemVariants} className="switch-text" style={{ marginTop: 20 }}>
                <Link href="/login" replace className="switch-link">
                  <ArrowLeftOutlined style={{ marginRight: 4 }} />
                  Back to Sign In
                </Link>
              </motion.p>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
