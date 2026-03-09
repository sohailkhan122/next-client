'use client';
import { useState } from 'react';
import { Button, Form, Input, message, Alert } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiLogin } from '../lib/authApi';
import Link from 'next/link';

const stats = [
  { value: '50K+', label: 'Active Jobs' },
  { value: '10K+', label: 'Companies' },
  { value: '2M+', label: 'Job Seekers' },
];

const features = [
  { icon: 'AI', text: 'Smart job matching powered by AI' },
  { icon: 'Click', text: 'Apply to top companies in one click' },
  { icon: 'Live', text: 'Track your applications in real time' },
  { icon: 'Alerts', text: 'Instant alerts for new opportunities' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");

    try {
      const res = await apiLogin({
        email: values.email,
        password: values.password,
      });

      const user = res.user;

      message.success("Login successful");

      await new Promise((r) => setTimeout(r, 500));

      // Admin directly dashboard
      if (user.role === "admin") {
         router.replace("/admin");
      } else if (user.role === "company") {
        if (user.profileCompleted) {
          router.replace("/company");
        } else {
          router.replace("/company-details");
        }
      } else if (user.role === "student") {
        if (user.profileCompleted) {
          router.replace("/student");
        } else {
          router.replace("/student-details");
        }
      }

    } catch (err: unknown) {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
  };

  const serverMessage = axiosErr?.response?.data?.message;

  console.log("Login error:", serverMessage);

  setError(serverMessage || "Something went wrong");
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">

      <motion.div
        className="auth-left"
        variants={slideLeft}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="brand-icon">
            <SolutionOutlined />
          </div>
          <span className="brand-name">JobBridge</span>
        </motion.div>

        <motion.div
          className="auth-hero"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="hero-title">
            Your Next Big
            <br />
            <span className="hero-accent">Opportunity</span>
            <br />
            Awaits You
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-subtitle">
            Connect with leading companies and discover roles that match your
            skills, passion, and ambition.
          </motion.p>

          <motion.ul className="feature-list" variants={containerVariants}>
            {features.map((f, i) => (
              <motion.li key={i} variants={itemVariants} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div className="stats-row" variants={containerVariants}>
            {stats.map((s, i) => (
              <motion.div key={i} variants={itemVariants} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

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
          <motion.div variants={itemVariants} className="card-header">
            <h2 className="card-title">Welcome back</h2>
            <p className="card-subtitle">
              Sign in to access your dashboard and continue your job search.
            </p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Alert title={error} type="error" showIcon />
            </motion.div>
          )}

          <Form
            form={form}
            name="login"
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

            <motion.div variants={itemVariants}>
              <Form.Item
                name="password"
                label={<span className="field-label">Password</span>}
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="password"
                  size="large"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRightOutlined />}
              </Button>
            </motion.div>
          </Form>

          <motion.p variants={itemVariants} className="switch-text">
            Don&apos;t have an account?{' '}
            <Link href="/register" replace className="switch-link">
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}