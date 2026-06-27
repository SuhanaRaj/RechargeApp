const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';

// ==================== MOCK DATABASE ====================

// In-memory storage (resets when server restarts)
const mockDB = {
  users: [
    {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr4dX9Z5xQj5xQj5xQj5xQj5xQj5xQj5', // "password123"
      phoneNumber: '9876543210',
      walletBalance: 500,
      rechargeHistory: [],
      createdAt: new Date()
    }
  ],
  plans: [
    // Jio Plans
    { 
      id: 'p1',
      operator: 'Jio', 
      name: 'Jio 1.5GB/Day', 
      amount: 239, 
      validity: '28 Days', 
      data: '1.5 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['1.5GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p2',
      operator: 'Jio', 
      name: 'Jio 2GB/Day', 
      amount: 349, 
      validity: '28 Days', 
      data: '2 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['2GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p3',
      operator: 'Jio', 
      name: 'Jio 3GB/Day', 
      amount: 449, 
      validity: '28 Days', 
      data: '3 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['3GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p4',
      operator: 'Jio', 
      name: 'Jio 1GB Day', 
      amount: 49, 
      validity: '1 Day', 
      data: '1 GB', 
      talktime: '₹0', 
      sms: '100 SMS',
      benefits: ['1GB Data', '100 SMS', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p5',
      operator: 'Jio', 
      name: 'Jio Data Topup', 
      amount: 199, 
      validity: '28 Days', 
      data: '10 GB', 
      talktime: '₹0',
      benefits: ['10GB Data'],
      type: 'data',
      isActive: true 
    },
    
    // Airtel Plans
    { 
      id: 'p6',
      operator: 'Airtel', 
      name: 'Airtel 1GB/Day', 
      amount: 199, 
      validity: '28 Days', 
      data: '1 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['1GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p7',
      operator: 'Airtel', 
      name: 'Airtel 1.5GB/Day', 
      amount: 249, 
      validity: '28 Days', 
      data: '1.5 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['1.5GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p8',
      operator: 'Airtel', 
      name: 'Airtel 2GB/Day', 
      amount: 299, 
      validity: '28 Days', 
      data: '2 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['2GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p9',
      operator: 'Airtel', 
      name: 'Airtel 3GB/Day', 
      amount: 399, 
      validity: '28 Days', 
      data: '3 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['3GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p10',
      operator: 'Airtel', 
      name: 'Airtel Data Pack', 
      amount: 149, 
      validity: '28 Days', 
      data: '6 GB', 
      talktime: '₹0',
      benefits: ['6GB Data'],
      type: 'data',
      isActive: true 
    },
    
    // Vi Plans
    { 
      id: 'p11',
      operator: 'Vi', 
      name: 'Vi 1GB/Day', 
      amount: 219, 
      validity: '28 Days', 
      data: '1 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['1GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p12',
      operator: 'Vi', 
      name: 'Vi 1.5GB/Day', 
      amount: 269, 
      validity: '28 Days', 
      data: '1.5 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['1.5GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p13',
      operator: 'Vi', 
      name: 'Vi 2GB/Day', 
      amount: 349, 
      validity: '28 Days', 
      data: '2 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['2GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p14',
      operator: 'Vi', 
      name: 'Vi 3GB/Day', 
      amount: 449, 
      validity: '28 Days', 
      data: '3 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['3GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    
    // BSNL Plans
    { 
      id: 'p15',
      operator: 'BSNL', 
      name: 'BSNL 1GB/Day', 
      amount: 199, 
      validity: '28 Days', 
      data: '1 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['1GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    },
    { 
      id: 'p16',
      operator: 'BSNL', 
      name: 'BSNL 2GB/Day', 
      amount: 299, 
      validity: '28 Days', 
      data: '2 GB/Day', 
      talktime: '₹0', 
      sms: '100 SMS/Day',
      benefits: ['2GB Data/Day', '100 SMS/Day', 'Unlimited Calls'],
      type: 'prepaid',
      isActive: true 
    }
  ],
  recharges: [],
  rechargeCounter: 0
};

// ==================== HELPER FUNCTIONS ====================

// Generate random ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Find user by email
const findUserByEmail = (email) => {
  return mockDB.users.find(u => u.email === email);
};

// Find user by id
const findUserById = (id) => {
  return mockDB.users.find(u => u.id === id);
};

// ==================== MIDDLEWARE ====================

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// ==================== API ROUTES ====================

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Check if user exists
    if (findUserByEmail(email)) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      walletBalance: 100, // Give new users ₹100 bonus
      rechargeHistory: [],
      createdAt: new Date()
    };
    
    mockDB.users.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        walletBalance: newUser.walletBalance
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get profile
app.get('/api/auth/profile', auth, (req, res) => {
  try {
    const user = findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      walletBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ===== PLAN ROUTES =====

// Get all plans
app.get('/api/plans', (req, res) => {
  try {
    const { operator, type } = req.query;
    let plans = [...mockDB.plans];
    
    if (operator) {
      plans = plans.filter(p => p.operator === operator);
    }
    if (type && type !== 'all') {
      plans = plans.filter(p => p.type === type);
    }
    
    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get plans by operator
app.get('/api/plans/operator/:operator', (req, res) => {
  try {
    const plans = mockDB.plans.filter(p => 
      p.operator === req.params.operator && p.isActive
    ).sort((a, b) => a.amount - b.amount);
    
    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get plan by ID
app.get('/api/plans/:id', (req, res) => {
  try {
    const plan = mockDB.plans.find(p => p.id === req.params.id);
    if (!plan) {
      return res.status(404).json({ msg: 'Plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ===== RECHARGE ROUTES =====

// Create recharge
app.post('/api/recharge', auth, (req, res) => {
  try {
    const { mobileNumber, operator, planId, amount, validity, data, talktime } = req.body;
    
    const user = findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user.walletBalance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }
    
    // Find the plan
    const plan = mockDB.plans.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({ msg: 'Plan not found' });
    }
    
    const transactionId = 'RECH' + Date.now() + Math.floor(Math.random() * 10000);
    
    const recharge = {
      id: generateId(),
      userId: user.id,
      mobileNumber,
      operator,
      planId,
      amount,
      validity,
      data: data || plan.data,
      talktime: talktime || plan.talktime,
      status: 'success',
      transactionId,
      rechargeDate: new Date(),
      planId: plan // For populating
    };
    
    mockDB.recharges.push(recharge);
    
    // Update wallet
    user.walletBalance -= amount;
    user.rechargeHistory.push(recharge.id);
    
    res.json({
      success: true,
      recharge,
      newBalance: user.walletBalance,
      transactionId
    });
  } catch (err) {
    console.error('Recharge error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get recharge history
app.get('/api/recharge/history', auth, (req, res) => {
  try {
    const userRecharges = mockDB.recharges
      .filter(r => r.userId === req.userId)
      .sort((a, b) => new Date(b.rechargeDate) - new Date(a.rechargeDate));
    
    // Populate plan details
    const populated = userRecharges.map(r => ({
      ...r,
      planId: mockDB.plans.find(p => p.id === r.planId) || r.planId
    }));
    
    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get recharge by ID
app.get('/api/recharge/:id', auth, (req, res) => {
  try {
    const recharge = mockDB.recharges.find(r => 
      r.id === req.params.id && r.userId === req.userId
    );
    
    if (!recharge) {
      return res.status(404).json({ msg: 'Recharge not found' });
    }
    
    // Populate plan details
    const populated = {
      ...recharge,
      planId: mockDB.plans.find(p => p.id === recharge.planId) || recharge.planId
    };
    
    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add money to wallet
app.post('/api/recharge/add-money', auth, (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }
    
    const user = findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.walletBalance += parseFloat(amount);
    
    res.json({
      success: true,
      newBalance: user.walletBalance,
      message: `₹${amount} added successfully`
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ===== HEALTH CHECK =====

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mock backend is running!',
    users: mockDB.users.length,
    plans: mockDB.plans.length,
    recharges: mockDB.recharges.length
  });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log('\n=========================================');
  console.log('🚀 MOCK BACKEND SERVER RUNNING');
  console.log('=========================================');
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET}`);
  console.log('=========================================');
  console.log('\n📋 MOCK DATA:');
  console.log(`👤 Users: ${mockDB.users.length}`);
  console.log(`📱 Plans: ${mockDB.plans.length}`);
  console.log(`🔄 Recharges: ${mockDB.recharges.length}`);
  console.log('\n💡 Demo Account:');
  console.log(`   Email: demo@example.com`);
  console.log(`   Password: password123`);
  console.log(`   Wallet Balance: ₹500`);
  console.log('\n✅ Ready to accept requests!');
  console.log('=========================================\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});