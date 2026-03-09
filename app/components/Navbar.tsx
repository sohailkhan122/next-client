'use client';

import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined, SolutionOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Navbar({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <motion.header
      className="navbar"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Brand */}
      <div className="navbar-brand">
        <div className="navbar-logo">
          <SolutionOutlined />
        </div>

        <span className="navbar-title">JobBridge</span>

        {title && <span className="navbar-section">/ {title}</span>}
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        <div
          className="navbar-avatar"
          onClick={() => router.replace('/login')}
          style={{ cursor: 'pointer' }}
        >
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    </motion.header>
  );
}