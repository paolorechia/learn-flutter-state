# Todo Backend API

A WebSocket-based Todo API with MongoDB persistence, JWT authentication, and Docker support.

## Features

- 🔐 JWT Authentication (username/password)
- 📡 Real-time WebSocket communication
- 🗄️ MongoDB persistence
- 🐳 Docker Compose setup
- 🔄 REST API endpoints (backup/alternative to WebSocket)
- 👤 User management
- ✅ Full CRUD operations for todos
- 🔍 Search functionality
- 📊 Todo statistics
- 🏷️ Tags and priority support
- 📅 Due date support

## Quick Start

### Using Docker Compose (Recommended)

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Seed the database:**
   ```bash
   docker-compose exec todo-api npm run seed
   ```

3. **Access the API:**
   - HTTP API: http://localhost:3000
   - WebSocket: ws://localhost:3000

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB locally or update .env with your MongoDB URI**

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Default Test User

After seeding, you can use these credentials:
- **Username:** `testuser`
- **Email:** `test@example.com`
- **Password:** `password123`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/refresh` - Refresh JWT token (requires auth)

### Todos (REST API)

All todo endpoints require authentication (Bearer token in Authorization header).

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get specific todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `GET /api/todos/stats/summary` - Get todo statistics
- `GET /api/todos/search/:query` - Search todos

### Query Parameters for GET /api/todos

- `completed` - Filter by completion status (true/false)
- `priority` - Filter by priority (low/medium/high)
- `limit` - Number of results (default: 50)
- `skip` - Number of results to skip (default: 0)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: 1 (asc) or -1 (desc, default)

## WebSocket Events

### Connection

Connect with JWT token in auth object:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Todo Events

**Client → Server:**
- `todos:list` - Get all todos
- `todos:create` - Create new todo
- `todos:update` - Update todo
- `todos:delete` - Delete todo
- `todos:stats` - Get statistics
- `todos:search` - Search todos

**Server → Client:**
- `todos:list:response` - Todo list response
- `todos:create:response` - Create response
- `todos:update:response` - Update response
- `todos:delete:response` - Delete response
- `todos:stats:response` - Statistics response
- `todos:search:response` - Search response
- `todos:created` - Broadcast when todo created
- `todos:updated` - Broadcast when todo updated
- `todos:deleted` - Broadcast when todo deleted

## Example Usage

### 1. Register/Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### 2. Create Todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Learn Flutter","description":"Study state management","priority":"high"}'
```

### 3. Get Todos

```bash
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:password123@localhost:27017/todoapp?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Docker Services

- **todo-api**: Node.js API server
- **mongodb**: MongoDB database

## Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with test data

## Project Structure

```
todo-backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # REST API routes
├── scripts/         # Utility scripts
├── sockets/         # WebSocket handlers
├── docker-compose.yml
├── Dockerfile
└── index.js         # Main server file
```
