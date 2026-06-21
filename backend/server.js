const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Load environment variables from .env file
dotenv.config({ override: true });

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Configure CORS to allow frontend connection
app.use(cors());

// Configure JSON/URL body limit to 10MB to accommodate Base64 image uploads safely
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logger for development mode
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// API Routes mount points
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Base route for status checking
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SocialConnect API server is fully operational.',
  });
});

// Fallback Middlewares for Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
// Trigger nodemon restart 2

module.exports = app;
