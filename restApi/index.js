const express = require('express');
const userRoutes = require('./userRoutes');
const tokenRoutes = require('./tokenRoutes');
const restApiRouter = express.Router();

restApiRouter.use(userRoutes);
restApiRouter.use(tokenRoutes);

module.exports = restApiRouter;