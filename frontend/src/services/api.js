/**
 * AquaShare — API Service Layer
 * Centralizes all HTTP calls to the PHP backend.
 * Uses a localStorage-backed database for Requests, Chat, Search, and Ratings.
 * Also includes automatic localStorage fallbacks for Authentication and Profiles
 * to ensure the app works 100% in-browser even if the PHP server is not running.
 */

const API_BASE = '/backend';

// LocalStorage Database Keys
const KEYS = {
  USERS: 'aquashare_mock_users',
  PROFILES: 'aquashare_mock_profiles',
  SUPPLIERS: 'aquashare_mock_suppliers',
  REQUESTS: 'aquashare_mock_requests',
  MESSAGES: 'aquashare_mock_messages',
  RATINGS: 'aquashare_mock_ratings',
};

async function request(url, options = {}) {
  const defaultHeaders = {};
  
  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const text = await res.text();

    // PHP endpoints return JSON — parse it
    try {
      return JSON.parse(text);
    } catch {
      // If response is not JSON, wrap it
      return { error: { code: -1, message: text || 'Unknown error' } };
    }
  } catch (err) {
    // Network/Connection error (e.g., PHP server is not running)
    return { error: { code: -2, message: err.message || 'Connection refused' } };
  }
}

/** Encode a plain object as application/x-www-form-urlencoded */
function encode(data) {
  return new URLSearchParams(data).toString();
}

// Helper to get logged-in user info from frontend AuthContext storage
function getLoggedInUser() {
  try {
    const stored = localStorage.getItem('aquashare_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// ── Auth Module ────────────────────────────────────────────
export const auth = {
  async login(email, password) {
    const res = await request('/auth-module/index.php', {
      method: 'POST',
      body: encode({ email, password_hash: password }),
    });

    // Fallback if backend server is not running
    if (res.error && res.error.code === -2) {
      console.warn('Backend server not responding, falling back to local simulation.');
      const usersList = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const foundUser = usersList.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const profilesList = JSON.parse(localStorage.getItem(KEYS.PROFILES) || '[]');
        const profile = profilesList.find(p => p.user_id === foundUser.id) || null;
        
        return {
          data: {
            user: { id: foundUser.id, full_name: foundUser.full_name, phone: foundUser.phone, email: foundUser.email, role: foundUser.role },
            profile: profile
          },
          message: "Authentication Successful (Local Mock)"
        };
      }
      return { error: { code: 2, message: 'Invalid credentials (local simulation)' } };
    }

    return res;
  },

  async register({ name, phone, email, password, role }) {
    const res = await request('/auth-module/registration.php', {
      method: 'POST',
      body: encode({
        name,
        phone,
        email,
        password_hash: password,
        role: role || 'resident',
      }),
    });

    // Fallback if backend server is not running
    if (res.error && res.error.code === -2) {
      console.warn('Backend server not responding, falling back to local simulation.');
      const usersList = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      
      if (usersList.some(u => u.email === email)) {
        return { error: { code: 2, message: 'Email already registered (local simulation)' } };
      }
      if (usersList.some(u => u.phone === phone)) {
        return { error: { code: 2, message: 'Phone number already registered (local simulation)' } };
      }

      const newUser = {
        id: Date.now(),
        full_name: name,
        phone,
        email,
        password, // stored plain for local testing
        role: role || 'resident'
      };

      usersList.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(usersList));
      return { data: newUser.id, message: "Registration Successful (Local Mock)" };
    }

    return res;
  },
};

// ── User Module ────────────────────────────────────────────
export const user = {
  async createProfile({ address, landmark, ...extra }) {
    const res = await request('/user-module/createprofile.php', {
      method: 'POST',
      body: encode({ address, landmark, ...extra }),
    });

    // Fallback if backend server is not running
    if (res.error && res.error.code === -2) {
      console.warn('Backend server not responding, falling back to local simulation.');
      const activeUser = getLoggedInUser();
      if (!activeUser) return { error: { message: 'Not authenticated' } };

      const profilesList = JSON.parse(localStorage.getItem(KEYS.PROFILES) || '[]');
      const index = profilesList.findIndex(p => p.user_id === activeUser.id);
      
      const newProfile = {
        id: Date.now(),
        user_id: activeUser.id,
        address,
        landmark,
        ...extra
      };

      if (index >= 0) {
        profilesList[index] = { ...profilesList[index], ...newProfile };
      } else {
        profilesList.push(newProfile);
      }
      localStorage.setItem(KEYS.PROFILES, JSON.stringify(profilesList));
      
      // Upsert into active supplier search list
      if (activeUser.role === 'supplier') {
        syncActiveSupplierToMockList(activeUser, newProfile);
      }

      return { data: newProfile, message: "Profile Created (Local Mock)" };
    }

    return res;
  },
};

// Buea Water Suppliers Mock Pool
const INITIAL_SUPPLIERS = [
  { id: 101, full_name: 'Camwater Express', phone: '675111222', address: 'Molyko, Buea', price_per_unit: 500, unit_description: '25L jerry can', is_available: true, rating: 4.5, delivery_available: true },
  { id: 102, full_name: 'BlueDrop Supplies', phone: '675333444', address: 'Bonduma, Buea', price_per_unit: 400, unit_description: '25L jerry can', is_available: true, rating: 4.2, delivery_available: true },
  { id: 103, full_name: 'AquaPure Delivery', phone: '675555666', address: 'Malingo, Buea', price_per_unit: 600, unit_description: '50L drum', is_available: false, rating: 3.8, delivery_available: false },
  { id: 104, full_name: 'Fresh Springs Co.', phone: '675777888', address: 'Clerks Quarters, Buea', price_per_unit: 450, unit_description: '25L jerry can', is_available: true, rating: 4.7, delivery_available: true },
];

function initSuppliers() {
  if (!localStorage.getItem(KEYS.SUPPLIERS)) {
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
  }
}

/** Sync active supplier to mock list so residents can find them */
export function syncActiveSupplierToMockList(activeUser, profile) {
  if (!activeUser || activeUser.role !== 'supplier') return;
  initSuppliers();
  const list = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
  const index = list.findIndex(s => s.id === activeUser.id);
  
  const supplierData = {
    id: activeUser.id,
    full_name: activeUser.full_name,
    phone: activeUser.phone,
    address: profile?.address || 'Buea, Cameroon',
    landmark: profile?.landmark || '',
    price_per_unit: profile?.price_per_unit || 500,
    unit_description: profile?.unit_description || '25L jerry can',
    is_available: profile?.is_available !== undefined ? profile.is_available : true,
    rating: profile?.rating || 5.0,
    delivery_available: profile?.delivery_available !== undefined ? profile.delivery_available : true,
  };

  if (index >= 0) {
    list[index] = { ...list[index], ...supplierData };
  } else {
    list.push(supplierData);
  }
  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(list));
}

// ── Supplier / Search Module (Mocked via LocalStorage) ─────
export const suppliers = {
  list(searchTerm = '') {
    initSuppliers();
    let list = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.full_name.toLowerCase().includes(term) ||
        s.address.toLowerCase().includes(term) ||
        (s.landmark && s.landmark.toLowerCase().includes(term))
      );
    }
    return Promise.resolve({ data: list });
  },
  
  updateAvailability(isAvailable) {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ error: { message: 'Not authenticated' } });
    
    initSuppliers();
    const list = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
    const index = list.findIndex(s => s.id === activeUser.id);
    if (index >= 0) {
      list[index].is_available = !!isAvailable;
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(list));
      return Promise.resolve({ data: list[index] });
    }
    return Promise.resolve({ error: { message: 'Supplier profile not found' } });
  },

  updatePrice(price, description = '25L jerry can') {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ error: { message: 'Not authenticated' } });

    initSuppliers();
    const list = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
    const index = list.findIndex(s => s.id === activeUser.id);
    if (index >= 0) {
      list[index].price_per_unit = Number(price);
      list[index].unit_description = description;
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(list));
      return Promise.resolve({ data: list[index] });
    }
    return Promise.resolve({ error: { message: 'Supplier profile not found' } });
  }
};

// ── Request Module (Mocked via LocalStorage) ───────────────
export const requests = {
  create({ supplierId, quantity, note }) {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ error: { message: 'Not authenticated' } });

    initSuppliers();
    const suppliersList = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
    const supplier = suppliersList.find(s => s.id === Number(supplierId));

    const reqList = JSON.parse(localStorage.getItem(KEYS.REQUESTS) || '[]');
    const newRequest = {
      id: Date.now(),
      resident_id: activeUser.id,
      resident_name: activeUser.full_name,
      resident_phone: activeUser.phone,
      supplier_id: Number(supplierId),
      supplier_name: supplier ? supplier.full_name : 'Unknown Supplier',
      quantity: Number(quantity) || 1,
      note: note || '',
      status: 'pending',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    reqList.unshift(newRequest);
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(reqList));
    return Promise.resolve({ data: newRequest });
  },

  getAll() {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ data: [] });

    const reqList = JSON.parse(localStorage.getItem(KEYS.REQUESTS) || '[]');
    const filtered = reqList.filter(r => 
      activeUser.role === 'supplier' 
        ? r.supplier_id === activeUser.id 
        : r.resident_id === activeUser.id
    );
    return Promise.resolve({ data: filtered });
  },

  updateStatus(requestId, status) {
    const reqList = JSON.parse(localStorage.getItem(KEYS.REQUESTS) || '[]');
    const index = reqList.findIndex(r => r.id === Number(requestId));
    if (index === -1) return Promise.resolve({ error: { message: 'Request not found' } });

    reqList[index].status = status;
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(reqList));
    return Promise.resolve({ data: reqList[index] });
  }
};

// ── Communication Module (Mocked via LocalStorage) ──────────
export const messages = {
  get(requestId) {
    const msgs = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
    const filtered = msgs.filter(m => m.request_id === Number(requestId));

    // Mark messages from counterparty as read
    const activeUser = getLoggedInUser();
    if (activeUser) {
      const updated = msgs.map(m => {
        if (m.request_id === Number(requestId) && m.sender_id !== activeUser.id) {
          return { ...m, is_read: 1 };
        }
        return m;
      });
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    }

    return Promise.resolve({ data: filtered });
  },

  send({ requestId, type = 'text', body }) {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ error: { message: 'Not authenticated' } });

    const msgs = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
    const newMsg = {
      id: Date.now(),
      request_id: Number(requestId),
      sender_id: activeUser.id,
      sender_name: activeUser.full_name,
      type,
      body,
      is_read: 0,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    
    msgs.push(newMsg);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
    return Promise.resolve({ data: newMsg });
  },

  sendImage({ requestId, file }) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(messages.send({ requestId, type: 'image', body: base64data }));
      };
      reader.readAsDataURL(file);
    });
  },

  markRead(requestId) {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ error: { message: 'Not authenticated' } });

    const msgs = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
    const updated = msgs.map(m => {
      if (m.request_id === Number(requestId) && m.sender_id !== activeUser.id) {
        return { ...m, is_read: 1 };
      }
      return m;
    });
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    return Promise.resolve({ data: { updated: true } });
  },
};

// ── Rating Module (Mocked via LocalStorage) ────────────────
export const ratings = {
  create({ supplierId, score, comment }) {
    const activeUser = getLoggedInUser();
    if (!activeUser) return Promise.resolve({ error: { message: 'Not authenticated' } });

    const ratingList = JSON.parse(localStorage.getItem(KEYS.RATINGS) || '[]');
    const existingIndex = ratingList.findIndex(r => r.resident_id === activeUser.id && r.supplier_id === Number(supplierId));

    const newRating = {
      id: Date.now(),
      resident_id: activeUser.id,
      resident_name: activeUser.full_name,
      supplier_id: Number(supplierId),
      score: Number(score),
      comment: comment || '',
      created_at: new Date().toISOString().split('T')[0],
    };

    if (existingIndex >= 0) {
      ratingList[existingIndex] = newRating;
    } else {
      ratingList.push(newRating);
    }
    localStorage.setItem(KEYS.RATINGS, JSON.stringify(ratingList));

    // Recalculate average rating
    initSuppliers();
    const suppliersList = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
    const supplierIndex = suppliersList.findIndex(s => s.id === Number(supplierId));
    if (supplierIndex >= 0) {
      const supplierRatings = ratingList.filter(r => r.supplier_id === Number(supplierId));
      const avg = supplierRatings.reduce((sum, r) => sum + r.score, 0) / supplierRatings.length;
      suppliersList[supplierIndex].rating = Number(avg.toFixed(1));
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(suppliersList));
    }

    return Promise.resolve({ data: newRating });
  },

  getForSupplier(supplierId) {
    const ratingList = JSON.parse(localStorage.getItem(KEYS.RATINGS) || '[]');
    const filtered = ratingList.filter(r => r.supplier_id === Number(supplierId));
    return Promise.resolve({ data: filtered });
  }
};

export default { auth, user, suppliers, requests, messages, ratings, syncActiveSupplierToMockList };
