require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const membersRouter = require('./routes/api/members');
const eventsRouter = require('./routes/api/events');
const blogsRouter = require('./routes/api/blogs');
const adminRouter = require('./routes/api/admin');

const app = express();

// Allow CORS for the production frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://onevoicengo.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
  res.send('One Voice NGO API is running...');
});

// DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connect error:', err));

app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API server running on ${PORT}`));
