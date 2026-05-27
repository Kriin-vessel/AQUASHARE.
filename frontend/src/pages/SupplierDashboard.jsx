import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requests as requestsApi, suppliers as suppliersApi, syncActiveSupplierToMockList } from '../services/api';
import {
  Droplets, ShoppingCart, Clock, CheckCircle, DollarSign,
  ToggleLeft, ToggleRight, X, Check, XCircle, MapPin, MessageSquare
} from 'lucide-react';

const STATUS_CHIP = {
  pending:   'chip-warning',
  accepted:  'chip',
  completed: 'chip-success',
  rejected:  'chip-error',
  cancelled: 'chip-neutral',
};

export default function SupplierDashboard() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isAvailable, setIsAvailable] = useState(profile?.is_available !== false);
  const [pricePerUnit, setPricePerUnit] = useState(profile?.price_per_unit || 500);
  const [unitDescription, setUnitDescription] = useState(profile?.unit_description || '25L jerry can');
  
  const [editingPrice, setEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(pricePerUnit);
  const [tempDesc, setTempDesc] = useState(unitDescription);

  // Sync supplier state to search pool
  useEffect(() => {
    if (user) {
      const activeProfile = {
        address: profile?.address || 'Buea, Cameroon',
        landmark: profile?.landmark || '',
        price_per_unit: pricePerUnit,
        unit_description: unitDescription,
        is_available: isAvailable,
        delivery_available: true,
        rating: profile?.rating || 5.0
      };
      syncActiveSupplierToMockList(user, activeProfile);
    }
  }, [user, profile, pricePerUnit, unitDescription, isAvailable]);

  // Fetch incoming requests
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await requestsApi.getAll();
      if (res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load incoming requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleToggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    try {
      await suppliersApi.updateAvailability(newVal);
      updateProfile({ ...profile, is_available: newVal });
    } catch (err) {
      console.error('Failed to update availability:', err);
    }
  };

  const savePrice = async () => {
    setPricePerUnit(tempPrice);
    setUnitDescription(tempDesc);
    setEditingPrice(false);
    try {
      await suppliersApi.updatePrice(tempPrice, tempDesc);
      updateProfile({ ...profile, price_per_unit: tempPrice, unit_description: tempDesc });
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await requestsApi.updateStatus(id, newStatus);
      if (res.data) {
        loadRequests(); // Refresh requests list
      }
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  const openChat = (requestId) => {
    navigate(`/dashboard/chat?request_id=${requestId}`);
  };

  const stats = [
    { label: 'Total Requests',   value: requests.length,                                      icon: ShoppingCart, cls: 'stat-icon-blue' },
    { label: 'Pending',          value: requests.filter(r => r.status === 'pending').length,   icon: Clock,        cls: 'stat-icon-orange' },
    { label: 'Accepted',         value: requests.filter(r => r.status === 'accepted').length,  icon: CheckCircle,  cls: 'stat-icon-green' },
    { label: 'Completed',        value: requests.filter(r => r.status === 'completed').length, icon: Droplets,     cls: 'stat-icon-cyan' },
  ];

  return (
    <div className="animate-in">
      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <h2>Welcome, {user?.full_name || 'Supplier'} 💧</h2>
        <p className="text-muted">Manage your water supply operations.</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.cls}`}>
              <s.icon size={24} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Availability Toggle */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Availability</div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={handleToggleAvailability}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <p className="text-sm text-muted">
            {isAvailable
              ? 'You are currently visible to residents and can receive new requests.'
              : 'You are hidden from search results. No new requests will come in.'}
          </p>
          <div style={{ marginTop: '12px' }}>
            <span className={isAvailable ? 'chip chip-success' : 'chip chip-error'}>
              {isAvailable ? '● Online' : '● Offline'}
            </span>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pricing</div>
            {!editingPrice && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setTempPrice(pricePerUnit); setTempDesc(unitDescription); setEditingPrice(true); }}>
                Edit
              </button>
            )}
          </div>
          {editingPrice ? (
            <div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Price per unit (FCFA)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={tempPrice}
                  onChange={e => setTempPrice(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Unit Description</label>
                <input
                  className="form-input"
                  placeholder="e.g. 25L jerry can, 50L drum"
                  value={tempDesc}
                  onChange={e => setTempDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingPrice(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={savePrice}>Save</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                  {pricePerUnit}
                </span>
                <span className="text-muted">FCFA / {unitDescription}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Requests */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Incoming Requests</div>
          <span className="badge">{requests.filter(r => r.status === 'pending').length}</span>
        </div>

        {loadingRequests ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <span className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-state-icon" />
            <div className="empty-state-title">No requests yet</div>
            <div className="empty-state-text">Requests from residents will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.map((req) => (
              <div key={req.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                background: req.status === 'pending' ? 'var(--primary-50)' : 'var(--white)',
                flexWrap: 'wrap'
              }} className="request-list-item">
                <div className="avatar">
                  {req.resident_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{req.resident_name}</span>
                    <a href={`tel:${req.resident_phone}`} className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ({req.resident_phone})
                    </a>
                  </div>
                  <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={14} /> Buea, Cameroon
                  </div>
                  <div className="text-sm" style={{ marginTop: '4px' }}>
                    <strong>{req.quantity}×</strong> jerry cans/drums
                    {req.note && <span className="text-muted"> — "{req.note}"</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: 'auto' }} className="request-list-actions">
                  <span className={`chip ${STATUS_CHIP[req.status]}`} style={{ textTransform: 'capitalize' }}>
                    {req.status}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {/* Always allow chat for active requests */}
                    {(req.status === 'pending' || req.status === 'accepted') && (
                      <button className="btn btn-secondary btn-sm" onClick={() => openChat(req.id)}>
                        <MessageSquare size={14} /> Chat
                      </button>
                    )}

                    {req.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(req.id, 'accepted')}>
                          <Check size={14} /> Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(req.id, 'completed')}>
                        <CheckCircle size={14} /> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
