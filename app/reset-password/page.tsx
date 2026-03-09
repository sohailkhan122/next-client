'use client';
import { useState, Suspense } from 'react';
import { Button, Form, Input, Alert } from 'antd';
import { LockOutlined, SolutionOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion, type Variants } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiResetPassword } from '../lib/authApi';

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

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const onFinish = async (values: { password: string; confirm: string }) => {
    setLoading(true);
    setError('');
    try {
      await apiResetPassword(token, values.password);
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <Alert
          message="Invalid reset link"
          description="No reset token found. Please request a new password reset link."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Link href="/forgot-password">
          <Button type="primary" size="large">Request New Link</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {success ? (
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
            Password Reset!
          </motion.h2>
          <motion.p variants={itemVariants} className="card-subtitle" style={{ marginBottom: 24 }}>
            Your password has been updated successfully. Redirecting you to sign in…
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link href="/login">
              <Button type="primary" icon={<ArrowLeftOutlined />} size="large" block>
                Go to Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="card-header">
            <h2 className="card-title">Set New Password</h2>
            <p className="card-subtitle">
              Choose a strong new password for your account.
            </p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Alert message={error} type="error" showIcon />
            </motion.div>
          )}

          <Form
            form={form}
            name="reset-password"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            autoComplete="off"
          >
            <motion.div variants={itemVariants}>
              <Form.Item
                name="password"
                label={<span className="field-label">New Password</span>}
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New password"
                  size="large"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                name="confirm"
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
                  prefix={<LockOutlined />}
                  placeholder="Confirm password"
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
                {loading ? 'Resetting...' : 'Reset Password'}
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
    </>
  );
}

export default function ResetPasswordPage() {
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
            Create a New
            <br />
            <span className="hero-accent">Password</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="hero-subtitle">
            Almost there — set a strong new password to secure your JobBridge account.
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
          <Suspense fallback={<div>Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </motion.div>
    </div>
  );
}
