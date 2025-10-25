const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());

// Load RSA private key
const privateKey = fs.readFileSync('./keys/private.key');

// login route
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!['user', 'raider'].includes(role)) {
    return res.status(400).send('Invalid role');
  }

  const token = jwt.sign({ email, role }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  });

  res.json({ status: true, message: 'Login Successfully', token });
});

// Serve public key
app.get('/public-key', (req, res) => {
  const publicKey = fs.readFileSync('./keys/public.key', 'utf8');
  res.type('text/plain').send(publicKey);
});

app.listen(3000, () => {
  console.log('Auth Service running on port 3000');
});
