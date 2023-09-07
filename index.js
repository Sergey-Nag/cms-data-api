const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const bodyParser = require('body-parser');
const schema = require('./schema');
const swaggerConf = require('./swaggerConfig');
const userRoutes = require('./restApi/userRoutes');
const { authenticateNotExpiredTokenMiddleware } = require('./middlewares/authenticateMiddleware');
const app = express();

const PORT = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: process.env.SERVER_ORIGIN ?? 'http://localhost'
}));
app.use(bodyParser.json());

if (isDev) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConf));
}

app.use('/api', userRoutes);
app.use('/graphql',
  authenticateNotExpiredTokenMiddleware,
  graphqlHTTP((req) => {
    return {
      schema,
      ...(
        isDev 
        ? {
          graphiql: {
            headerEditorEnabled: true,
          },
        } 
        : {}
      ),
      context: { actionUserId: req.userId },
    }
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `
      Server is running on http://localhost:${PORT}
      GprahQL playground is running on http://localhost:${PORT}/graphql
      REST API Swagger is running on http://localhost:${PORT}/api-docs
      `
    );
  });
}

module.exports = app;