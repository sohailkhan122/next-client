'use client';

import { useEffect, useState } from 'react';
import { Avatar, Badge, Dropdown, message, Tooltip } from 'antd';
import { UserOutlined, SolutionOutlined, LogoutOutlined, IdcardOutlined, MessageOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiLogout, apiGetMe } from '../lib/authApi';

export default function Navbar({ title }: { title?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    apiGetMe()
      .then((me) => setRole(me.role))
      .catch(() => setRole(null));
  }, []);

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
    ...(role !== 'admin'
      ? [
        {
          key: 'view-profile',
          icon: <IdcardOutlined />,
          label: 'View Profile',
          onClick: () => router.push('/profile'),
        },
      ]
      : []),
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
        {role && role !== 'admin' && (
          <Tooltip title="Messages">
            <div
              onClick={() => router.push('/messages')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 8 }}
            >
              <Badge dot>
                <MessageOutlined style={{ fontSize: 20, color: '#6366f1' }} />
              </Badge>
            </div>
          </Tooltip>
        )}
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