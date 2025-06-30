const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const config = require('./config/config');
const database = require('./config/database');
const { authenticateSocket } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

// Import socket handlers
const todoSocketHandlers = require('./sockets/todoHandlers');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo API Documentation'
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todo API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Todo API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ User ${socket.user.username} connected via WebSocket`);
  
  // Join user to their personal room
  socket.join(`user_${socket.user._id}`);
  
  // Register todo event handlers
  todoSocketHandlers(socket, io);
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User ${socket.user.username} disconnected: ${reason}`);
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`🔥 Socket error for user ${socket.user.username}:`, error);
  });
  
  // Send welcome message
  socket.emit('connected', {
    success: true,
    message: 'Connected to Todo API WebSocket',
    user: {
      _id: socket.user._id,
      username: socket.user.username,
      email: socket.user.email
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Start HTTP server
    server.listen(config.port, () => {
      console.log(`🚀 Todo API server running on port ${config.port}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`📡 WebSocket server ready for connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    database.close().then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    database.close().then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

// Start the server
startServer();
