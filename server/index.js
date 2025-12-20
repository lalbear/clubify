const express = require('express');
const cors = require('cors');
const { sendEmail } = require('./services/emailService');
const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');
const Club = require('./models/Club');
const Task = require('./models/Task');
const Event = require('./models/Event');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Proposal = require('./models/Proposal');
const Message = require('./models/Message');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = config.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Clubify API Server is running!',
    version: '1.0.0',
    status: 'active'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'member'
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Middleware to check authentication
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    console.log('Auth check - User ID:', userId);
    console.log('Auth check - Headers:', req.headers);
    
    if (!userId) {
      console.log('No user ID provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Try to find user by ID
    let user = await User.findById(userId);
    
    // If not found by ID, try to find by email (fallback)
    if (!user) {
      console.log('User not found by ID, trying to find by email...');
      // This is a fallback - in a real app, you'd want to store the actual user ID
      user = await User.findOne({ email: userId });
    }
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User authenticated:', user.name, user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check role permissions
const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('Role check - Required roles:', roles);
    console.log('Role check - User role:', req.user.role);
    console.log('Role check - User:', req.user.name);
    
    if (!roles.includes(req.user.role)) {
      console.log('Access denied - insufficient permissions');
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${roles.join(' or ')}, Current: ${req.user.role}`
      });
    }
    console.log('Access granted');
    next();
  };
};

// Test authentication endpoint
app.get('/api/test-auth', authenticateUser, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Clubs routes
app.get('/api/clubs', authenticateUser, async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true })
      .populate('admin', 'name email')
      .populate('members.user', 'name email role');
    
    res.json({
      success: true,
      clubs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs'
    });
  }
});

// Task routes
app.get('/api/tasks', authenticateUser, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'lead') {
      query.assignedBy = req.user._id;
    }
    
    const tasks = await Task.find(query)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('club', 'name')
      .sort({ deadline: 1 });
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
});

app.post('/api/tasks', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user._id);
    
    const { title, description, assignedTo, club, deadline, priority } = req.body;
    
    // Handle default club
    let clubId = club;
    if (club === 'default-club') {
      console.log('Handling default club for task');
      const defaultClub = await Club.findOne({ name: 'Default Club' });
      if (!defaultClub) {
        console.log('Creating new default club for task');
        // Create default club if it doesn't exist
        const newDefaultClub = new Club({
          name: 'Default Club',
          description: 'The main club for all activities',
          category: 'other',
          admin: req.user._id
        });
        await newDefaultClub.save();
        clubId = newDefaultClub._id;
        console.log('Created default club with ID:', clubId);
      } else {
        clubId = defaultClub._id;
        console.log('Using existing default club with ID:', clubId);
      }
    }
    
    const task = new Task({
      title,
      description,
      assignedBy: req.user._id,
      assignedTo,
      club: clubId,
      deadline,
      priority: priority || 'medium'
    });
    
    console.log('Saving task:', task);
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('club', 'name');
    
    console.log('Task created successfully:', task);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

app.put('/api/tasks/:id', authenticateUser, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.assignedTo.toString() !== req.user._id.toString() && 
        task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }
    
    if (status) task.status = status;
    if (status === 'completed') task.completedAt = new Date();
    
    if (notes) {
      task.notes.push({
        user: req.user._id,
        content: notes
      });
    }
    
    await task.save();
    await task.populate('assignedBy', 'name email');
    await task.populate('assignedTo', 'name email');
    await task.populate('club', 'name');
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
});

// Event routes
app.get('/api/events', authenticateUser, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('club', 'name')
      .populate('attendees.user', 'name email')
      .sort({ startDate: 1 });
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

app.post('/api/events', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    // Handle default club
    let clubId = req.body.club;
    if (req.body.club === 'default-club') {
      const defaultClub = await Club.findOne({ name: 'Default Club' });
      if (!defaultClub) {
        const newDefaultClub = new Club({
          name: 'Default Club',
          description: 'The main club for all activities',
          category: 'other',
          admin: req.user._id
        });
        await newDefaultClub.save();
        clubId = newDefaultClub._id;
      } else {
        clubId = defaultClub._id;
      }
    }

    const eventData = {
      ...req.body,
      club: clubId,
      organizer: req.user._id
    };
    
    const event = new Event(eventData);
    await event.save();
    await event.populate('organizer', 'name email');
    await event.populate('club', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Product and Sales routes
app.get('/api/products', authenticateUser, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('club', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

app.post('/api/products', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('User role:', req.user.role);
    
    // Handle default club

    let clubId = req.body.club;
    if (req.body.club === 'default-club') {
      console.log('Handling default club');
      const defaultClub = await Club.findOne({ name: 'Default Club' });
      if (!defaultClub) {
        console.log('Creating new default club');
        const newDefaultClub = new Club({
          name: 'Default Club',
          description: 'The main club for all activities',
          category: 'other',
          admin: req.user._id
        });
        await newDefaultClub.save();
        clubId = newDefaultClub._id;
        console.log('Created default club with ID:', clubId);
      } else {
        clubId = defaultClub._id;
        console.log('Using existing default club with ID:', clubId);
      }
    }

    const product = new Product({
      ...req.body,
      club: clubId
    });
    console.log('Saving product:', product);
    await product.save();
    await product.populate('club', 'name');
    
    console.log('Product created successfully:', product);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

app.get('/api/sales', authenticateUser, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product', 'name price')
      .populate('seller', 'name email')
      .populate('club', 'name')
      .sort({ createdAt: -1 });
    
    // Calculate sales analytics
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const salesByProduct = {};
    
    sales.forEach(sale => {
      const productName = sale.product.name;
      if (!salesByProduct[productName]) {
        salesByProduct[productName] = { quantity: 0, amount: 0 };
      }
      salesByProduct[productName].quantity += sale.quantity;
      salesByProduct[productName].amount += sale.totalAmount;
    });
    
    res.json({
      success: true,
      sales,
      analytics: {
        totalSales,
        salesByProduct,
        totalTransactions: sales.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales'
    });
  }
});

app.post('/api/sales', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    // Handle default club
    let clubId = req.body.club;
    if (req.body.club === 'default-club') {
      const defaultClub = await Club.findOne({ name: 'Default Club' });
      if (!defaultClub) {
        const newDefaultClub = new Club({
          name: 'Default Club',
          description: 'The main club for all activities',
          category: 'other',
          admin: req.user._id
        });
        await newDefaultClub.save();
        clubId = newDefaultClub._id;
      } else {
        clubId = defaultClub._id;
      }
    }

    const sale = new Sale({
      ...req.body,
      club: clubId,
      seller: req.user._id
    });
    
    await sale.save();
    await sale.populate('product', 'name price');
    await sale.populate('club', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record sale'
    });
  }
});

// Proposal routes
app.get('/api/proposals', authenticateUser, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'member') {
      query.proposer = req.user._id;
    }
    
    const proposals = await Proposal.find(query)
      .populate('proposer', 'name email')
      .populate('club', 'name')
      .populate('reviews.reviewer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      proposals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals'
    });
  }
});

app.post('/api/proposals', authenticateUser, async (req, res) => {
  try {
    // Handle default club
    let clubId = req.body.club;
    if (req.body.club === 'default-club') {
      const defaultClub = await Club.findOne({ name: 'Default Club' });
      if (!defaultClub) {
        const newDefaultClub = new Club({
          name: 'Default Club',
          description: 'The main club for all activities',
          category: 'other',
          admin: req.user._id
        });
        await newDefaultClub.save();
        clubId = newDefaultClub._id;
      } else {
        clubId = defaultClub._id;
      }
    }

    const proposal = new Proposal({
      ...req.body,
      club: clubId,
      proposer: req.user._id
    });
    
    await proposal.save();
    await proposal.populate('proposer', 'name email');
    await proposal.populate('club', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      proposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit proposal'
    });
  }
});

app.put('/api/proposals/:id/review', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    const { status, comments } = req.body;
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }
    
    proposal.reviews.push({
      reviewer: req.user._id,
      status,
      comments
    });
    
    if (status === 'approved' || status === 'rejected') {
      proposal.status = status;
    }
    
    await proposal.save();
    await proposal.populate('proposer', 'name email');
    await proposal.populate('club', 'name');
    await proposal.populate('reviews.reviewer', 'name email');
    
    res.json({
      success: true,
      message: 'Proposal reviewed successfully',
      proposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to review proposal'
    });
  }
});

// Message routes
app.get('/api/messages', authenticateUser, async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    
    if (type === 'sent') {
      query.sender = req.user._id;
    } else {
      query.recipient = req.user._id;
    }
    
    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('club', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

app.post('/api/messages', authenticateUser, async (req, res) => {
  try {
    // Handle default club
    let clubId = req.body.club;
    if (req.body.club === 'default-club') {
      const defaultClub = await Club.findOne({ name: 'Default Club' });
      if (!defaultClub) {
        const newDefaultClub = new Club({
          name: 'Default Club',
          description: 'The main club for all activities',
          category: 'other',
          admin: req.user._id
        });
        await newDefaultClub.save();
        clubId = newDefaultClub._id;
      } else {
        clubId = defaultClub._id;
      }
    }

    const message = new Message({
      ...req.body,
      club: clubId,
      sender: req.user._id
    });
    
    await message.save();
    await message.populate('sender', 'name email role');
    await message.populate('recipient', 'name email role');
    await message.populate('club', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

app.put('/api/messages/:id/read', authenticateUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }
    
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
});

// ==================== EMAIL ROUTE ====================
// Send email to lead/board
app.post('/api/send-email', authenticateUser, async (req, res) => {
  try {
    const { recipientId, subject, message } = req.body;

    console.log('📧 Email request from:', req.user.name);
    console.log('Recipient ID:', recipientId);

    // Validate inputs
    if (!recipientId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, subject, and message are required'
      });
    }

    // Fetch recipient
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Allow only lead or board
    if (!['lead', 'board'].includes(recipient.role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only send emails to leads or board members'
      });
    }

    console.log('Sending email to:', recipient.email);

    // Send email
    const result = await sendEmail(
      recipient.email,
      subject,
      message,
      req.user.name,
      req.user.email
    );

    if (result.success) {
      console.log('✅ Email sent successfully');

      res.json({
        success: true,
        message: `Email sent successfully to ${recipient.name}`,
        recipient: {
          name: recipient.name,
          email: recipient.email,
          role: recipient.role
        }
      });
    } else {
      console.error('❌ Email send failed:', result.error);

      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Email route error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});
// Users routes
app.get('/api/users', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    console.log('Fetching users with query:', req.query);
    console.log('User role:', req.user.role);
    
    const { role } = req.query;
    let query = { isActive: true };
    
    if (role) query.role = role;
    
    console.log('User query:', query);
    const users = await User.find(query)
      .select('-password')
      .populate('clubs', 'name')
      .sort({ name: 1 });
    
    console.log('Found users:', users.length);
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Create sample club for testing
app.post('/api/clubs', authenticateUser, requireRole(['lead', 'board']), async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    const club = new Club({
      name,
      description,
      category: category || 'other',
      admin: req.user._id
    });
    
    await club.save();
    await club.populate('admin', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      club
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create club'
    });
  }
});

// Initialize default club
app.post('/api/init-default-club', async (req, res) => {
  try {
    // Check if default club already exists
    let defaultClub = await Club.findOne({ name: 'Default Club' });
    
    if (!defaultClub) {
      // Create default club
      defaultClub = new Club({
        name: 'Default Club',
        description: 'The main club for all activities',
        category: 'general',
        admin: null // Will be set when first lead/board signs up
      });
      
      await defaultClub.save();
    }
    
    res.json({
      success: true,
      message: 'Default club initialized',
      club: defaultClub
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default club'
    });
  }
});

// Get default club ID
app.get('/api/default-club-id', async (req, res) => {
  try {
    const defaultClub = await Club.findOne({ name: 'Default Club' });
    
    if (!defaultClub) {
      return res.status(404).json({
        success: false,
        message: 'Default club not found'
      });
    }
    
    res.json({
      success: true,
      clubId: defaultClub._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get default club ID'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
