const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'Data api',
      version: '1.0.0',
      description: 'Users REST API documentation',
    },
    basePath: '/api',
    definitions: {
        User: {
          type: 'object',
          properties: {
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
      },
  },
  apis: ['./src/routes/*.js'], // Path to your route files
  consumes: ['application/json']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
