// frontend/src/contexts/AdminContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api as axios } from '../api';

const AdminContext = createContext();

const API_URL = '/api';

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkAdminAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/admin/me`);
        if (!cancelled) setAdmin(response.data);
      } catch (error) {
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAdminAuth();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, credentials);
      const { token, admin } = response.data;
      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin(admin);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setAdminLoading(true);
      const response = await axios.get(`${API_URL}/admin/dashboard`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      setAdminLoading(true);
      const response = await axios.get(`${API_URL}/admin/receipts`);
      setReceipts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch receipts');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const approveReceipt = useCallback(async (receiptId) => {
    try {
      await axios.post(`${API_URL}/admin/receipts/${receiptId}/approve`);
      await fetchReceipts();
      await fetchStats();
    } catch (err) {
      throw err;
    }
  }, [fetchReceipts, fetchStats]);

  const rejectReceipt = useCallback(async (receiptId) => {
    try {
      await axios.post(`${API_URL}/admin/receipts/${receiptId}/reject`);
      await fetchReceipts();
      await fetchStats();
    } catch (err) {
      throw err;
    }
  }, [fetchReceipts, fetchStats]);

  const value = {
    admin,
    login,
    logout,
    loading,
    stats,
    receipts,
    adminLoading,
    error,
    fetchStats,
    fetchReceipts,
    approveReceipt,
    rejectReceipt,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
