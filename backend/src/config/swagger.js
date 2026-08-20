import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PlaceX API',
      version: '1.0.0',
      description:
        'PlaceX — AI-Powered Campus Placement Management System. ' +
        'RESTful API for Students, Company Recruiters, and Placement Officers.',
      contact: {
        name: 'PlaceX Team',
        email: 'support@placex.app',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {},
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
