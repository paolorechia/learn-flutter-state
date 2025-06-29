const { ObjectId } = require('mongodb');
const database = require('../config/database');

class Todo {
  constructor(todoData) {
    this.title = todoData.title;
    this.description = todoData.description || '';
    this.completed = todoData.completed || false;
    this.userId = todoData.userId;
    this.priority = todoData.priority || 'medium'; // low, medium, high
    this.dueDate = todoData.dueDate || null;
    this.tags = todoData.tags || [];
    this.createdAt = todoData.createdAt || new Date();
    this.updatedAt = todoData.updatedAt || new Date();
  }

  // Validate todo data
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (this.description && this.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!['low', 'medium', 'high'].includes(this.priority)) {
      errors.push('Priority must be low, medium, or high');
    }

    return errors;
  }

  // Save todo to database
  async save() {
    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    const db = database.getDb();
    const collection = db.collection('todos');

    try {
      const result = await collection.insertOne({
        title: this.title.trim(),
        description: this.description.trim(),
        completed: this.completed,
        userId: new ObjectId(this.userId),
        priority: this.priority,
        dueDate: this.dueDate ? new Date(this.dueDate) : null,
        tags: this.tags,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      });

      return { _id: result.insertedId, ...this };
    } catch (error) {
      throw error;
    }
  }

  // Find todos by user ID
  static async findByUserId(userId, options = {}) {
    const db = database.getDb();
    const collection = db.collection('todos');

    const {
      completed = null,
      priority = null,
      limit = 50,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = -1
    } = options;

    const query = { userId: new ObjectId(userId) };

    if (completed !== null) {
      query.completed = completed;
    }

    if (priority) {
      query.priority = priority;
    }

    const sort = {};
    sort[sortBy] = sortOrder;

    return await collection
      .find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  // Find todo by ID and user ID
  static async findByIdAndUserId(id, userId) {
    const db = database.getDb();
    const collection = db.collection('todos');
    
    return await collection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });
  }

  // Update todo
  static async updateByIdAndUserId(id, userId, updateData) {
    const db = database.getDb();
    const collection = db.collection('todos');

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    updateData.updatedAt = new Date();

    // Convert dueDate to Date object if provided
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const result = await collection.updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(userId)
      },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  // Delete todo
  static async deleteByIdAndUserId(id, userId) {
    const db = database.getDb();
    const collection = db.collection('todos');

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    return result.deletedCount > 0;
  }

  // Get todo statistics for user
  static async getStatsByUserId(userId) {
    const db = database.getDb();
    const collection = db.collection('todos');

    const stats = await collection.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: ['$completed', 0, 1] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]).toArray();

    return stats.length > 0 ? stats[0] : {
      total: 0,
      completed: 0,
      pending: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    };
  }

  // Search todos
  static async search(userId, searchTerm, options = {}) {
    const db = database.getDb();
    const collection = db.collection('todos');

    const {
      limit = 20,
      skip = 0
    } = options;

    const query = {
      userId: new ObjectId(userId),
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    return await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }
}

module.exports = Todo;
