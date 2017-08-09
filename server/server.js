const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const router = require('./routes');

require('dotenv').config();

const app = express();

// Help locate unhandled Promise rejections
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// Middleware
app.use(cors({
  origin: `${process.env.CORS_ORIGIN || '*'}`,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: 'Accept, Origin, Content-Type, Referer',
  credentials: true,
}));
app.use(compression({ level: 9, threshold: 0 }));
app.use('/', express.static(path.join(__dirname, '../dist')));

// Log all requests
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : 'No body'}`);
  next();
});

// Router
app.use(router);

// Log errors
app.use((req, res) => {
  res.status(500).json({ error: 'Something went wrong' }).end();
});

app.listen(3000);
