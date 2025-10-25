const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Middleware to verify JWT
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Missing Authorization header');

  const token = authHeader.split(' ')[1];
  try {
    // Fetch public key from Auth Service
    const response = await axios.get('http://localhost:3000/public-key');
    const publicKey = response.data;

    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Invalid token');
  }
}

// Booking route
app.post('/book', authenticate, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).send('Only users can book rides');
  }

  res.json({ success: true, message: 'Booking successful' });
});

// Start service
app.listen(3001, () => {
  console.log('🚀 User Service running on port 3001');
});
