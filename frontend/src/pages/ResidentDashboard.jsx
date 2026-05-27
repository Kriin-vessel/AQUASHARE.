import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { suppliers as suppliersApi, requests as requestsApi, ratings as ratingsApi } from '../services/api';
import {
  Droplets, ShoppingCart, Clock, CheckCircle, Star, Search,
  MapPin, Phone, Send, X, Plus, MessageSquare
} from 'lucide-react';

const STATUS_CHIP = {
  pending:   'chip-warning',
  accepted:  'chip',
  completed: 'chip-success',
  rejected:  'chip-error',
  cancelled: 'chip-neutral',
};

export default function ResidentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [suppliersList, setSuppliersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  const [requestQty, setRequestQty] = useState(1);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch suppliers list
  const loadSuppliers = async (term = '') => {
    setLoadingSuppliers(true);
    try {
      const res = await suppliersApi.list(term);
      if (res.data) {
        setSuppliersList(res.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch request history
  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await requestsApi.getAll();
      if (res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadSuppliers();
    loadRequests();
  }, []);

  // Filter suppliers search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadSuppliers(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleRequestWater = (supplier) => {
    setSelectedSupplier(supplier);
    setRequestNote('');
    setRequestQty(1);
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedSupplier) return;
    setSubmittingRequest(true);
    try {
      const res = await requestsApi.create({
        supplierId: selectedSupplier.id,
        quantity: requestQty,
        note: requestNote,
      });
      if (res.data) {
        setShowRequestModal(false);
        loadRequests(); // reload request list
      }
    } catch (err) {
      console.error('Error placing request:', err);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const openRating = (req) => {
    setRatingTarget(req);
    setRatingScore(0);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingTarget) return;
    setSubmittingRating(true);
    try {
      const res = await ratingsApi.create({
        supplierId: ratingTarget.supplier_id,
        score: ratingScore,
        comment: ratingComment,
      });
      if (res.data) {
        setShowRatingModal(false);
        loadSuppliers(searchTerm); // Refresh suppliers list to show updated score
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const openChat = (requestId) => {
    navigate(`/dashboard/chat?request_id=${requestId}`);
  };

  const stats = [
    { label: 'Total Requests',   value: requests.length,                                         icon: ShoppingCart, cls: 'stat-icon-blue' },
    { label: 'Pending',          value: requests.filter(r => r.status === 'pending').length,      icon: Clock,        cls: 'stat-icon-orange' },
    { label: 'Completed',        value: requests.filter(r => r.status === 'completed').length,    icon: CheckCircle,  cls: 'stat-icon-green' },
    { label: 'Suppliers Found',  value: suppliersList.filter(s => s.is_available).length,        icon: Droplets,     cls: 'stat-icon-cyan' },
  ];

  return (
    <div className="animate-in">
      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <h2>Welcome, {user?.full_name || 'Resident'} 👋</h2>
        <p className="text-muted">Find a water supplier and place a request.</p>
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

      {/* Supplier Search */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">Available Suppliers</div>
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--gray-500)',
          }} />
          <input
            className="form-input"
            placeholder="Search by name or location…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '42px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loadingSuppliers ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <span className="spinner" />
            </div>
          ) : suppliersList.map((sup) => (
            <div key={sup.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-200)',
              transition: 'all .2s ease',
              flexWrap: 'wrap'
            }} className="supplier-card">
              <div className="avatar">
                {sup.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{sup.full_name}</div>
                <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {sup.address}
                </div>
                <div className="text-sm" style={{ marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                    {sup.price_per_unit} FCFA / {sup.unit_description}
                  </span>
                  <span className="star-rating" style={{ display: 'inline-flex' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={14} className={`star ${n <= Math.round(sup.rating) ? 'filled' : ''}`} fill={n <= Math.round(sup.rating) ? '#f9a825' : 'none'} />
                    ))}
                    <span className="text-xs text-muted" style={{ marginLeft: '4px' }}>{sup.rating || '5.0'}</span>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: 'auto' }} className="supplier-card-actions">
                <span className={sup.is_available ? 'chip chip-success' : 'chip chip-error'}>
                  {sup.is_available ? 'Available' : 'Unavailable'}
                </span>
                {sup.is_available && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleRequestWater(sup)}>
                    <Send size={14} /> Request
                  </button>
                )}
              </div>
            </div>
          ))}
          {!loadingSuppliers && suppliersList.length === 0 && (
            <div className="empty-state">
              <Search size={48} className="empty-state-icon" />
              <div className="empty-state-title">No suppliers found</div>
              <div className="empty-state-text">Try a different search term</div>
            </div>
          )}
        </div>
      </div>

      {/* Request History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Request History</div>
        </div>
        {loadingRequests ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <span className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-state-icon" />
            <div className="empty-state-title">No requests yet</div>
            <div className="empty-state-text">Browse suppliers above to make your first request</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 500 }}>{req.supplier_name}</td>
                    <td>{req.quantity}</td>
                    <td>
                      <span className={`chip ${STATUS_CHIP[req.status] || 'chip-neutral'}`} style={{ textTransform: 'capitalize' }}>
                        {req.status}
                      </span>
                    </td>
                    <td className="text-muted">{req.created_at.split(' ')[0]}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Always allow chat for active requests */}
                        {(req.status === 'pending' || req.status === 'accepted') && (
                          <button className="btn btn-primary btn-sm btn-ghost" onClick={() => openChat(req.id)}>
                            <MessageSquare size={14} /> Chat
                          </button>
                        )}
                        {req.status === 'completed' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openRating(req)}>
                            <Star size={14} /> Rate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedSupplier && (
        <div className="modal-backdrop" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Request Water</div>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
              Requesting from <strong>{selectedSupplier.full_name}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={requestQty}
                onChange={e => setRequestQty(parseInt(e.target.value) || 1)}
              />
              <span className="form-hint">
                {requestQty} × {selectedSupplier.price_per_unit} FCFA = <strong>{requestQty * selectedSupplier.price_per_unit} FCFA</strong>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Any special instructions…"
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRequest} disabled={submittingRequest}>
                {submittingRequest ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
                    Submitting…
                  </>
                ) : (
                  <><Send size={16} /> Submit Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingTarget && (
        <div className="modal-backdrop" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Rate Supplier</div>
              <button className="modal-close" onClick={() => setShowRatingModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
              How was your experience with <strong>{ratingTarget.supplier_name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={36}
                  className={`star ${n <= ratingScore ? 'filled' : ''}`}
                  fill={n <= ratingScore ? '#f9a825' : 'none'}
                  onClick={() => setRatingScore(n)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Share your experience…"
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRating} disabled={ratingScore === 0 || submittingRating}>
                {submittingRating ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
