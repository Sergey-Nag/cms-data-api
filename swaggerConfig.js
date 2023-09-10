const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'Data api',
      version: '1.0.0',
      description: 'Users REST API documentation',
    },
    servers: [
      {
        url: '/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./restApi/*Routes.js'], // Path to your route files
  consumes: ['application/json'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;