const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require('body-parser');
const schema = require('./src/schema');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');
const userRoutes = require('./src/routes/userRoutes');
const tokenRoutes = require('./src/routes/tokenRoutes');
const authUserMiddleware = require('./src/middlewares/authUserMiddleware');

const app = express();

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const apiRouter = express.Router();
apiRouter.use(userRoutes);
apiRouter.use(tokenRoutes);
app.use('/api', apiRouter);
app.use(authUserMiddleware);
app.use('/graphql', graphqlHTTP((req) => {
  return {
    schema,
    graphiql: {
      headerEditorEnabled: true,
    },
    context: { user: req.user },
  }
}));

const PORT = process.env.PORT || 4000;
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