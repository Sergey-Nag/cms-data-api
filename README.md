# Data API Node.js Server
This repository contains the source code for the Data API Node.js server. It serves as the backend API using GraphQL and Rest endpoints.
- [Main (host) app](https://github.com/Sergey-Nag/mf-host-app)
- [Admin panel (microfrontend) app](https://github.com/Sergey-Nag/mf-admin-app)

## Project Setup

### Prerequisites

Make sure you have Node.js (v20)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sergey-Nag/cms-data-api.git
   cd cms-data-api
   ```

2. Install project dependencies:

   ```bash
   npm install
   ```

## Available Scripts

### Start the Server

To start the server in production mode:

```bash
npm start
```

To start the server in production mode (without GraphiQl and Swagger documentation)

```bash
npm run start:local
```

To start the server in development mode (with documentation)
  - http://localhost:4000/graphql - Graphiql playground and documentation
  - http://localhost:4000/api-docs - REST API Swagger documentation

```bash
npm run start:dev
```

To start the server in development mode with nodemon (auto-restart on code changes):
(It clears all sessions! You must re-authorize).
```bash
npm run dev
```

### Testing

To run tests with Jest:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Dependencies

This server application relies on several dependencies to provide its functionality. Key dependencies include:

- Express.js for building the API routes and handling HTTP requests.
- GraphQL for querying and manipulating data.
- Bcrypt for password hashing and security.
- JSON Web Tokens (JWT) for user authentication.
- Jest for testing and test coverage.

