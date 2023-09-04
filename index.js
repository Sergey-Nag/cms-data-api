const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');

const app = express();

app.use('/graphql', graphqlHTTP((req) => {
  console.log(req);
  return {
    schema,
    graphiql: true, // Enable the GraphiQL UI for testing
  }
}));

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}\nGprahQL playground is running on http://localhost:${PORT}/graphql`);
    });
}

module.exports = app;