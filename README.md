# Microservices & JWT-RSA Authentication

<img src="https://drive.usercontent.google.com/download?id=1raif7IeJ8ZjIAwnlfsERMkWAJDGRuPGb&export=view&authuser=0">

<img src="https://drive.usercontent.google.com/download?id=1lAmYK24he214P0QV9NxJTxM4E5pvz-uN&export=view&authuser=0">

<img src="https://drive.usercontent.google.com/download?id=1TAWjzH43jvqWG7ZczenW4lzGw20I5GkX&export=view&authuser=0">

## Comprehensive Guide

---

## 📚 Table of Contents
1. [Introduction to Microservices](#introduction-to-microservices)
2. [Understanding JWT (JSON Web Tokens)](#understanding-jwt)
3. [RSA Cryptography Explained](#rsa-cryptography)
4. [JWT-RSA Integration](#jwt-rsa-integration)
5. [Practical Implementation](#practical-implementation)
6. [Testing the Application](#testing-the-application)
7. [Best Practices & Security](#best-practices)

---

## 🏗️ Introduction to Microservices

### What Are Microservices?
- **Definition**: An architectural pattern that breaks down complex applications into smaller, independent services
- Each service is self-contained and handles a specific business capability
- Services communicate with each other through well-defined APIs (typically REST or message queues)

### Key Characteristics
- **Independence**: Each service runs in its own process
- **Autonomy**: Services can be developed, deployed, and scaled independently
- **Decentralization**: No single point of failure
- **Business-focused**: Each service aligns with a specific business function

### Core Benefits

#### 1. Independent Scaling
- Scale only the services that need more resources
- Cost-effective resource utilization
- Example: Scale payment service during peak shopping hours without scaling the entire application

#### 2. Fault Isolation
- Failure in one service doesn't bring down the entire system
- Improved system resilience
- Easier debugging and maintenance

#### 3. Faster Deployment Cycles
- Teams can deploy services independently
- Reduced deployment risk
- Enables continuous delivery and DevOps practices

#### 4. Technology Flexibility
- Each service can use different programming languages
- Choose the best tool for each specific job
- Example: Python for ML service, Node.js for API gateway, Go for high-performance services

#### 5. Team Organization
- Small, focused teams own individual services
- Clear boundaries and responsibilities
- Improved productivity and ownership

### Challenges to Consider
- **Complexity**: Managing multiple services requires orchestration
- **Network latency**: Inter-service communication overhead
- **Data consistency**: Distributed transactions are complex
- **Monitoring**: Need centralized logging and monitoring solutions

---

## 🔐 Understanding JWT (JSON Web Tokens)

### What is JWT?
- A compact, URL-safe token format for securely transmitting information between parties
- Self-contained: Carries all necessary information about the user
- Primarily used for **authentication** and **authorization** in modern web applications

### JWT Structure

A JWT consists of three parts separated by dots (`.`):

```
<Header>.<Payload>.<Signature>
```

#### 1. Header
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```
- **alg**: Algorithm used for signing (RS256 = RSA with SHA-256)
- **typ**: Token type (always "JWT")

#### 2. Payload (Claims)
```json
{
  "email": "user@example.com",
  "role": "user",
  "exp": 1716742020,
  "iat": 1716738420
}
```
- Contains the actual data (claims)
- **Standard claims**: `exp` (expiration), `iat` (issued at), `sub` (subject), `iss` (issuer)
- **Custom claims**: Any application-specific data (email, role, userId, etc.)

#### 3. Signature
- Created by encoding header + payload and signing with a secret key
- Ensures token hasn't been tampered with
- Format: `RSASHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), privateKey)`

### How JWT Works (Flow)
1. **User logs in** with credentials
2. **Server validates** credentials
3. **Server generates** JWT and signs it
4. **Server sends** JWT to client
5. **Client stores** JWT (usually in localStorage or cookie)
6. **Client includes** JWT in subsequent requests via `Authorization: Bearer <token>` header
7. **Server verifies** JWT signature and extracts user info
8. **Server grants/denies** access based on token validity and claims

### Advantages of JWT
- **Stateless**: No need to store session data on server
- **Scalable**: Works well with load balancers and distributed systems
- **Cross-domain**: Can be used across different domains
- **Mobile-friendly**: Easy to use with mobile apps and SPAs
- **Performance**: No database lookup needed for authentication

---

## 🔑 RSA Cryptography Explained

### What is RSA?
- RSA (Rivest–Shamir–Adleman) is an **asymmetric cryptographic algorithm**
- Uses a pair of mathematically related keys: **public key** and **private key**
- What one key encrypts, only the other can decrypt

### Key Pair Concept

| Key Type | Purpose | Who Has It? |
|----------|---------|-------------|
| **Private Key** 🔐 | Sign tokens, decrypt messages | Auth service only (kept secret) |
| **Public Key** 🔓 | Verify signatures, encrypt messages | All services (can be shared freely) |

### How RSA Signing Works

#### Signing Process (Auth Service)
1. Create JWT header and payload
2. Encode them as Base64URL
3. **Sign** the encoded data with **private key**
4. Append signature to create complete JWT
5. Send JWT to client

#### Verification Process (Other Services)
1. Receive JWT from client
2. Fetch **public key** from auth service
3. **Verify** signature using public key
4. If valid, extract and trust the payload
5. If invalid, reject the request

### Why RSA for JWT?

#### Security Benefits
- **Private key never leaves** the auth service
- Even if public key is compromised, attackers cannot forge tokens
- Mathematical guarantee of authenticity

#### Practical Benefits
- **Decentralized verification**: Any service can verify tokens independently
- **No shared secrets**: Unlike HMAC, no need to distribute secret keys
- **Scalability**: New services just need the public key

---

## 🔗 JWT-RSA Integration

### Why Combine JWT with RSA?

| Feature | Benefit |
|---------|---------|
| **Centralized Authentication** | Auth service controls token generation |
| **Decentralized Authorization** | Each service verifies tokens independently |
| **Security** | Private key isolation prevents token forgery |
| **Stateless** | No session storage needed across services |
| **Scalability** | Services don't need to call auth service for every request |
| **Tamper-Proof** | Cryptographic signature detects any modifications |

### Authentication Flow in Microservices

```
1. Client → Auth Service
   POST /login { email, password, role }

2. Auth Service
   - Validates credentials
   - Creates JWT payload with user info
   - Signs JWT with PRIVATE KEY
   - Returns JWT to client

3. Client → User/Raider Service
   POST /book
   Headers: { Authorization: Bearer <JWT> }

4. User/Raider Service
   - Extracts JWT from header
   - Fetches PUBLIC KEY from auth service
   - Verifies JWT signature
   - Checks role and permissions
   - Allows or denies access

5. Response to Client
   Success: 200 OK
   Failure: 401/403 Error
```

### Key Advantages in Microservices Architecture

#### 1. No Inter-Service Dependencies
- Services don't need to call auth service for every request
- Reduces network overhead and latency
- Improves system resilience

#### 2. Role-Based Access Control (RBAC)
- JWT payload contains user role
- Each service checks role before granting access
- Fine-grained authorization at service level

#### 3. Token Expiration
- JWTs have built-in expiration (`exp` claim)
- Automatic security improvement
- Forces periodic re-authentication

#### 4. Horizontal Scaling
- New service instances can verify tokens immediately
- No session synchronization needed
- Perfect for containerized deployments

---

## 💻 Practical Implementation

### Use Case: Bike Taxi Application

We'll build **3 microservices** demonstrating JWT-RSA authentication:

| Service | Port | Role | Functionality |
|---------|------|------|---------------|
| **Auth Service** | 3000 | Authentication | Login, JWT generation, public key endpoint |
| **User Service** | 3001 | User operations | Book rides (users only) |
| **Raider Service** | 3002 | Raider operations | Accept bookings (raiders only) |

### Architecture Diagram (Text Representation)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /login (email, password, role)
       ↓
┌──────────────────┐
│  Auth Service    │
│    (Port 3000)   │
│                  │
│  [Private Key]   │
└────────┬─────────┘
         │
         │ 2. JWT Token
         ↓
┌─────────────┐
│   Client    │ (stores JWT)
└──────┬──────┘
       │
       ├─→ 3a. POST /book + JWT → ┌──────────────────┐
       │                          │  User Service    │
       │                          │   (Port 3001)    │
       │                    ┌─────┤ [Public Key]     │
       │                    │     └──────────────────┘
       │                    │ Verifies JWT
       │                    │
       └─→ 3b. POST /accept-booking + JWT
                              ↓
                       ┌──────────────────┐
                       │ Raider Service   │
                       │   (Port 3002)    │
                       │ [Public Key]     │
                       └──────────────────┘
                         Verifies JWT
```

---

### 📁 Project Structure

```
jwt-rsa-microservices/
├── auth-service/
│   ├── keys/
│   │   ├── private.key    # RSA private key (keep secret!)
│   │   └── public.key     # RSA public key (shared)
│   ├── package.json
│   └── index.js
│
├── user-service/
│   ├── package.json
│   └── index.js
│
└── raider-service/
    ├── package.json
    └── index.js
```

---

### 🔧 Step 1: Generate RSA Keys

**Location**: `auth-service/keys/`

```bash
# Navigate to auth service
cd auth-service
mkdir keys
cd keys

# Generate 2048-bit RSA private key
openssl genrsa -out private.key 2048

# Extract public key from private key
openssl rsa -in private.key -pubout -out public.key
```

**Understanding the Commands**:
- `genrsa`: Generate RSA private key
- `-out private.key`: Output filename
- `2048`: Key size in bits (good balance of security and performance)
- `-pubout`: Output public key format

**Security Note**: ⚠️ Never commit `private.key` to version control!

---

### 🔐 Step 2: Auth Service Implementation

**Port**: 3000

#### Install Dependencies
```bash
cd auth-service
npm init -y
npm install express jsonwebtoken body-parser
```

#### Code: `auth-service/index.js`

```javascript
const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Load private key from file system
const privateKey = fs.readFileSync('./keys/private.key', 'utf8');

// 🔐 Login Route - Authenticate and issue JWT
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  // Validate role
  if (!['user', 'raider'].includes(role)) {
    return res.status(400).send('Invalid role');
  }

  // In production: validate password against database
  // For demo: accepting any password

  // Create JWT payload
  const token = jwt.sign(
    { email, role },           // Payload
    privateKey,                // Private key for signing
    {
      algorithm: 'RS256',      // RSA with SHA-256
      expiresIn: '1h',         // Token expires in 1 hour
    }
  );

  res.json({
    status: true,
    message: 'Login Successful',
    token
  });
});

// 📤 Public Key Endpoint - For other services to verify tokens
app.get('/public-key', (req, res) => {
  const publicKey = fs.readFileSync('./keys/public.key', 'utf8');
  res.type('text/plain').send(publicKey);
});

// Start server
app.listen(3000, () => {
  console.log('🔐 Auth Service running on port 3000');
});
```

**Key Points**:
- Private key is read once at startup (not per request)
- Login endpoint accepts email, password, and role
- JWT contains email and role in payload
- Public key endpoint allows other services to fetch verification key
- In production, add password hashing and database validation

---

### 👤 Step 3: User Service Implementation

**Port**: 3001

#### Install Dependencies
```bash
cd ../user-service
npm init -y
npm install express jsonwebtoken axios body-parser
```

#### Code: `user-service/index.js`

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// ✅ Middleware: Authenticate JWT
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).send('Missing Authorization header');
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];

  try {
    // Fetch public key from auth service
    const response = await axios.get('http://localhost:3000/public-key');
    const publicKey = response.data;

    // Verify token using public key
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });

    // Attach decoded user info to request
    req.user = decoded;
    next();

  } catch (err) {
    res.status(403).send('Invalid token');
  }
}

// 🚖 Book Ride Route - Only for users
app.post('/book', authenticate, (req, res) => {
  // Check if user has correct role
  if (req.user.role !== 'user') {
    return res.status(403).send('Only users can book rides');
  }

  res.json({
    success: true,
    message: 'Booking successful',
    user: req.user.email
  });
});

// Start server
app.listen(3001, () => {
  console.log('👤 User Service running on port 3001');
});
```

**Key Points**:
- `authenticate` middleware runs before route handler
- Fetches public key from auth service
- Verifies JWT signature cryptographically
- Checks role-based permissions
- Returns 403 if role doesn't match

---

### 🏍️ Step 4: Raider Service Implementation

**Port**: 3002

#### Install Dependencies
```bash
cd ../raider-service
npm init -y
npm install express jsonwebtoken axios body-parser
```

#### Code: `raider-service/index.js`

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// ✅ Middleware: Authenticate JWT
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    // Fetch public key from auth service
    const response = await axios.get('http://localhost:3000/public-key');
    const publicKey = response.data;

    // Verify token
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });

    req.user = decoded;
    next();

  } catch (err) {
    res.status(403).send('Invalid token');
  }
}

// ✅ Accept Booking Route - Only for raiders
app.post('/accept-booking', authenticate, (req, res) => {
  // Check if user has correct role
  if (req.user.role !== 'raider') {
    return res.status(403).send('Only raiders can accept bookings');
  }

  res.json({
    success: true,
    message: 'Booking accepted',
    raider: req.user.email
  });
});

// Start server
app.listen(3002, () => {
  console.log('🏍️ Raider Service running on port 3002');
});
```

**Key Points**:
- Similar structure to user service
- Different role requirement ('raider' instead of 'user')
- Demonstrates role-based access control (RBAC)
- Each service independently validates tokens

---

## 🧪 Testing the Application

### Step 1: Start All Services

Open 3 terminal windows:

```bash
# Terminal 1 - Auth Service
cd auth-service
node index.js

# Terminal 2 - User Service
cd user-service
node index.js

# Terminal 3 - Raider Service
cd raider-service
node index.js
```

---

### Step 2: Test Authentication

#### Login as User
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Expected Response**:
```json
{
  "status": true,
  "message": "Login Successful",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Copy the token** for next steps!

---

#### Login as Raider
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@example.com",
    "password": "password123",
    "role": "raider"
  }'
```

---

### Step 3: Test User Service

#### ✅ Valid Request (User booking ride)
```bash
curl -X POST http://localhost:3001/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{}'
```

**Expected Response**: ✅
```json
{
  "success": true,
  "message": "Booking successful",
  "user": "john@example.com"
}
```

---

#### ❌ Invalid Request (Raider trying to book)
```bash
curl -X POST http://localhost:3001/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <RAIDER_TOKEN>" \
  -d '{}'
```

**Expected Response**: ❌
```
Only users can book rides
```

---

### Step 4: Test Raider Service

#### ✅ Valid Request (Raider accepting booking)
```bash
curl -X POST http://localhost:3002/accept-booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <RAIDER_TOKEN>" \
  -d '{}'
```

**Expected Response**: ✅
```json
{
  "success": true,
  "message": "Booking accepted",
  "raider": "rider@example.com"
}
```

---

#### ❌ Invalid Request (User trying to accept booking)
```bash
curl -X POST http://localhost:3002/accept-booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{}'
```

**Expected Response**: ❌
```
Only raiders can accept bookings
```

---

### Step 5: Test Security Features

#### Missing Token
```bash
curl -X POST http://localhost:3001/book \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: `Missing Authorization header` (401)

---

#### Invalid/Tampered Token
```bash
curl -X POST http://localhost:3001/book \
  -H "Authorization: Bearer invalid.token.here" \
  -d '{}'
```

**Response**: `Invalid token` (403)

---

#### Expired Token
Wait 1 hour after getting token, then use it:

**Response**: `Invalid token` (403) - JWT library detects expiration

---

## 🛡️ Best Practices & Security

### Security Best Practices

#### 1. Private Key Protection
- ⚠️ **Never** commit private keys to Git
- Store in environment variables or secret management systems
- Use `.gitignore` to exclude key files
- Rotate keys periodically

#### 2. Token Expiration
- Use short-lived tokens (15-60 minutes)
- Implement refresh token mechanism for longer sessions
- Store refresh tokens securely (HTTP-only cookies)

#### 3. HTTPS Only
- Always use HTTPS in production
- JWTs in plain HTTP are vulnerable to interception
- Implement HSTS (HTTP Strict Transport Security)

#### 4. Token Storage (Client-Side)
- **Best**: HTTP-only cookies (prevents XSS attacks)
- **Acceptable**: localStorage (convenient but vulnerable to XSS)
- **Avoid**: sessionStorage or global variables

#### 5. Input Validation
- Validate all incoming data
- Sanitize user inputs
- Use parameterized queries for database operations
- Implement rate limiting on login endpoint

---

### Production Enhancements

#### 1. Caching Public Key
```javascript
let cachedPublicKey = null;

async function getPublicKey() {
  if (!cachedPublicKey) {
    const response = await axios.get('http://localhost:3000/public-key');
    cachedPublicKey = response.data;
  }
  return cachedPublicKey;
}
```
**Benefit**: Reduces calls to auth service

---

#### 2. Token Refresh Mechanism
```javascript
// Auth service
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  // Verify refresh token
  // Issue new access token
  const newToken = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m'
  });
  
  res.json({ token: newToken });
});
```

---

#### 3. Centralized Error Handling
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

---

#### 4. Environment Variables
```javascript
// .env file
PORT=3000
AUTH_SERVICE_URL=http://localhost:3000
JWT_EXPIRY=1h
NODE_ENV=production

// Load in code
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

---

#### 5. Logging and Monitoring
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log authentication attempts
logger.info('Login attempt', { email, timestamp: new Date() });
```

---

### Common Pitfalls to Avoid

#### 1. ❌ Storing Sensitive Data in JWT Payload
- JWTs are **encoded**, not **encrypted**
- Anyone can decode and read the payload
- Never store passwords, credit card numbers, or sensitive personal data

#### 2. ❌ No Token Expiration
- Tokens without expiration are security risks
- Always set `expiresIn` option

#### 3. ❌ Weak Key Size
- Use at least 2048-bit RSA keys
- 4096-bit for high-security applications

#### 4. ❌ Not Validating Algorithm
- Always specify `algorithms: ['RS256']` when verifying
- Prevents algorithm confusion attacks

#### 5. ❌ Trusting Client-Side Validation
- Always validate permissions on the server
- Client-side checks are for UX only

---

### Monitoring Checklist

- [ ] Log all authentication attempts
- [ ] Monitor failed login attempts (potential attacks)
- [ ] Track token verification failures
- [ ] Set up alerts for unusual patterns
- [ ] Monitor service health and uptime
- [ ] Track API response times
- [ ] Implement distributed tracing (e.g., Jaeger, Zipkin)

---

## 📊 Comparison: Symmetric vs Asymmetric JWT

| Feature | HMAC (Symmetric) | RSA (Asymmetric) |
|---------|------------------|------------------|
| **Keys** | Single shared secret | Public/Private key pair |
| **Security** | Secret must be shared with all services | Private key stays in one place |
| **Verification** | Any service with secret can create tokens | Only auth service can create tokens |
| **Use Case** | Simple, single-application auth | Microservices, distributed systems |
| **Performance** | Faster (symmetric operations) | Slower (asymmetric operations) |
| **Scalability** | Harder (secret distribution) | Easier (public key distribution) |

---

## 🎯 Key Takeaways

### Microservices
✅ Break applications into small, independent services  
✅ Each service handles one business capability  
✅ Services communicate via APIs  
✅ Enables independent scaling and deployment  

### JWT
✅ Compact, self-contained token format  
✅ Contains user identity and claims  
✅ Stateless authentication  
✅ Perfect for APIs and microservices  

### RSA
✅ Asymmetric encryption with key pairs  
✅ Private key signs, public key verifies  
✅ Secure token generation and validation  
✅ Enables decentralized authentication  

### JWT + RSA + Microservices
✅ Centralized authentication, decentralized authorization  
✅ Each service independently verifies tokens  
✅ Scalable and secure architecture  
✅ Role-based access control built-in  

---

## 🚀 Next Steps for Learning

1. **Add Database Integration**
   - Store user credentials in MongoDB/PostgreSQL
   - Hash passwords with bcrypt
   - Implement user registration

2. **Implement Refresh Tokens**
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Secure refresh token storage

3. **Add API Gateway**
   - Single entry point for all services
   - Request routing and load balancing
   - Centralized CORS and rate limiting

4. **Containerize with Docker**
   - Create Dockerfile for each service
   - Use docker-compose for orchestration
   - Deploy to Kubernetes

---

## 📚 Additional Resources

- [JWT.io](https://jwt.io) - Decode and verify JWTs
- [Microservices.io](https://microservices.io) - Microservices patterns
- [OpenSSL Documentation](https://www.openssl.org/docs/) - Key generation
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) - Security best practices

---

## 💡 Discussion Points

1. **When should you use microservices vs monoliths?**
2. **What are the trade-offs of JWT-based authentication?**
3. **How would you handle service-to-service authentication?**
4. **What happens if the auth service goes down?**
5. **How do you revoke a JWT before it expires?**
6. **What are alternatives to RSA (e.g., ECDSA)?**
7. **How do you handle token refresh in a distributed system?**

---

**End of Session Guide** 🎉

This document provides a comprehensive foundation for understanding and implementing JWT-RSA authentication in a microservices architecture. Practice building, testing, and securing these services to master the concepts!