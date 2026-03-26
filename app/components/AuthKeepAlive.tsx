'use client';

import { useEffect } from 'react';
import { startAuthKeepAlive } from '../lib/authApi';

export default function AuthKeepAlive() {
  useEffect(() => {
    const stop = startAuthKeepAlive();
    return () => {
      stop();
    };
  }, []);

  return null;
}
