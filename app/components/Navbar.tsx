'use client';

import React from 'react';
import { Avatar, Dropdown, message, Tooltip } from 'antd';
import { UserOutlined, SolutionOutlined, LogoutOutlined, IdcardOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiLogout } from '../lib/authApi';

export default function Navbar({ title }: { title?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore server errors, still clear client session
    }
    message.success('Logged out successfully');
    router.replace('/login');
  };

  const menuItems = [
    {
      key: 'view-profile',
      icon: <IdcardOutlined />,
      label: 'View Profile',
      onClick: () => router.push('/profile'),
    },
    // {
    //   key: 'edit-profile',
    //   icon: <EditOutlined />,
    //   label: 'Edit Profile',
    //   onClick: () => router.push('/profile?edit=true'),
    // },
    // { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

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
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <Tooltip >
            <div className="navbar-avatar" style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
            </div>
          </Tooltip>
        </Dropdown>
      </div>
    </motion.header>
  );
}