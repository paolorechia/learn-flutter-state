# Todo Debug Web App

A React web application for debugging and testing the WebSocket-based Todo API. This app demonstrates real-time functionality and provides a visual interface to understand the API behavior.

## Features

- 🔐 **Authentication**: Login/Register with JWT tokens
- 📡 **Real-time Updates**: WebSocket integration with live todo updates
- 🔄 **REST API Fallback**: Automatic fallback to REST API when WebSocket is unavailable
- ✅ **Full CRUD Operations**: Create, read, update, delete todos
- 🔍 **Search & Filter**: Search todos and filter by status/priority
- 📊 **Statistics**: Real-time todo statistics
- 🎨 **Responsive Design**: Works on desktop and mobile
- 🐛 **Debug Features**: Connection status indicator and error messages

## Quick Start

1. **Make sure the backend is running:**
   ```bash
   cd ../todo-backend
   docker-compose up -d
   ```

2. **Start the React app:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to http://localhost:5173
   - Login with test credentials:
     - **Username:** `testuser`
     - **Password:** `password123`

## What You Can Test

### WebSocket Features
- **Real-time Updates**: Open multiple browser tabs and see changes sync instantly
- **Connection Status**: Watch the connection indicator (🟢 WebSocket Connected / 🔴 Using REST API)
- **Automatic Fallback**: Stop the backend and see it switch to REST API mode

### Todo Operations
- **Create Todos**: Add new todos with title, description, priority, due date, and tags
- **Update Todos**: Edit todos inline or toggle completion status
- **Delete Todos**: Remove todos with confirmation
- **Search**: Find todos by title, description, or tags
- **Filter**: View todos by completion status or priority
- **Sort**: Order todos by different criteria

### Authentication
- **Login/Register**: Test user authentication flow
- **Token Management**: Automatic token refresh and storage
- **Protected Routes**: All todo operations require authentication

## Debug Information

The app provides several debug features:

- **Connection Status**: Shows whether using WebSocket or REST API
- **Error Messages**: Displays API errors and connection issues
- **Real-time Stats**: Live todo statistics (total, completed, pending)
- **Console Logs**: Detailed WebSocket event logging in browser console

## API Integration

The app integrates with the todo backend API in two ways:

1. **WebSocket (Primary)**: Real-time bidirectional communication
   - Events: `todos:list`, `todos:create`, `todos:update`, `todos:delete`
   - Real-time broadcasts when other users make changes

2. **REST API (Fallback)**: Traditional HTTP requests
   - Endpoints: `/api/todos`, `/api/auth/login`, etc.
   - Used when WebSocket connection fails

This debug app helps you understand the todo API behavior and test all features before implementing the Flutter frontend!
