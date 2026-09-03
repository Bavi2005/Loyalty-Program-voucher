import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api as axios } from '../api';

const UserContext = createContext();

const API_URL = '/api';

export const UserProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/dashboard`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/receipts`);
      setReceipts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/vouchers`);
      setVouchers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await Promise.all([fetchStats(), fetchReceipts(), fetchVouchers()]);
  }, [fetchStats, fetchReceipts, fetchVouchers]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const value = {
    stats,
    receipts,
    vouchers,
    loading,
    error,
    refreshStats,
    fetchReceipts,
    fetchVouchers
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
