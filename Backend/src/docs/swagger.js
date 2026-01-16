const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SkillLink API',
      version: '1.0.0',
      description: 'API documentation for SkillLink backend',
    },
    servers: [
      {
        url: 'http://localhost:' + (process.env.PORT || 5000),
        description: 'Local server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'StrongP@ssw0rd' },
            role: { type: 'string', enum: ['student', 'client'] },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'StrongP@ssw0rd' },
          },
        },

        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
          },
        },

        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              example: 'abcdef123456',
            },
            newPassword: {
              type: 'string',
              example: 'NewStrongPassword@123',
            },
          },
        },

        JobPick: {
          type: 'object',
          required: ['title', 'company', 'location', 'employmentType', 'level'],
          properties: {
            title: { type: 'string', example: 'React Developer' },
            company: { type: 'string', example: 'SkillLink Labs' },
            location: { type: 'string', example: 'Remote' },
            employmentType: { type: 'string', example: 'Full-time' },
            level: { type: 'string', example: 'Mid-level' },
            salary: { type: 'string', example: '₹6-10 LPA' },
            tags: { type: 'array', items: { type: 'string' }, example: ['Remote', 'React'] },
            logoUrl: { type: 'string', example: '/uploads/profile-images/logo.png' },
          },
        },

        JobOpportunity: {
          type: 'object',
          required: ['role', 'company', 'location'],
          properties: {
            role: { type: 'string', example: 'UI/UX Designer' },
            company: { type: 'string', example: 'Creative Studio' },
            location: { type: 'string', example: 'Bengaluru' },
            openings: { type: 'integer', example: 3 },
            employmentType: { type: 'string', example: 'Internship' },
            logoUrl: { type: 'string', example: '/uploads/profile-images/logo.png' },
          },
        },
      },
    },
  },

  apis: [],
};

// ======================= PATH DEFINITIONS =======================

options.definition.paths = {
  '/api/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Signup',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignupRequest' },
          },
        },
      },
      responses: {
        201: { description: 'Signup successful' },
        400: { description: 'Validation error or user exists' },
      },
    },
  },

  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Login successful (returns JWT token)' },
        401: { description: 'Invalid password' },
        404: { description: 'User not found' },
      },
    },
  },

  '/api/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Request password reset',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Password reset token sent to email' },
        400: { description: 'Email missing' },
        404: { description: 'User not found' },
        500: { description: 'Server error' },
      },
    },
  },

  '/api/auth/reset-password': {
    post: {
      tags: ['Auth'],
      summary: 'Reset password using token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Password reset successful' },
        400: { description: 'Invalid or expired token' },
        500: { description: 'Server error' },
      },
    },
  },

  '/api/auth/profile': {
    get: {
      tags: ['Auth'],
      summary: 'Get logged-in user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Returns user profile' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },

  '/api/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user (invalidate token)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Logout successful' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/users': {
    get: {
      tags: ['Admin'],
      summary: 'List users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of users' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/admin/stats': {
    get: {
      tags: ['Admin'],
      summary: 'Platform stats',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Counts of students, clients, admins' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/landing/job-picks': {
    get: {
      tags: ['Landing'],
      summary: 'Get job picks for landing page',
      responses: {
        200: { description: 'List of job picks' },
        500: { description: 'Server error' },
      },
    },
    post: {
      tags: ['Landing'],
      summary: 'Add a job pick',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobPick' },
          },
        },
      },
      responses: {
        201: { description: 'Job pick created' },
        400: { description: 'Validation error' },
      },
    },
  },

  '/api/landing/job-opportunities': {
    get: {
      tags: ['Landing'],
      summary: 'Get latest job opportunities',
      responses: {
        200: { description: 'List of job opportunities' },
        500: { description: 'Server error' },
      },
    },
    post: {
      tags: ['Landing'],
      summary: 'Add a job opportunity',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobOpportunity' },
          },
        },
      },
      responses: {
        201: { description: 'Job opportunity created' },
        400: { description: 'Validation error' },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = { swaggerSpec };
