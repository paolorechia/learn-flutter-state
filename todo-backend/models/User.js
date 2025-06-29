const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const database = require('../config/database');

class User {
  constructor(userData) {
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Save user to database
  async save() {
    const db = database.getDb();
    const collection = db.collection('users');

    // Hash password before saving
    await this.hashPassword();

    try {
      const result = await collection.insertOne({
        username: this.username,
        email: this.email,
        password: this.password,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      });

      return { _id: result.insertedId, ...this };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    const db = database.getDb();
    const collection = db.collection('users');
    return await collection.findOne({ username });
  }

  // Find user by email
  static async findByEmail(email) {
    const db = database.getDb();
    const collection = db.collection('users');
    return await collection.findOne({ email });
  }

  // Find user by ID
  static async findById(id) {
    const db = database.getDb();
    const collection = db.collection('users');
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Find user by username or email
  static async findByUsernameOrEmail(identifier) {
    const db = database.getDb();
    const collection = db.collection('users');
    return await collection.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });
  }

  // Update user
  static async updateById(id, updateData) {
    const db = database.getDb();
    const collection = db.collection('users');
    
    updateData.updatedAt = new Date();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  // Delete user
  static async deleteById(id) {
    const db = database.getDb();
    const collection = db.collection('users');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Get all users (admin function)
  static async findAll(limit = 50, skip = 0) {
    const db = database.getDb();
    const collection = db.collection('users');
    
    return await collection
      .find({}, { projection: { password: 0 } })
      .limit(limit)
      .skip(skip)
      .toArray();
  }
}

module.exports = User;
