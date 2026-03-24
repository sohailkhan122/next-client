'use client';

import React from 'react';
import { Button, Card, Spin, Typography } from 'antd';
import { ClockCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiLogout } from '../lib/authApi';

const { Title, Paragraph } = Typography;

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      router.replace('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#fef3c7_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#dbeafe_0%,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 sm:py-16">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full"
        >
          <Card className="overflow-hidden rounded-3xl border border-slate-200 shadow-[0_25px_70px_-30px_rgba(30,41,59,0.3)]" classNames={{ body: 'p-0' }}>
            <div className="bg-linear-to-r from-amber-100 via-orange-100 to-yellow-100 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-sm font-semibold text-amber-700 shadow-sm">
                <ClockCircleOutlined />
                Approval Pending
              </div>
              <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
                Your account is under review
              </Title>
              <Paragraph style={{ marginBottom: 0, color: '#475569', fontSize: 16 }}>
                Please wait for admin approval. You will be able to use all protected features as soon as your account is approved. The approval usually takes around 10 to 15 minutes.
              </Paragraph>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-slate-700">
                <Spin indicator={<ClockCircleOutlined spin />} />
                <span className="text-sm sm:text-base">Your account is under review. Please wait for admin approval. You will receive an email notification once your account has been approved by the admin.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="large" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
