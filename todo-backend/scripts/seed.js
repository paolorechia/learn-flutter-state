const database = require('../config/database');
const User = require('../models/User');
const Todo = require('../models/Todo');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await database.connect();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    const db = database.getDb();
    await db.collection('users').deleteMany({});
    await db.collection('todos').deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create default user
    const defaultUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const savedUser = await defaultUser.save();
    console.log('👤 Created default user:', {
      username: savedUser.username,
      email: savedUser.email,
      id: savedUser._id
    });

    // Create sample todos
    const sampleTodos = [
      {
        title: 'Learn Flutter State Management',
        description: 'Study different state management solutions in Flutter like Provider, Riverpod, and Bloc',
        priority: 'high',
        tags: ['flutter', 'learning', 'mobile'],
        userId: savedUser._id
      },
      {
        title: 'Build Todo API',
        description: 'Create a WebSocket-based todo API with MongoDB and authentication',
        priority: 'high',
        completed: true,
        tags: ['api', 'websocket', 'mongodb'],
        userId: savedUser._id
      },
      {
        title: 'Setup Docker Environment',
        description: 'Configure Docker Compose for development environment',
        priority: 'medium',
        completed: true,
        tags: ['docker', 'devops'],
        userId: savedUser._id
      },
      {
        title: 'Write Unit Tests',
        description: 'Add comprehensive unit tests for the API endpoints and WebSocket handlers',
        priority: 'medium',
        tags: ['testing', 'quality'],
        userId: savedUser._id
      },
      {
        title: 'Implement Real-time Notifications',
        description: 'Add push notifications for todo updates and reminders',
        priority: 'low',
        tags: ['notifications', 'realtime'],
        userId: savedUser._id
      },
      {
        title: 'Create Flutter UI',
        description: 'Build the Flutter frontend that connects to this WebSocket API',
        priority: 'high',
        tags: ['flutter', 'ui', 'frontend'],
        userId: savedUser._id
      },
      {
        title: 'Add Due Date Reminders',
        description: 'Implement a system to send reminders for todos approaching their due dates',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: ['reminders', 'scheduling'],
        userId: savedUser._id
      },
      {
        title: 'Optimize Database Queries',
        description: 'Review and optimize MongoDB queries for better performance',
        priority: 'low',
        tags: ['optimization', 'database'],
        userId: savedUser._id
      },
      {
        title: 'Add Data Export Feature',
        description: 'Allow users to export their todos in JSON or CSV format',
        priority: 'low',
        tags: ['export', 'data'],
        userId: savedUser._id
      },
      {
        title: 'Implement Todo Categories',
        description: 'Add support for organizing todos into custom categories',
        priority: 'medium',
        tags: ['organization', 'categories'],
        userId: savedUser._id
      }
    ];

    const createdTodos = [];
    for (const todoData of sampleTodos) {
      const todo = new Todo(todoData);
      const savedTodo = await todo.save();
      createdTodos.push(savedTodo);
    }

    console.log(`📝 Created ${createdTodos.length} sample todos`);

    // Display summary
    const stats = await Todo.getStatsByUserId(savedUser._id);
    console.log('📊 Todo Statistics:', stats);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔑 Default User Credentials:');
    console.log('   Username: testuser');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 You can now start the server and test the API!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await database.close();
    process.exit(0);
  }
};

// Run seeding if this script is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
