const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.route');
const blogRoutes = require('./routes/blog.route');
const logger = require('./utils/logger');

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

const globalErrorHandler = require('./middlewares/error.middleware');

// Error handling
app.use(globalErrorHandler);

module.exports = app;