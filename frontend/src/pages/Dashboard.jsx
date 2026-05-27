import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResidentDashboard from './ResidentDashboard';
import SupplierDashboard from './SupplierDashboard';
import Profile from './Profile';
import Chat from './Chat';
import {
  Droplets, LayoutDashboard, Search, ShoppingCart, MessageSquare,
  Star, User, LogOut, Menu, X, Settings
} from 'lucide-react';

const NAV_RESIDENT = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/dashboard/requests', icon: ShoppingCart,    label: 'My Requests' },
  { to: '/dashboard/chat',     icon: MessageSquare,   label: 'Messages' },
  { to: '/dashboard/profile',  icon: User,            label: 'Profile' },
];

const NAV_SUPPLIER = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/dashboard/requests', icon: ShoppingCart,    label: 'Requests' },
  { to: '/dashboard/chat',     icon: MessageSquare,   label: 'Messages' },
  { to: '/dashboard/profile',  icon: User,            label: 'Profile' },
];

export default function Dashboard() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'supplier' ? NAV_SUPPLIER : NAV_RESIDENT;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
            zIndex: 99, display: 'none',
          }}
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Droplets size={20} />
            </div>
            <span>AquaShare</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="avatar avatar-sm">{initials}</div>
            <div>
              <div style={{ fontSize: '.875rem', fontWeight: 600 }}>{user?.full_name}</div>
              <div style={{ fontSize: '.75rem', opacity: .7, textTransform: 'capitalize' }}>{role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-block" onClick={handleLogout} style={{ color: 'rgba(255,255,255,.7)', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' }}
            id="mobile-menu-toggle"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="topbar-title">
            {role === 'supplier' ? 'Supplier Dashboard' : 'Resident Dashboard'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="chip" style={{ textTransform: 'capitalize' }}>{role}</span>
            <div className="avatar avatar-sm">{initials}</div>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            <Route index element={role === 'supplier' ? <SupplierDashboard /> : <ResidentDashboard />} />
            <Route path="requests" element={role === 'supplier' ? <SupplierDashboard /> : <ResidentDashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>

      {/* Mobile menu responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          #mobile-menu-toggle { display: flex !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
