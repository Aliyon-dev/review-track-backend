declare const openApiSpec: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            };
        };
        schemas: {
            SuccessResponse: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    data: {
                        type: string;
                    };
                };
            };
            ErrorResponse: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    message: {
                        type: string;
                    };
                };
            };
            User: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: string;
                    };
                    firstName: {
                        type: string;
                        example: string;
                    };
                    lastName: {
                        type: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                };
            };
        };
    };
    paths: {
        '/api/health': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                            example: boolean;
                                        };
                                        message: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/auth/login': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                        example: string;
                                    };
                                    password: {
                                        type: string;
                                        format: string;
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                            example: boolean;
                                        };
                                        data: {
                                            type: string;
                                            properties: {
                                                token: {
                                                    type: string;
                                                    example: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export default openApiSpec;
//# sourceMappingURL=openapi.d.ts.map