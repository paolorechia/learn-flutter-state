const { MongoClient } = require('mongodb');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/todoapp?authSource=admin';
      
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db();
      
      console.log('✅ Connected to MongoDB successfully');
      
      // Create indexes
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Create index on users collection
      await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      
      // Create index on todos collection
      await this.db.collection('todos').createIndex({ userId: 1 });
      await this.db.collection('todos').createIndex({ createdAt: -1 });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

module.exports = new Database();
