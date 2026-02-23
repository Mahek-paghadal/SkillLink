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

        JobCreateRequest: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: { type: 'string', example: 'Frontend Developer' },
            description: { type: 'string', example: 'Build UI components in React.' },
            location: { type: 'string', example: 'Remote' },
            employmentType: { type: 'string', example: 'Part-time' },
            level: { type: 'string', example: 'Beginner' },
            salary: { type: 'string', example: '₹500' },
            tags: { type: 'array', items: { type: 'string' }, example: ['React', 'UI'] },
            companyName: { type: 'string', example: 'SkillLink Client' },
          },
        },

        JobUpdateRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            employmentType: { type: 'string' },
            level: { type: 'string' },
            salary: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            companyName: { type: 'string' },
            status: { type: 'string', example: 'open' },
          },
        },

        SkillsUpdateRequest: {
          type: 'object',
          required: ['skills'],
          properties: {
            skills: { type: 'array', items: { type: 'string' }, example: ['react', 'node'] },
          },
        },

        StatusUpdateRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', example: 'approved' },
          },
        },
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

  '/api/auth/profile-image': {
    post: {
      tags: ['Auth'],
      summary: 'Upload profile image',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                image: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Profile image uploaded' },
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Auth'],
      summary: 'Remove profile image',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Profile image removed' },
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

  '/api/admin/jobs': {
    get: {
      tags: ['Admin'],
      summary: 'List all jobs',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of jobs' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/admin/jobs/{jobId}/status': {
    patch: {
      tags: ['Admin'],
      summary: 'Update job status',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StatusUpdateRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Job status updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/admin/jobs/{jobId}': {
    delete: {
      tags: ['Admin'],
      summary: 'Delete job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Job deleted' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/admin/applications': {
    get: {
      tags: ['Admin'],
      summary: 'List all applications',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of applications' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/admin/applications/{applicationId}/status': {
    patch: {
      tags: ['Admin'],
      summary: 'Update application status',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StatusUpdateRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Application status updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/admin/applications/{applicationId}': {
    delete: {
      tags: ['Admin'],
      summary: 'Delete application',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Application deleted' },
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

  '/api/student/overview': {
    get: {
      tags: ['Student'],
      summary: 'Student dashboard overview',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Overview payload' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/student/recommendations': {
    get: {
      tags: ['Student'],
      summary: 'Get student recommendations',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Recommendations list' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/student/profile': {
    get: {
      tags: ['Student'],
      summary: 'Get student profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Student profile' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/student/profile/skills': {
    patch: {
      tags: ['Student'],
      summary: 'Update student skills',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SkillsUpdateRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Skills updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/student/jobs': {
    get: {
      tags: ['Student'],
      summary: 'Get jobs by category',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Jobs by category' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },

  '/api/jobs': {
    get: {
      tags: ['Jobs'],
      summary: 'List open jobs',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of jobs' },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Jobs'],
      summary: 'Create a job',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobCreateRequest' },
          },
        },
      },
      responses: {
        201: { description: 'Job created' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/my': {
    get: {
      tags: ['Jobs'],
      summary: 'List client jobs',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Client jobs' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/history': {
    get: {
      tags: ['Jobs'],
      summary: 'Client job history',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'History list' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/history/clear': {
    post: {
      tags: ['Jobs'],
      summary: 'Clear client job history',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'History cleared' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/{jobId}': {
    put: {
      tags: ['Jobs'],
      summary: 'Update a job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobUpdateRequest' },
          },
        },
      },
      responses: {
        200: { description: 'Job updated' },
        401: { description: 'Unauthorized' },
        404: { description: 'Job not found' },
      },
    },
    delete: {
      tags: ['Jobs'],
      summary: 'Delete a job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Job deleted' },
        401: { description: 'Unauthorized' },
        404: { description: 'Job not found' },
      },
    },
  },

  '/api/jobs/{jobId}/close': {
    post: {
      tags: ['Jobs'],
      summary: 'Close a job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Job closed' },
        401: { description: 'Unauthorized' },
        404: { description: 'Job not found' },
      },
    },
  },

  '/api/jobs/{jobId}/archive': {
    post: {
      tags: ['Jobs'],
      summary: 'Archive a job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Job archived' },
        401: { description: 'Unauthorized' },
        404: { description: 'Job not found' },
      },
    },
  },

  '/api/jobs/{jobId}/applications': {
    get: {
      tags: ['Jobs'],
      summary: 'Get applicants for a job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Applicant list' },
        401: { description: 'Unauthorized' },
        404: { description: 'Job not found' },
      },
    },
  },

  '/api/jobs/{jobId}/apply': {
    post: {
      tags: ['Jobs'],
      summary: 'Apply to a job',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                fullName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                coverMessage: { type: 'string' },
                experience: { type: 'string' },
                resumeLink: { type: 'string' },
                resume: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Application submitted' },
        401: { description: 'Unauthorized' },
        404: { description: 'Job not found' },
      },
    },
  },

  '/api/jobs/applications/me': {
    get: {
      tags: ['Jobs'],
      summary: 'List my applications',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Applications list' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/applications/history': {
    get: {
      tags: ['Jobs'],
      summary: 'List completed applications',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Completed applications' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/applications/history/clear': {
    post: {
      tags: ['Jobs'],
      summary: 'Clear application history',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'History cleared' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/applications/{applicationId}/archive': {
    post: {
      tags: ['Jobs'],
      summary: 'Archive a completed application',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Application archived' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/{jobId}/applications/{applicationId}/hire': {
    post: {
      tags: ['Jobs'],
      summary: 'Hire an applicant',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Applicant hired' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/{jobId}/applications/{applicationId}/complete': {
    post: {
      tags: ['Jobs'],
      summary: 'Mark application complete',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Application completed' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/jobs/{jobId}/applications/{applicationId}/reject': {
    post: {
      tags: ['Jobs'],
      summary: 'Reject an applicant',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Applicant rejected' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = { swaggerSpec };
