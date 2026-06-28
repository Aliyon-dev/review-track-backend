import env from '@/config/env';

const bearerAuth = { bearerAuth: [] };

const errorResponses = {
  401: {
    description: 'Unauthorized',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
  403: {
    description: 'Forbidden',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
  422: {
    description: 'Validation / transition error',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
  },
};

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Review Track API',
    version: '1.0.0',
    description: 'Backend API for the Review Track application.',
  },
  servers: [
    { url: env.apiUrl, description: 'API server' },
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
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1abc123' },
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          role: { type: 'string', enum: ['APPLICANT', 'REVIEWER', 'ADMIN'], example: 'APPLICANT' },
        },
      },
      Application: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1abc123' },
          title: { type: 'string', example: 'Software Engineer Application' },
          description: { type: 'string', example: 'I have 5 years of experience...' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
            example: 'DRAFT',
          },
          applicantId: { type: 'string', example: 'clx1abc123' },
          applicant: {
            type: 'object',
            properties: {
              firstName: { type: 'string', example: 'Jane' },
              lastName: { type: 'string', example: 'Doe' },
            },
          },
          type: { type: 'string', nullable: true, example: 'GRANT' },
          priority: { type: 'string', nullable: true, example: 'HIGH' },
          amount: { type: 'number', nullable: true, example: 50000 },
          justification: { type: 'string', nullable: true, example: 'Required for project funding...' },
          submittedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityEvent: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['STATUS_CHANGE', 'COMMENT'] },
          id: { type: 'string', example: 'clx1abc123' },
          createdAt: { type: 'string', format: 'date-time' },
          fromStatus: { type: 'string', nullable: true },
          toStatus: { type: 'string', nullable: true },
          changedBy: { type: 'string', nullable: true },
          changedByName: { type: 'string', nullable: true, example: 'Jane Doe' },
          comment: { type: 'string', nullable: true },
          reviewerId: { type: 'string', nullable: true },
          reviewerName: { type: 'string', nullable: true, example: 'John Smith' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns 200 when the API is reachable.',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'API is running' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Authenticates a user and returns a JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', format: 'password', example: 'supersecret' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGci...' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Returns the authenticated user\'s profile.',
        security: [bearerAuth],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Semantic logout endpoint. JWT is stateless — client must discard the token.',
        security: [bearerAuth],
        responses: {
          200: {
            description: 'Logged out',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { message: { type: 'string', example: 'Logged out' } },
                    },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
        },
      },
    },

    '/api/applications': {
      post: {
        tags: ['Applications'],
        summary: 'Create application',
        description: 'Creates a new application in DRAFT status. Requires APPLICANT role.',
        security: [bearerAuth],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                  title: { type: 'string', example: 'Software Engineer Application' },
                  description: { type: 'string', example: 'I have 5 years of experience...' },
                  type: { type: 'string', example: 'GRANT' },
                  priority: { type: 'string', example: 'HIGH' },
                  amount: { type: 'number', example: 50000 },
                  justification: { type: 'string', example: 'Required for project funding...' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Application created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
        },
      },
      get: {
        tags: ['Applications'],
        summary: 'List all applications',
        description: 'Returns all applications. Requires REVIEWER or ADMIN role.',
        security: [bearerAuth],
        responses: {
          200: {
            description: 'List of applications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
        },
      },
    },

    '/api/applications/my': {
      get: {
        tags: ['Applications'],
        summary: 'My applications',
        description: "Returns the authenticated applicant's own applications. Requires APPLICANT role.",
        security: [bearerAuth],
        responses: {
          200: {
            description: 'List of own applications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
        },
      },
    },

    '/api/applications/{id}': {
      get: {
        tags: ['Applications'],
        summary: 'Get application by ID',
        description: 'Returns a single application. REVIEWER/ADMIN can fetch any; APPLICANT can only fetch their own.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Application found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      patch: {
        tags: ['Applications'],
        summary: 'Update application',
        description: 'Updates a DRAFT or CHANGES_REQUESTED application. Requires APPLICANT role and ownership.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Title' },
                  description: { type: 'string', example: 'Updated description...' },
                  type: { type: 'string', example: 'GRANT' },
                  priority: { type: 'string', example: 'MEDIUM' },
                  amount: { type: 'number', example: 25000 },
                  justification: { type: 'string', example: 'Updated justification...' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Application updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
      delete: {
        tags: ['Applications'],
        summary: 'Delete application',
        description: 'Soft-deletes a DRAFT application. Requires APPLICANT role and ownership.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          204: { description: 'Application deleted' },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },

    '/api/applications/{id}/comments': {
      post: {
        tags: ['Reviews'],
        summary: 'Add comment',
        description: 'Adds a comment to an application. Requires REVIEWER or ADMIN role.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['comment'],
                properties: {
                  comment: { type: 'string', example: 'Please provide more details about your experience.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Comment added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        comment: { type: 'string' },
                        applicationId: { type: 'string' },
                        reviewerId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          422: errorResponses[422],
        },
      },
    },

    '/api/applications/{id}/events': {
      get: {
        tags: ['Reviews'],
        summary: 'Activity timeline',
        description: 'Returns the merged activity timeline (status changes + comments) for an application, sorted by date.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Activity events',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ActivityEvent' } },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
        },
      },
    },

    '/api/applications/{id}/submit': {
      patch: {
        tags: ['Applications'],
        summary: 'Submit application',
        description: 'Submits an application for review, transitioning it from DRAFT to SUBMITTED. Requires APPLICANT role and ownership of the application.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Application submitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },

    '/api/reviewer/applications': {
      get: {
        tags: ['Reviewer'],
        summary: 'List all applications',
        description: 'Returns all applications. Requires REVIEWER role.',
        security: [bearerAuth],
        responses: {
          200: {
            description: 'List of applications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
        },
      },
    },

    '/api/reviewer/applications/{id}': {
      get: {
        tags: ['Reviewer'],
        summary: 'Get application by ID',
        description: 'Returns a single application. Requires REVIEWER role.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Application found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },

    '/api/reviewer/applications/{id}/start-review': {
      post: {
        tags: ['Reviewer'],
        summary: 'Start review',
        description: 'Transitions the application from SUBMITTED to UNDER_REVIEW. Requires REVIEWER role.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Review started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },

    '/api/reviewer/applications/{id}/approve': {
      post: {
        tags: ['Reviewer'],
        summary: 'Approve application',
        description: 'Transitions the application from UNDER_REVIEW to APPROVED. Requires REVIEWER role.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Application approved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },

    '/api/reviewer/applications/{id}/reject': {
      post: {
        tags: ['Reviewer'],
        summary: 'Reject application',
        description: 'Transitions the application from UNDER_REVIEW to REJECTED. Requires REVIEWER role.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Application rejected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },

    '/api/reviewer/applications/{id}/return': {
      post: {
        tags: ['Reviewer'],
        summary: 'Return application',
        description: 'Transitions the application to CHANGES_REQUESTED. Requires REVIEWER role.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        responses: {
          200: {
            description: 'Application returned for changes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },

    '/api/applications/{id}/status': {
      patch: {
        tags: ['Applications'],
        summary: 'Update application status',
        description: 'Transitions an application to a new status. Requires REVIEWER or ADMIN role. Invalid workflow transitions are rejected with 422.',
        security: [bearerAuth],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'clx1abc123' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'DRAFT'],
                    example: 'UNDER_REVIEW',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
          401: errorResponses[401],
          403: errorResponses[403],
          404: {
            description: 'Application not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: errorResponses[422],
        },
      },
    },
  },
};

export default openApiSpec;
