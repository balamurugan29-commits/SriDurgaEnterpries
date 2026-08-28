import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8085/api';
console.log(">>> Connecting to API base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
  timeout: 120000, // 2 minutes timeout for large dataset operations (1000 - 1500+ items)
});

const DEFAULT_INITIAL_ITEMS = [
  { id: 1, serialNumber: 1, itemCode: '70.3', description: 'Supply of RCCB 4P, 63A, 100mA Sensitivity', quantity: 4, unit: 'No', rate: 4500, serviceCharge: 0, amount: 18000 },
  { id: 2, serialNumber: 2, itemCode: '122', description: 'S&I of 50mm, 3Mtr GI Earth pipe including chamber', quantity: 3, unit: 'No', rate: 6200, serviceCharge: 0, amount: 18600 },
  { id: 3, serialNumber: 3, itemCode: '24.7', description: 'Supply of 3P Power Contactor - 70A', quantity: 1, unit: 'No', rate: 8900, serviceCharge: 0, amount: 8900 },
];

const DEFAULT_INITIAL_CUSTOMERS = [
  { 
    id: 1, 
    serialNumber: 1, 
    customerName: 'M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd.', 
    gstin: '34AAACO2519H1ZR', 
    pan: 'AAACO2519H', 
    stateCode: 'PUDUCHERRY (34)', 
    phone: '9842492946', 
    address: 'Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606.' 
  }
];

const DEFAULT_INITIAL_JOB_CARDS = [
  {
    id: 1,
    jobNo: 'JC-01/26-27',
    gPass: 'GP-8842',
    jobDate: '2026-08-25',
    customerName: 'M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd.',
    site: 'Karaikal Port',
    make: 'Kirloskar',
    equipment: 'Induction Motor 50HP',
    slNo: 'SL-99482',
    deliveredOn: '2026-08-28',
    others: 'Urgent overhaul job',
    ratingHp: '50',
    ratingKw: '37.5',
    ratingKva: '45',
    volt: '415V',
    current: '68A',
    frameSize: '225M',
    type: 'Squirrel Cage',
    bearingDe: '6313 C3',
    bearingNde: '6312 C3',
    coolingFanId: '65mm',
    coolingFanOd: '320mm',
    fanCoverCircumference: '1100mm',
    fanCoverHeight: '180mm',
    fanCoverDia: '350mm',
    speed: '1480 RPM',
    terminalBox: 'RIGHT',
    connection: 'DELTA',
    pitch: '1-10',
    turns: '14',
    bobbin: 'Nomex Class H',
    coreLength: '240mm',
    swg: '17 SWG Double',
    coilWeight1Set: '2.4 Kg',
    coilWeightTotal: '14.4 Kg',
    setOfCoil: '6 Sets',
    noOfSlots: '48',
    totalNoCoil: '24',
    jobCarried: 'Complete rewinding with Class H insulation, replacement of DE/NDE bearings, dynamic balancing, and varnishing.',
    testWwResistance: '0.42 Ohms',
    testWbResistance: '> 100 M-Ohms',
    testNoLoadCurrent: '18.5 A',
    testRpm: '1492 RPM',
    remarks: 'Motor tested on full load test bench. Performance within standard limits.',
    dismantledBy: 'R. Kumar',
    coilDismantledBy: 'S. Murugan',
    windingBy: 'M. Ramesh',
    assembledBy: 'K. Balan',
    testedBy: 'A. Engineer'
  }
];

const DEFAULT_INITIAL_CERTIFICATES = [
  {
    id: 1,
    certificateNo: 'WCC-01/26-27',
    certificateDate: '2026-08-25',
    agency: 'SRI DURGA ENTERPRISES, # 10 V.G. Nagar, Kovilpathu, Karaikal',
    rateContractRef: 'KKL/CAU-ASSET/SUPPORT/2023/1240914/SDE/9010038288',
    equipmentDescription: 'Material',
    location: 'RMD#GCS',
    make: '-',
    slNo: '-',
    capacity: '-',
    typeModel: '-',
    completionTime: '5 Day(s)',
    dateHandingOver: '03/04/2026',
    dateCompletion: '06/04/2026',
    delayInCompletion: 'NIL',
    performanceOfMachines: 'OK',
    defectiveSparesReturned: 'NA',
    items: [
      { serialNumber: 1, rcItemNo: '70.3', description: 'Supply of RCCB 4P, 63A, 100mA Sensitivity', quantity: 4, unit: 'No.' },
      { serialNumber: 2, rcItemNo: '122', description: 'S&I of 50mm, 3Mtr GI Earth pipe including chamber', quantity: 3, unit: 'No' },
      { serialNumber: 3, rcItemNo: '24.7', description: 'Supply of 3P Power Contactor - 70A', quantity: 1, unit: 'No.' }
    ]
  }
];

// Helper to format Unit based on QTY rules:
export function formatUnitWithQty(unitInput, qty = 1) {
  if (!unitInput) {
    return Number(qty) === 1 ? 'No' : 'Nos';
  }
  const u = String(unitInput).trim();
  const uLower = u.toLowerCase();
  
  if (uLower === 'no' || uLower === 'nos' || uLower === 'no.') {
    return Number(qty) === 1 ? 'No' : 'Nos';
  }
  if (uLower === 'mtr' || uLower === 'mtrs' || uLower === 'meter' || uLower === 'meters') {
    return Number(qty) === 1 ? 'Mtr' : 'Mtrs';
  }
  if (uLower === 'set' || uLower === 'sets') {
    return Number(qty) === 1 ? 'Set' : 'Sets';
  }
  if (uLower === 'kg' || uLower === 'kgs') {
    return Number(qty) === 1 ? 'Kg' : 'Kgs';
  }
  if (uLower === 'ltr' || uLower === 'ltrs' || uLower === 'liter' || uLower === 'liters') {
    return Number(qty) === 1 ? 'Ltr' : 'Ltrs';
  }
  if (uLower === 'pair' || uLower === 'pairs') {
    return Number(qty) === 1 ? 'Pair' : 'Pairs';
  }
  if (uLower === 'box' || uLower === 'boxes') {
    return Number(qty) === 1 ? 'Box' : 'Boxes';
  }
  
  return u;
}

// Helper to compute Total Amount (Subtotal + GST) for a Tax Invoice safely
export function calculateChallanTotalAmount(challan) {
  if (!challan) return 0;
  if (challan.totalAmount && Number(challan.totalAmount) > 0) {
    return Number(challan.totalAmount);
  }
  if (!challan.items || challan.items.length === 0) return 0;
  const subtotal = challan.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const amt = Number(item.amount) !== undefined && Number(item.amount) !== 0 ? Number(item.amount) : (qty * rate);
    return sum + amt;
  }, 0);
  const gstPct = Number(challan.gstPercent) !== undefined && Number(challan.gstPercent) !== null ? Number(challan.gstPercent) : 18;
  return subtotal + (subtotal * gstPct / 100);
}

const getStoredItems = () => {
  const local = localStorage.getItem('sri_durga_item_master');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return parsed.map(item => ({
        ...item,
        unit: item.unit || formatUnitWithQty('No', item.quantity || 1),
        serviceCharge: item.serviceCharge !== undefined && item.serviceCharge !== null ? Number(item.serviceCharge) : 0
      }));
    } catch(e) {}
  }
  localStorage.setItem('sri_durga_item_master', JSON.stringify(DEFAULT_INITIAL_ITEMS));
  return DEFAULT_INITIAL_ITEMS;
};

const saveStoredItems = (items) => {
  localStorage.setItem('sri_durga_item_master', JSON.stringify(items));
};

const getStoredCustomers = () => {
  const local = localStorage.getItem('sri_durga_customer_master');
  if (local) {
    try { return JSON.parse(local); } catch(e) {}
  }
  localStorage.setItem('sri_durga_customer_master', JSON.stringify(DEFAULT_INITIAL_CUSTOMERS));
  return DEFAULT_INITIAL_CUSTOMERS;
};

const saveStoredCustomers = (customers) => {
  localStorage.setItem('sri_durga_customer_master', JSON.stringify(customers));
};

const getStoredJobCards = () => {
  const local = localStorage.getItem('sri_durga_job_cards');
  if (local) {
    try { return JSON.parse(local); } catch(e) {}
  }
  localStorage.setItem('sri_durga_job_cards', JSON.stringify(DEFAULT_INITIAL_JOB_CARDS));
  return DEFAULT_INITIAL_JOB_CARDS;
};

const saveStoredJobCards = (jobCards) => {
  localStorage.setItem('sri_durga_job_cards', JSON.stringify(jobCards));
};

const getStoredCertificates = () => {
  const local = localStorage.getItem('sri_durga_work_certificates');
  if (local) {
    try { return JSON.parse(local); } catch(e) {}
  }
  localStorage.setItem('sri_durga_work_certificates', JSON.stringify(DEFAULT_INITIAL_CERTIFICATES));
  return DEFAULT_INITIAL_CERTIFICATES;
};

const saveStoredCertificates = (certs) => {
  localStorage.setItem('sri_durga_work_certificates', JSON.stringify(certs));
};

// Helper for Indian Financial Year Suffix (April 1 to March 31 e.g. "26-27")
export function getIndianFySuffix(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth(); // 0-based: April = 3
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const startYY = String(startYear).slice(-2);
  const endYY = String(endYear).slice(-2);
  return `${startYY}-${endYY}`;
}

export const ALL_SYSTEM_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard Overview', category: 'General' },
  { id: 'master', label: 'Item Master Catalog', category: 'Master Directory' },
  { id: 'customer-master', label: 'Customer Directory', category: 'Master Directory' },
  { id: 'challan', label: 'Create Tax Invoice', category: 'Invoice' },
  { id: 'challan-list', label: 'Tax Invoice History', category: 'Invoice' },
  { id: 'proforma-invoice', label: 'Create Proforma Invoice', category: 'Invoice' },
  { id: 'proforma-invoice-history', label: 'Proforma Invoice History', category: 'Invoice' },
  { id: 'work-completion', label: 'Work Completed Certificate', category: 'Certificate' },
  { id: 'work-completion-history', label: 'Certificate History', category: 'Certificate' },
  { id: 'job-card', label: 'Create Job Card', category: 'Job Card' },
  { id: 'job-card-history', label: 'Job Card History', category: 'Job Card' },
  { id: 'gate-pass', label: 'Create In & Out Gate Pass', category: 'Gate Pass' },
  { id: 'gate-pass-list', label: 'Gate Pass History', category: 'Gate Pass' },
  { id: 'sales-ledger', label: 'Sales Ledger Register', category: 'Audit & Ledgers' },
  { id: 'purchase-ledger', label: 'Purchase Ledger Register', category: 'Audit & Ledgers' }
];

export const DEFAULT_INITIAL_USERS = [
  {
    id: 1,
    userId: 'admin',
    password: 'admin123',
    fullName: 'Sri Durga Administrator',
    role: 'ADMIN',
    permissions: 'all'
  },
  {
    id: 2,
    userId: 'staff',
    password: 'staff123',
    fullName: 'Billing & Dispatch Staff',
    role: 'STAFF',
    permissions: 'dashboard,master,customer-master,challan,challan-list,proforma-invoice,proforma-invoice-history,gate-pass,gate-pass-list,job-card,job-card-history,work-completion,work-completion-history'
  }
];

const getStoredUsers = () => {
  const local = localStorage.getItem('sri_durga_users_list');
  if (local) {
    try { return JSON.parse(local); } catch(e) {}
  }
  localStorage.setItem('sri_durga_users_list', JSON.stringify(DEFAULT_INITIAL_USERS));
  return DEFAULT_INITIAL_USERS;
};

const saveStoredUsers = (users) => {
  localStorage.setItem('sri_durga_users_list', JSON.stringify(users));
};

// Authentication API Call
export const loginApi = async (userId, password) => {
  try {
    const res = await api.post('/auth/login', { userId, password });
    return res.data;
  } catch (err) {
    console.warn('Backend auth unavailable, checking client storage fallback for loginApi');
    const users = getStoredUsers();
    const cleanId = (userId || '').trim().toLowerCase();
    const user = users.find(u => u.userId.toLowerCase() === cleanId && u.password === password);
    if (user) {
      return {
        token: 'LOCAL-SESSION-' + Date.now(),
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions || 'all'
      };
    }
    throw new Error('Invalid User ID or Password.');
  }
};

// User Management API Calls
export const fetchUsersApi = async () => {
  try {
    const res = await api.get('/auth/users');
    return res.data || [];
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchUsersApi');
    return getStoredUsers();
  }
};

export const createUserApi = async (userData) => {
  try {
    const res = await api.post('/auth/users', userData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createUserApi');
    const users = getStoredUsers();
    const cleanId = (userData.userId || '').trim().toLowerCase();
    if (users.some(u => u.userId.toLowerCase() === cleanId)) {
      throw new Error(`User ID '${cleanId}' already exists.`);
    }
    const newUser = {
      id: Date.now(),
      userId: cleanId,
      fullName: userData.fullName.trim(),
      password: userData.password,
      role: userData.role || 'STAFF',
      permissions: userData.permissions || 'all',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveStoredUsers(users);
    return newUser;
  }
};

export const updateUserApi = async (id, userData) => {
  try {
    const res = await api.put(`/auth/users/${id}`, userData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateUserApi');
    const users = getStoredUsers();
    const index = users.findIndex(u => String(u.id) === String(id));
    if (index === -1) throw new Error('User not found');
    
    const existing = users[index];
    const updated = {
      ...existing,
      fullName: userData.fullName !== undefined ? userData.fullName.trim() : existing.fullName,
      role: userData.role !== undefined ? userData.role : existing.role,
      permissions: userData.permissions !== undefined ? userData.permissions : existing.permissions,
      password: userData.password ? userData.password : existing.password
    };
    users[index] = updated;
    saveStoredUsers(users);
    return updated;
  }
};

export const deleteUserApi = async (id) => {
  try {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteUserApi');
    let users = getStoredUsers();
    const target = users.find(u => String(u.id) === String(id));
    if (target && target.userId.toLowerCase() === 'admin') {
      throw new Error('Master Admin account cannot be deleted.');
    }
    users = users.filter(u => String(u.id) !== String(id));
    saveStoredUsers(users);
    return { message: 'User deleted successfully' };
  }
};

// Item Master API Calls
export const fetchItems = async (searchQuery = '') => {
  try {
    const res = await api.get('/items', { params: { search: searchQuery } });
    if (res.data) {
      return res.data.map(item => ({
        ...item,
        unit: item.unit || formatUnitWithQty('No', item.quantity || 1),
        serviceCharge: item.serviceCharge !== undefined && item.serviceCharge !== null ? Number(item.serviceCharge) : 0,
        folderName: item.folderName || 'General'
      }));
    }
    return [];
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchItems');
    const items = getStoredItems();
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      item => item.itemCode.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }
};

export const fetchItemByCode = async (code) => {
  try {
    const res = await api.get(`/items/code/${code}`);
    if (res.data) {
      return {
        ...res.data,
        unit: res.data.unit || formatUnitWithQty('No', res.data.quantity || 1),
        serviceCharge: res.data.serviceCharge !== undefined && res.data.serviceCharge !== null ? Number(res.data.serviceCharge) : 0,
        folderName: res.data.folderName || 'General'
      };
    }
    return null;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchItemByCode');
    const items = getStoredItems();
    return items.find(i => i.itemCode.toLowerCase() === code.toLowerCase()) || null;
  }
};

export const createItem = async (itemData) => {
  try {
    const res = await api.post('/items', itemData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createItem');
    const items = getStoredItems();
    const rate = Number(itemData.rate) || 0;
    const sc = Number(itemData.serviceCharge) || 0;
    const qty = Number(itemData.quantity) || 0;

    const newItem = {
      id: Date.now(),
      serialNumber: itemData.serialNumber || (items.length + 1),
      itemCode: itemData.itemCode,
      description: itemData.description,
      quantity: qty,
      unit: itemData.unit || formatUnitWithQty('No', qty),
      rate: rate,
      serviceCharge: sc,
      folderName: itemData.folderName || 'General',
      amount: qty * (rate + sc)
    };
    items.push(newItem);
    saveStoredItems(items);
    return newItem;
  }
};

export const bulkCreateItems = async (itemsList) => {
  try {
    const res = await api.post('/items/bulk', itemsList);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for bulkCreateItems');
    const items = getStoredItems();
    itemsList.forEach(itemData => {
      if (!itemData.itemCode || !itemData.itemCode.trim()) return;
      const code = itemData.itemCode.trim().toUpperCase();
      const existingIdx = items.findIndex(i => i.itemCode.toUpperCase() === code);
      const rate = Number(itemData.rate) || 0;
      const sc = Number(itemData.serviceCharge) || 0;
      const qty = Number(itemData.quantity) || 0;
      const unit = itemData.unit || formatUnitWithQty('No', qty);
      const folderName = itemData.folderName || 'General';

      if (existingIdx !== -1) {
        items[existingIdx] = {
          ...items[existingIdx],
          description: itemData.description || items[existingIdx].description,
          rate: rate || items[existingIdx].rate,
          unit,
          serviceCharge: sc,
          quantity: qty,
          folderName: itemData.folderName || items[existingIdx].folderName || 'General',
          amount: qty * ((rate || items[existingIdx].rate) + sc)
        };
      } else {
        items.push({
          id: Date.now() + Math.random(),
          serialNumber: items.length + 1,
          itemCode: code,
          description: itemData.description || 'Item specification',
          quantity: qty,
          unit,
          rate: rate,
          serviceCharge: sc,
          folderName,
          amount: qty * (rate + sc)
        });
      }
    });
    saveStoredItems(items);
    return items;
  }
};

export const updateItem = async (id, itemData) => {
  try {
    const res = await api.put(`/items/${id}`, itemData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateItem');
    const items = getStoredItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      const rate = Number(itemData.rate) || 0;
      const sc = Number(itemData.serviceCharge) || 0;
      const qty = Number(itemData.quantity) || 0;
      const unit = itemData.unit || formatUnitWithQty('No', qty);

      const updated = {
        ...items[index],
        ...itemData,
        rate,
        unit,
        serviceCharge: sc,
        quantity: qty,
        folderName: itemData.folderName || items[index].folderName || 'General',
        amount: qty * (rate + sc)
      };
      items[index] = updated;
      saveStoredItems(items);
      return updated;
    }
    throw new Error('Item not found');
  }
};

export const deleteItem = async (id) => {
  try {
    const res = await api.delete(`/items/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteItem');
    let items = getStoredItems();
    items = items.filter(i => i.id !== id).map((item, idx) => ({ ...item, serialNumber: idx + 1 }));
    saveStoredItems(items);
    return { message: 'Item deleted successfully' };
  }
};

export const moveItemsToFolder = async (itemIds, folderName) => {
  try {
    const res = await api.post('/items/move-folder', { itemIds, folderName });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for moveItemsToFolder');
    const items = getStoredItems();
    const updated = items.map(item => {
      if (itemIds.includes(item.id)) {
        return { ...item, folderName: folderName || 'General' };
      }
      return item;
    });
    saveStoredItems(updated);
    return { message: 'Items moved successfully' };
  }
};

export const renameFolder = async (oldFolder, newFolder) => {
  try {
    const res = await api.post('/items/rename-folder', { oldFolder, newFolder });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for renameFolder');
    const items = getStoredItems();
    const updated = items.map(item => {
      if (item.folderName && item.folderName.toLowerCase() === oldFolder.toLowerCase()) {
        return { ...item, folderName: newFolder };
      }
      return item;
    });
    saveStoredItems(updated);
    return { message: 'Folder renamed successfully' };
  }
};

export const deleteFolder = async (folderName, deleteItems = false) => {
  try {
    const res = await api.post('/items/delete-folder', { folderName, deleteItems });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteFolder');
    let items = getStoredItems();
    if (deleteItems) {
      items = items.filter(item => !item.folderName || item.folderName.toLowerCase() !== folderName.toLowerCase());
    } else {
      items = items.map(item => {
        if (item.folderName && item.folderName.toLowerCase() === folderName.toLowerCase()) {
          return { ...item, folderName: 'General' };
        }
        return item;
      });
    }
    saveStoredItems(items);
    return { message: 'Folder deleted successfully' };
  }
};

// Customer Master API Calls
export const fetchCustomers = async (searchQuery = '') => {
  try {
    const res = await api.get('/customers', { params: { search: searchQuery } });
    return res.data || [];
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchCustomers');
    const customers = getStoredCustomers();
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      c => c.customerName.toLowerCase().includes(q) || (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  }
};

export const createCustomer = async (customerData) => {
  try {
    const res = await api.post('/customers', customerData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createCustomer');
    const customers = getStoredCustomers();
    const newCust = {
      id: Date.now(),
      serialNumber: customerData.serialNumber || (customers.length + 1),
      customerName: customerData.customerName,
      gstin: customerData.gstin || '',
      pan: customerData.pan || '',
      stateCode: customerData.stateCode || 'PUDUCHERRY (34)',
      phone: customerData.phone || '',
      address: customerData.address || ''
    };
    customers.push(newCust);
    saveStoredCustomers(customers);
    return newCust;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const res = await api.put(`/customers/${id}`, customerData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateCustomer');
    const customers = getStoredCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      const updated = {
        ...customers[index],
        ...customerData
      };
      customers[index] = updated;
      saveStoredCustomers(customers);
      return updated;
    }
    throw new Error('Customer not found');
  }
};

export const deleteCustomer = async (id) => {
  try {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteCustomer');
    let customers = getStoredCustomers();
    customers = customers.filter(c => c.id !== id).map((item, idx) => ({ ...item, serialNumber: idx + 1 }));
    saveStoredCustomers(customers);
    return { message: 'Customer deleted successfully' };
  }
};

// Delivery Challan API Calls
export const fetchChallans = async () => {
  try {
    const res = await api.get('/challans');
    return res.data || [];
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchChallans');
    const local = localStorage.getItem('sri_durga_challan_history');
    return local ? JSON.parse(local) : [];
  }
};

export const fetchNextChallanNumber = async () => {
  try {
    const res = await api.get('/challans/next-number');
    if (res.data) {
      if (typeof res.data === 'string') return res.data;
      if (typeof res.data === 'object' && res.data.nextChallanNumber) return String(res.data.nextChallanNumber);
      if (typeof res.data === 'object' && res.data.challanNumber) return String(res.data.challanNumber);
    }
    const fySuffix = getIndianFySuffix();
    return `01/${fySuffix}`;
  } catch (err) {
    const fySuffix = getIndianFySuffix();
    const local = localStorage.getItem('sri_durga_challan_history');
    const list = local ? JSON.parse(local) : [];
    const currentFyList = list.filter(c => {
      if (c.challanNumber && c.challanNumber.endsWith(fySuffix)) return true;
      if (c.challanDate) {
        const d = new Date(c.challanDate);
        return getIndianFySuffix(d) === fySuffix;
      }
      return false;
    });
    const count = currentFyList.length + 1;
    return `${String(count).padStart(2, '0')}/${fySuffix}`;
  }
};

export const createChallan = async (challanData) => {
  try {
    const res = await api.post('/challans', challanData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createChallan');
    const local = localStorage.getItem('sri_durga_challan_history');
    const list = local ? JSON.parse(local) : [];
    const newChallan = {
      ...challanData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newChallan);
    localStorage.setItem('sri_durga_challan_history', JSON.stringify(list));
    return newChallan;
  }
};

export const updateChallan = async (id, challanData) => {
  try {
    const res = await api.put(`/challans/${id}`, challanData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateChallan');
    const local = localStorage.getItem('sri_durga_challan_history');
    let list = local ? JSON.parse(local) : [];
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...challanData, updatedAt: new Date().toISOString() };
      localStorage.setItem('sri_durga_challan_history', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Tax Invoice not found');
  }
};

export const deleteChallan = async (id) => {
  try {
    const res = await api.delete(`/challans/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteChallan');
    const local = localStorage.getItem('sri_durga_challan_history');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(c => c.id !== id);
    localStorage.setItem('sri_durga_challan_history', JSON.stringify(list));
    return { message: 'Tax Invoice deleted' };
  }
};

// Job Card API Calls
export const fetchJobCards = async (searchQuery = '') => {
  try {
    const res = await api.get('/job-cards');
    const list = res.data || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(jc => 
      (jc.jobNo && jc.jobNo.toLowerCase().includes(q)) ||
      (jc.customerName && jc.customerName.toLowerCase().includes(q)) ||
      (jc.equipment && jc.equipment.toLowerCase().includes(q)) ||
      (jc.slNo && jc.slNo.toLowerCase().includes(q))
    );
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchJobCards');
    const cards = getStoredJobCards();
    if (!searchQuery) return cards;
    const q = searchQuery.toLowerCase();
    return cards.filter(jc =>
      (jc.jobNo && jc.jobNo.toLowerCase().includes(q)) ||
      (jc.customerName && jc.customerName.toLowerCase().includes(q)) ||
      (jc.equipment && jc.equipment.toLowerCase().includes(q)) ||
      (jc.slNo && jc.slNo.toLowerCase().includes(q))
    );
  }
};

export const fetchNextJobNo = async () => {
  try {
    const res = await api.get('/job-cards/next-number');
    if (res.data && (res.data.nextJobNo || res.data.jobNo)) {
      return res.data.nextJobNo || res.data.jobNo;
    }
    const fySuffix = getIndianFySuffix();
    return `JC-01/${fySuffix}`;
  } catch (err) {
    const fySuffix = getIndianFySuffix();
    const cards = getStoredJobCards();
    const count = cards.length + 1;
    return `JC-${String(count).padStart(2, '0')}/${fySuffix}`;
  }
};

export const createJobCard = async (jobCardData) => {
  try {
    const res = await api.post('/job-cards', jobCardData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createJobCard');
    const cards = getStoredJobCards();
    const newCard = {
      ...jobCardData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    cards.unshift(newCard);
    saveStoredJobCards(cards);
    return newCard;
  }
};

export const updateJobCard = async (id, jobCardData) => {
  try {
    const res = await api.put(`/job-cards/${id}`, jobCardData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateJobCard');
    const cards = getStoredJobCards();
    const idx = cards.findIndex(c => c.id === id);
    if (idx !== -1) {
      cards[idx] = { ...cards[idx], ...jobCardData, updatedAt: new Date().toISOString() };
      saveStoredJobCards(cards);
      return cards[idx];
    }
    throw new Error('Job Card not found');
  }
};

export const deleteJobCard = async (id) => {
  try {
    const res = await api.delete(`/job-cards/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteJobCard');
    let cards = getStoredJobCards();
    cards = cards.filter(c => c.id !== id);
    saveStoredJobCards(cards);
    return { message: 'Job Card deleted successfully' };
  }
};

// Work Completion Certificate API Calls
export const fetchCertificates = async (searchQuery = '') => {
  try {
    const res = await api.get('/work-completion-certificates');
    const list = res.data || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(wcc =>
      (wcc.certificateNo && wcc.certificateNo.toLowerCase().includes(q)) ||
      (wcc.rateContractRef && wcc.rateContractRef.toLowerCase().includes(q)) ||
      (wcc.equipmentDescription && wcc.equipmentDescription.toLowerCase().includes(q)) ||
      (wcc.location && wcc.location.toLowerCase().includes(q))
    );
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchCertificates');
    const certs = getStoredCertificates();
    if (!searchQuery) return certs;
    const q = searchQuery.toLowerCase();
    return certs.filter(wcc =>
      (wcc.certificateNo && wcc.certificateNo.toLowerCase().includes(q)) ||
      (wcc.rateContractRef && wcc.rateContractRef.toLowerCase().includes(q)) ||
      (wcc.equipmentDescription && wcc.equipmentDescription.toLowerCase().includes(q)) ||
      (wcc.location && wcc.location.toLowerCase().includes(q))
    );
  }
};

export const fetchNextCertificateNo = async () => {
  try {
    const res = await api.get('/work-completion-certificates/next-number');
    if (res.data && (res.data.nextCertificateNo || res.data.certificateNo)) {
      return res.data.nextCertificateNo || res.data.certificateNo;
    }
    const fySuffix = getIndianFySuffix();
    return `WCC-01/${fySuffix}`;
  } catch (err) {
    const fySuffix = getIndianFySuffix();
    const certs = getStoredCertificates();
    const count = certs.length + 1;
    return `WCC-${String(count).padStart(2, '0')}/${fySuffix}`;
  }
};

export const createCertificate = async (certificateData) => {
  try {
    const res = await api.post('/work-completion-certificates', certificateData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createCertificate');
    const certs = getStoredCertificates();
    const newCert = {
      ...certificateData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    certs.unshift(newCert);
    saveStoredCertificates(certs);
    return newCert;
  }
};

export const updateCertificate = async (id, certificateData) => {
  try {
    const res = await api.put(`/work-completion-certificates/${id}`, certificateData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateCertificate');
    const certs = getStoredCertificates();
    const idx = certs.findIndex(c => c.id === id);
    if (idx !== -1) {
      certs[idx] = { ...certs[idx], ...certificateData, updatedAt: new Date().toISOString() };
      saveStoredCertificates(certs);
      return certs[idx];
    }
    throw new Error('Certificate not found');
  }
};

export const deleteCertificate = async (id) => {
  try {
    const res = await api.delete(`/work-completion-certificates/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteCertificate');
    let certs = getStoredCertificates();
    certs = certs.filter(c => c.id !== id);
    saveStoredCertificates(certs);
    return { message: 'Certificate deleted successfully' };
  }
};

// In & Out Gate Pass API Calls
export const fetchGatePasses = async (searchQuery = '') => {
  try {
    const res = await api.get('/gate-passes');
    const list = res.data || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(gp => 
      (gp.gatePassNo && gp.gatePassNo.toLowerCase().includes(q)) ||
      (gp.receiverName && gp.receiverName.toLowerCase().includes(q))
    );
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchGatePasses');
    const local = localStorage.getItem('sri_durga_gate_passes');
    const list = local ? JSON.parse(local) : [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(gp => 
      (gp.gatePassNo && gp.gatePassNo.toLowerCase().includes(q)) ||
      (gp.receiverName && gp.receiverName.toLowerCase().includes(q))
    );
  }
};

export const fetchNextGatePassNo = async () => {
  try {
    const res = await api.get('/gate-passes/next-number');
    if (res.data && (res.data.nextGatePassNo || res.data.gatePassNo)) {
      return res.data.nextGatePassNo || res.data.gatePassNo;
    }
    const fySuffix = getIndianFySuffix();
    return `GP-01/${fySuffix}`;
  } catch (err) {
    const fySuffix = getIndianFySuffix();
    const local = localStorage.getItem('sri_durga_gate_passes');
    const list = local ? JSON.parse(local) : [];
    const count = list.length + 1;
    return `GP-${String(count).padStart(2, '0')}/${fySuffix}`;
  }
};

export const createGatePass = async (gatePassData) => {
  try {
    const res = await api.post('/gate-passes', gatePassData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createGatePass');
    const local = localStorage.getItem('sri_durga_gate_passes');
    const list = local ? JSON.parse(local) : [];
    const newGp = {
      ...gatePassData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newGp);
    localStorage.setItem('sri_durga_gate_passes', JSON.stringify(list));
    return newGp;
  }
};

export const updateGatePass = async (id, gatePassData) => {
  try {
    const res = await api.put(`/gate-passes/${id}`, gatePassData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateGatePass');
    const local = localStorage.getItem('sri_durga_gate_passes');
    let list = local ? JSON.parse(local) : [];
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...gatePassData, updatedAt: new Date().toISOString() };
      localStorage.setItem('sri_durga_gate_passes', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Gate Pass not found');
  }
};

export const deleteGatePass = async (id) => {
  try {
    const res = await api.delete(`/gate-passes/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteGatePass');
    const local = localStorage.getItem('sri_durga_gate_passes');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(c => c.id !== id);
    localStorage.setItem('sri_durga_gate_passes', JSON.stringify(list));
    return { message: 'Gate Pass deleted successfully' };
  }
};

// ==========================================
// Sales Ledger API & Persistent Storage
// ==========================================
// Sales Ledger API & Persistent Storage
// ==========================================
export const fetchSalesLedgers = async () => {
  try {
    const res = await api.get('/sales-ledger');
    const dbList = res.data || [];
    const local = localStorage.getItem('sri_durga_sales_ledger');
    const localList = local ? JSON.parse(local) : [];

    // Auto-sync localStorage to MS SQL Server if database has no rows
    if (dbList.length === 0 && localList.length > 0) {
      try {
        console.log(`Auto-syncing ${localList.length} sales ledger records to MS SQL Server database...`);
        for (const item of localList) {
          await api.post('/sales-ledger', item);
        }
        const updated = await api.get('/sales-ledger');
        if (updated.data && updated.data.length > 0) {
          localStorage.setItem('sri_durga_sales_ledger', JSON.stringify(updated.data));
          return updated.data;
        }
      } catch (syncErr) {
        console.error('Auto-sync sales to DB failed:', syncErr);
      }
      return localList;
    }

    if (dbList.length > 0) {
      localStorage.setItem('sri_durga_sales_ledger', JSON.stringify(dbList));
    }
    return dbList;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchSalesLedgers:', err);
    const local = localStorage.getItem('sri_durga_sales_ledger');
    return local ? JSON.parse(local) : [];
  }
};

export const createSalesLedger = async (ledgerData) => {
  try {
    const res = await api.post('/sales-ledger', ledgerData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createSalesLedger');
    const local = localStorage.getItem('sri_durga_sales_ledger');
    const list = local ? JSON.parse(local) : [];
    const newEntry = {
      ...ledgerData,
      id: Date.now(),
      serialNumber: list.length + 1,
      createdAt: new Date().toISOString()
    };
    list.unshift(newEntry);
    localStorage.setItem('sri_durga_sales_ledger', JSON.stringify(list));
    return newEntry;
  }
};

export const updateSalesLedger = async (id, ledgerData) => {
  try {
    const res = await api.put(`/sales-ledger/${id}`, ledgerData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateSalesLedger');
    const local = localStorage.getItem('sri_durga_sales_ledger');
    let list = local ? JSON.parse(local) : [];
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...ledgerData, updatedAt: new Date().toISOString() };
      localStorage.setItem('sri_durga_sales_ledger', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Sales Ledger entry not found');
  }
};

export const deleteSalesLedger = async (id) => {
  try {
    const res = await api.delete(`/sales-ledger/${id}`);
    const local = localStorage.getItem('sri_durga_sales_ledger');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(l => l.id !== id && String(l.id) !== String(id));
    localStorage.setItem('sri_durga_sales_ledger', JSON.stringify(list));
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteSalesLedger');
    const local = localStorage.getItem('sri_durga_sales_ledger');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(l => l.id !== id && String(l.id) !== String(id));
    localStorage.setItem('sri_durga_sales_ledger', JSON.stringify(list));
    return { message: 'Sales Ledger entry deleted' };
  }
};

// ==========================================
// Purchase Ledger API & Persistent Storage
// ==========================================
export const fetchPurchaseLedgers = async () => {
  try {
    const res = await api.get('/purchase-ledger');
    const dbList = res.data || [];
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    const localList = local ? JSON.parse(local) : [];

    // Auto-sync localStorage to MS SQL Server if database has no rows
    if (dbList.length === 0 && localList.length > 0) {
      try {
        console.log(`Auto-syncing ${localList.length} purchase ledger records to MS SQL Server database...`);
        const synced = await api.post('/purchase-ledger/bulk', localList);
        if (synced.data && synced.data.length > 0) {
          localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(synced.data));
          return synced.data;
        }
      } catch (syncErr) {
        console.error('Auto-sync purchase to DB failed:', syncErr);
      }
      return localList;
    }

    if (dbList.length > 0) {
      localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(dbList));
    }
    return dbList;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchPurchaseLedgers:', err);
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    return local ? JSON.parse(local) : [];
  }
};

export const createPurchaseLedger = async (ledgerData) => {
  try {
    const res = await api.post('/purchase-ledger', ledgerData);
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    const list = local ? JSON.parse(local) : [];
    list.unshift(res.data);
    localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createPurchaseLedger');
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    const list = local ? JSON.parse(local) : [];
    
    // Duplicate check per dealer + invoiceNo (ignoring dashes)
    const dealer = (ledgerData.dealerStoreName || '').trim().toUpperCase();
    const inv = (ledgerData.invoiceNo || '').trim().toUpperCase();
    if (dealer && inv && inv !== '-' && inv !== 'N/A' && list.some(l => 
      (l.dealerStoreName || l.supplierRemarks || '').trim().toUpperCase() === dealer && 
      (l.invoiceNo || '').trim().toUpperCase() === inv
    )) {
      throw new Error(`Duplicate entry: Invoice No. ${ledgerData.invoiceNo} already exists for ${ledgerData.dealerStoreName}!`);
    }

    const newEntry = {
      ...ledgerData,
      id: Date.now(),
      serialNumber: list.length + 1,
      createdAt: new Date().toISOString()
    };
    list.unshift(newEntry);
    localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
    return newEntry;
  }
};

export const bulkCreatePurchaseLedgers = async (entries) => {
  try {
    const res = await api.post('/purchase-ledger/bulk', entries);
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    const list = local ? JSON.parse(local) : [];
    const merged = [...(res.data || []), ...list];
    localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(merged));
    return res.data;
  } catch (err) {
    console.warn('Backend bulk endpoint unavailable, using client storage batch fallback');
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    let list = local ? JSON.parse(local) : [];
    const created = [];
    const existingKeys = new Set(list.map(l => {
      const d = (l.dealerStoreName || l.supplierRemarks || '').trim().toUpperCase();
      const inv = (l.invoiceNo || '').trim().toUpperCase();
      return (d && inv && inv !== '-' && inv !== 'N/A') ? `${d}___${inv}` : null;
    }).filter(Boolean));

    for (let i = 0; i < entries.length; i++) {
      const item = entries[i];
      const d = (item.dealerStoreName || item.supplierRemarks || '').trim().toUpperCase();
      const inv = (item.invoiceNo || '').trim().toUpperCase();

      if (d && inv && inv !== '-' && inv !== 'N/A') {
        const key = `${d}___${inv}`;
        if (existingKeys.has(key)) {
          continue; // Skip duplicate for same dealer
        }
        existingKeys.add(key);
      }

      const newEntry = {
        ...item,
        id: Date.now() + i,
        serialNumber: list.length + 1 + created.length,
        createdAt: new Date().toISOString()
      };
      list.unshift(newEntry);
      created.push(newEntry);
    }
    localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
    return created;
  }
};

export const updatePurchaseLedger = async (id, ledgerData) => {
  try {
    const res = await api.put(`/purchase-ledger/${id}`, ledgerData);
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    let list = local ? JSON.parse(local) : [];
    const idx = list.findIndex(l => l.id === id || String(l.id) === String(id));
    if (idx !== -1) {
      list[idx] = res.data;
      localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
    }
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updatePurchaseLedger');
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    let list = local ? JSON.parse(local) : [];
    const idx = list.findIndex(l => l.id === id || String(l.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...ledgerData, updatedAt: new Date().toISOString() };
      localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Purchase Ledger entry not found');
  }
};

export const deletePurchaseLedger = async (id) => {
  try {
    const res = await api.delete(`/purchase-ledger/${id}`);
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(l => l.id !== id && String(l.id) !== String(id));
    localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deletePurchaseLedger');
    const local = localStorage.getItem('sri_durga_purchase_ledger');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(l => l.id !== id && String(l.id) !== String(id));
    localStorage.setItem('sri_durga_purchase_ledger', JSON.stringify(list));
    return { message: 'Purchase Ledger entry deleted' };
  }
};

// =============================================================================
// PROFORMA INVOICE API CALLS (Sequential PC/XX/YY-ZZ Numbering)
// =============================================================================

export const fetchProformas = async (searchQuery = '') => {
  try {
    const res = await api.get('/proforma-invoices');
    const list = res.data || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p =>
      (p.proformaNumber && p.proformaNumber.toLowerCase().includes(q)) ||
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.equipmentHeader && p.equipmentHeader.toLowerCase().includes(q))
    );
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchProformas');
    const local = localStorage.getItem('sri_durga_proforma_history');
    const list = local ? JSON.parse(local) : [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p =>
      (p.proformaNumber && p.proformaNumber.toLowerCase().includes(q)) ||
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.equipmentHeader && p.equipmentHeader.toLowerCase().includes(q))
    );
  }
};

export const fetchProformaById = async (id) => {
  try {
    const res = await api.get(`/proforma-invoices/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for fetchProformaById');
    const local = localStorage.getItem('sri_durga_proforma_history');
    const list = local ? JSON.parse(local) : [];
    const found = list.find(p => p.id === id || String(p.id) === String(id));
    if (found) return found;
    throw new Error('Proforma Invoice not found');
  }
};

export const fetchNextProformaNumber = async () => {
  try {
    const res = await api.get('/proforma-invoices/generate-next-number');
    if (res.data && res.data.proformaNumber) {
      return res.data.proformaNumber;
    }
  } catch (err) {
    console.warn('Backend unavailable, generating client-side Proforma Invoice number');
  }

  // Fallback client-side generation (e.g., "PC/01/26-27")
  const fySuffix = getIndianFySuffix();
  const local = localStorage.getItem('sri_durga_proforma_history');
  const list = local ? JSON.parse(local) : [];
  const currentFyList = list.filter(p => (p.proformaNumber || '').endsWith(fySuffix));
  const nextSeq = currentFyList.length + 1;
  const seqStr = String(nextSeq).padStart(2, '0');
  return `PC/${seqStr}/${fySuffix}`;
};

export const createProforma = async (proformaData) => {
  try {
    const res = await api.post('/proforma-invoices', proformaData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for createProforma');
    const local = localStorage.getItem('sri_durga_proforma_history');
    const list = local ? JSON.parse(local) : [];
    const newProforma = {
      ...proformaData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newProforma);
    localStorage.setItem('sri_durga_proforma_history', JSON.stringify(list));
    return newProforma;
  }
};

export const updateProforma = async (id, proformaData) => {
  try {
    const res = await api.put(`/proforma-invoices/${id}`, proformaData);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for updateProforma');
    const local = localStorage.getItem('sri_durga_proforma_history');
    let list = local ? JSON.parse(local) : [];
    const idx = list.findIndex(p => p.id === id || String(p.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...proformaData, updatedAt: new Date().toISOString() };
      localStorage.setItem('sri_durga_proforma_history', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Proforma Invoice not found');
  }
};

export const deleteProforma = async (id) => {
  try {
    const res = await api.delete(`/proforma-invoices/${id}`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using client storage fallback for deleteProforma');
    const local = localStorage.getItem('sri_durga_proforma_history');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(p => p.id !== id && String(p.id) !== String(id));
    localStorage.setItem('sri_durga_proforma_history', JSON.stringify(list));
    return { message: 'Proforma Invoice deleted' };
  }
};



