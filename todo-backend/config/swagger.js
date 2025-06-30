const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'A WebSocket-based Todo API with MongoDB persistence and JWT authentication',
      contact: {
        name: 'API Support',
        email: 'support@todoapi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date'
            }
          }
        },
        Todo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Todo ID'
            },
            title: {
              type: 'string',
              description: 'Todo title'
            },
            description: {
              type: 'string',
              description: 'Todo description'
            },
            completed: {
              type: 'boolean',
              description: 'Todo completion status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Todo priority'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Todo due date',
              nullable: true
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Todo tags'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this todo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Todo creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Todo last update date'
            }
          }
        },
        TodoInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Todo title'
            },
            description: {
              type: 'string',
              description: 'Todo description'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
              description: 'Todo priority'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Todo due date',
              nullable: true
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Todo tags'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username or email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './index.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
