'use client';

import { useEffect, useState } from 'react';
import { Avatar, Badge, Dropdown, message, Tooltip } from 'antd';
import { UserOutlined, SolutionOutlined, LogoutOutlined, IdcardOutlined, MessageOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiLogout, apiGetMe } from '../lib/authApi';
import { apiGetConversations } from '../lib/messagesApi';
import { initializeSocket, reconnectSocket } from '../lib/messagesSocket';

export default function Navbar({ title }: { title?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [unreadTotal, setUnreadTotal] = useState<number>(0);

  useEffect(() => {
    let cleanupSocket: (() => void) | null = null;
    let disposed = false;

    const init = async () => {
      try {
        const me = await apiGetMe();
        if (disposed) return;
        setRole(me.role);

        if (me.role === 'admin') return;

        try {
          const conversations = await apiGetConversations();
          if (!disposed) {
            const total = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
            setUnreadTotal(total);
          }
        } catch {
          // Ignore initial unread fetch failures.
        }

        const socket = await initializeSocket();
        if (disposed) return;

        const handleUnreadCount = (count: number) => {
          setUnreadTotal(typeof count === 'number' ? count : 0);
        };

        socket.on('unreadCountUpdate', handleUnreadCount);

        const handleAuthRefresh = () => {
          reconnectSocket();
        };

        window.addEventListener('auth:refreshed', handleAuthRefresh);

        cleanupSocket = () => {
          socket.off('unreadCountUpdate', handleUnreadCount);
          window.removeEventListener('auth:refreshed', handleAuthRefresh);
        };
      } catch {
        if (!disposed) {
          setRole(null);
          setUnreadTotal(0);
        }
      }
    };

    void init();

    return () => {
      disposed = true;
      if (cleanupSocket) cleanupSocket();
    };
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
              <Badge count={unreadTotal} size="small" overflowCount={99}>
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