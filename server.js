require('dotenv').config(); // <--- Add this at the top!
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Connect to database
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
});