import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { AdminProvider } from './contexts/AdminContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadReceipt from './pages/UploadReceipt';
import ReceiptHistory from './pages/ReceiptHistory';
import Vouchers from './pages/Vouchers';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminReceipts from './pages/AdminReceipts';
import NotFound from './pages/NotFound';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <UserProvider>
          <AdminProvider>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Protected user routes */}
                <Route element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} path="/dashboard" />
                <Route element={<ProtectedRoute><Layout><UploadReceipt /></Layout></ProtectedRoute>} path="/upload-receipt" />
                <Route element={<ProtectedRoute><Layout><ReceiptHistory /></Layout></ProtectedRoute>} path="/receipt-history" />
                <Route element={<ProtectedRoute><Layout><Vouchers /></Layout></ProtectedRoute>} path="/vouchers" />
                <Route element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} path="/settings" />
                
                {/* Protected admin routes */}
                <Route element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} path="/admin/dashboard" />
                <Route element={<AdminProtectedRoute><AdminLayout><AdminReceipts /></AdminLayout></AdminProtectedRoute>} path="/admin/receipts" />
                
                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AdminProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;