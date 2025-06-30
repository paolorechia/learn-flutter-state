const express = require('express');
const Todo = require('../models/Todo');
const { authenticateHTTP } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateHTTP);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos for authenticated user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of todos to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of todos to skip
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *           default: -1
 *         description: Sort order (1 for ascending, -1 for descending)
 *     responses:
 *       200:
 *         description: Todos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /api/todos - Get all todos for authenticated user
router.get('/', async (req, res) => {
  try {
    const options = {
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : null,
      priority: req.query.priority,
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: parseInt(req.query.sortOrder) || -1
    };

    const todos = await Todo.findByUserId(req.user._id, options);
    
    res.json({
      success: true,
      data: { todos },
      message: 'Todos retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch todos'
    });
  }
});

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const todoData = {
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      userId: req.user._id
    };

    const todo = new Todo(todoData);
    const savedTodo = await todo.save();

    res.status(201).json({
      success: true,
      data: { todo: savedTodo },
      message: 'Todo created successfully'
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create todo'
    });
  }
});

// GET /api/todos/stats - Get todo statistics (must come before /:id route)
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Todo.getStatsByUserId(req.user._id);

    res.json({
      success: true,
      data: { stats },
      message: 'Todo statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching todo stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch todo statistics'
    });
  }
});

// GET /api/todos/search - Search todos (must come before /:id route)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const options = {
      limit: parseInt(req.query.limit) || 20,
      skip: parseInt(req.query.skip) || 0
    };

    const todos = await Todo.search(req.user._id, query, options);
    
    res.json({
      success: true,
      data: { todos, query },
      message: 'Search completed successfully'
    });
  } catch (error) {
    console.error('Error searching todos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search todos'
    });
  }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a specific todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todo:
 *                           $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Deleted todo ID
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /api/todos/:id - Get a specific todo
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUserId(req.params.id, req.user._id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: { todo },
      message: 'Todo retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch todo'
    });
  }
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updated = await Todo.updateByIdAndUserId(req.params.id, req.user._id, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Get the updated todo
    const updatedTodo = await Todo.findByIdAndUserId(req.params.id, req.user._id);

    res.json({
      success: true,
      data: { todo: updatedTodo },
      message: 'Todo updated successfully'
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update todo'
    });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Todo.deleteByIdAndUserId(req.params.id, req.user._id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: { id: req.params.id },
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete todo'
    });
  }
});

module.exports = router;
