import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Meeting Room Scheduler API',
      version: '1.0.0',
      description: 'API documentation for Smart Meeting Room Scheduler system',
      contact: {
        name: 'API Support',
        email: 'support@meetingroomscheduler.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.meetingroomscheduler.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: 'U-0001',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['USER', 'MANAGER', 'CEO', 'ADMIN'],
              description: 'User role in the system',
              example: 'USER',
            },
            department: {
              type: 'string',
              description: 'User department (optional)',
              example: 'Engineering',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'User account status',
              example: 'active',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['id', 'email', 'password', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user ID',
              example: 'U-0001',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
              example: 'password123',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            department: {
              type: 'string',
              description: 'User department (optional)',
              example: 'Engineering',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            statusCode: {
              type: 'number',
              example: 201,
            },
            message: {
              type: 'string',
              example: 'User registered successfully!',
            },
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  description: 'JWT access token',
                },
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            statusCode: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'User is logged in successfully!',
            },
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  description: 'JWT access token',
                },
                needsPasswordChange: {
                  type: 'boolean',
                  description: 'Indicates if user needs to change password',
                },
              },
            },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: {
              type: 'string',
              description: 'Current password',
              example: 'oldpassword123',
            },
            newPassword: {
              type: 'string',
              description: 'New password',
              example: 'newpassword123',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errorMessages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/app/modules/**/*.ts', './src/app/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Smart Meeting Room Scheduler API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // JSON endpoint for Swagger spec
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at http://localhost:5000/api-docs');
};
