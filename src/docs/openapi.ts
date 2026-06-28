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
    { url: 'http://localhost:8000', description: 'Local development' },
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
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
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
        description: 'Returns a single application. Requires REVIEWER or ADMIN role.',
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
