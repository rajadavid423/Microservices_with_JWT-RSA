## 💡 Discussion Points

### 1. When should you use microservices vs monoliths?

**Use Microservices When:**
- Large teams working on different features
- Need to scale specific parts independently
- Different parts use different technologies
- Frequent deployments needed

**Use Monolith When:**
- Small team or startup
- Simple application
- Need fast development initially
- Limited infrastructure resources

**Answer**: Start with monolith, move to microservices when complexity and team size grows.

---

### 2. What are the trade-offs of JWT-based authentication?

**Advantages:**
- No server-side session storage needed
- Works well across multiple services
- Scalable and stateless

**Disadvantages:**
- Can't revoke tokens immediately (must wait for expiry)
- Token size larger than session IDs
- If compromised before expiry, can't stop usage

**Answer**: JWT is great for distributed systems but lacks instant revocation. Use short expiry times (15-60 min) to reduce risk.

---

### 3. How would you handle service-to-service authentication?

**Options:**

**Option 1: Mutual TLS (mTLS)**
- Services authenticate using certificates
- Most secure but complex to set up

**Option 2: Service Tokens**
- Each service has its own long-lived JWT
- Include service identity in token
```javascript
const serviceToken = jwt.sign(
  { service: 'user-service', role: 'internal' },
  privateKey,
  { expiresIn: '30d' }
);
```

**Option 3: API Keys**
- Simple shared secrets between services
- Less secure but easy to implement

**Answer**: For production, use mTLS or service-specific JWTs with longer expiry.

---

### 4. What happens if the auth service goes down?

**Problem:**
- Services can't fetch public key
- New logins fail
- Existing tokens still work (if services cached the public key)

**Solutions:**

**1. Cache Public Key** (Best for short outages)
```javascript
let cachedPublicKey = null;
let cacheTime = null;

async function getPublicKey() {
  if (cachedPublicKey && Date.now() - cacheTime < 3600000) {
    return cachedPublicKey; // Use cache for 1 hour
  }
  try {
    const response = await axios.get('http://auth-service/public-key');
    cachedPublicKey = response.data;
    cacheTime = Date.now();
    return cachedPublicKey;
  } catch (error) {
    if (cachedPublicKey) return cachedPublicKey; // Fallback to stale cache
    throw error;
  }
}
```

**2. Replicate Auth Service** (High availability)
- Run multiple instances behind load balancer
- Share same private/public key pair

**3. Store Public Key in Config**
- Include public key in each service's environment variables
- No dependency on auth service for verification

**Answer**: Cache the public key and run multiple auth service instances for high availability.

---

### 5. How do you revoke a JWT before it expires?

JWTs are stateless, so revocation is challenging. Here are solutions:

**Option 1: Token Blacklist** (Most common)
```javascript
// Store revoked tokens in Redis with expiry
const revokedTokens = new Set();

app.post('/logout', authenticate, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  
  // Store in Redis with TTL matching token expiry
  await redis.setex(`revoked:${token}`, ttl, 'true');
  res.json({ message: 'Logged out successfully' });
});

// Check blacklist during verification
async function authenticate(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  
  // Check if token is blacklisted
  const isRevoked = await redis.get(`revoked:${token}`);
  if (isRevoked) {
    return res.status(401).send('Token has been revoked');
  }
  
  // Continue with normal verification
  // ...
}
```

**Option 2: Short Expiry + Refresh Tokens**
- Access tokens expire in 15 minutes
- Refresh tokens last 7 days
- Revoke refresh token instead
- User forced to re-authenticate when access token expires

**Option 3: Token Versioning**
```javascript
// Add version to JWT payload
const token = jwt.sign(
  { email, role, tokenVersion: user.tokenVersion },
  privateKey
);

// Increment version in database on logout
await User.updateOne({ email }, { $inc: { tokenVersion: 1 } });

// Verify version matches during authentication
if (decoded.tokenVersion !== user.tokenVersion) {
  return res.status(401).send('Token has been revoked');
}
```

**Answer**: Use token blacklist in Redis or short-lived tokens with refresh tokens. Both require some state storage.

---

### 6. What are alternatives to RSA (e.g., ECDSA)?

**ECDSA (Elliptic Curve Digital Signature Algorithm)**

**Advantages:**
- Smaller key size (256-bit ECDSA = 3072-bit RSA security)
- Faster computation
- Smaller signatures
- Modern and recommended

**Comparison:**

| Feature | RSA-2048 | ECDSA-256 |
|---------|----------|-----------|
| Security | Standard | Same security |
| Key Size | 2048 bits | 256 bits |
| Signature Size | 256 bytes | 64 bytes |
| Speed | Slower | Faster |
| JWT Algorithm | RS256 | ES256 |

**Example Usage:**
```javascript
// Generate ECDSA keys
openssl ecparam -genkey -name prime256v1 -noout -out private-key.pem
openssl ec -in private-key.pem -pubout -out public-key.pem

// Sign JWT with ECDSA
const token = jwt.sign(
  { email, role },
  privateKey,
  { algorithm: 'ES256' } // Instead of RS256
);
```

**Other Alternatives:**
- **EdDSA (Ed25519)**: Even faster and more secure
- **HMAC (HS256)**: Symmetric, simpler but requires shared secret

**Answer**: ECDSA (ES256) is the modern alternative - smaller, faster, and just as secure as RSA.

---

### 7. How do you handle token refresh in a distributed system?

**The Pattern: Access Token + Refresh Token**

**Access Token:**
- Short-lived (15 minutes)
- Used for API requests
- Stored in memory or localStorage

**Refresh Token:**
- Long-lived (7 days)
- Used only to get new access tokens
- Stored in HTTP-only cookie (more secure)

**Implementation:**

```javascript
// AUTH SERVICE - Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  
  // Create access token (short-lived)
  const accessToken = jwt.sign(
    { email, role: 'user' },
    privateKey,
    { algorithm: 'RS256', expiresIn: '15m' }
  );
  
  // Create refresh token (long-lived)
  const refreshToken = jwt.sign(
    { email, type: 'refresh' },
    privateKey,
    { algorithm: 'RS256', expiresIn: '7d' }
  );
  
  // Store refresh token in database
  await RefreshToken.create({ token: refreshToken, email });
  
  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900 // 15 minutes in seconds
  });
});

// AUTH SERVICE - Refresh endpoint
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, publicKey);
    
    // Check if refresh token exists in database (not revoked)
    const tokenExists = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenExists) {
      return res.status(403).send('Refresh token revoked');
    }
    
    // Issue new access token
    const newAccessToken = jwt.sign(
      { email: decoded.email, role: 'user' },
      privateKey,
      { algorithm: 'RS256', expiresIn: '15m' }
    );
    
    res.json({
      accessToken: newAccessToken,
      expiresIn: 900
    });
    
  } catch (error) {
    res.status(403).send('Invalid refresh token');
  }
});

// AUTH SERVICE - Logout endpoint
app.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  
  // Delete refresh token from database
  await RefreshToken.deleteOne({ token: refreshToken });
  
  res.json({ message: 'Logged out successfully' });
});
```

**Client-Side Implementation:**

```javascript
// Store tokens
let accessToken = null;
let refreshToken = null;

// Login
async function login(email, password) {
  const response = await fetch('http://auth-service/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  accessToken = data.accessToken;
  refreshToken = data.refreshToken;
  
  // Set timer to refresh before expiry
  setTimeout(refreshAccessToken, 14 * 60 * 1000); // Refresh at 14 min
}

// Refresh access token
async function refreshAccessToken() {
  const response = await fetch('http://auth-service/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  accessToken = data.accessToken;
  
  // Set next refresh
  setTimeout(refreshAccessToken, 14 * 60 * 1000);
}

// Make API request with automatic retry
async function apiRequest(url, options) {
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };
  
  let response = await fetch(url, options);
  
  // If token expired, refresh and retry
  if (response.status === 401) {
    await refreshAccessToken();
    options.headers.Authorization = `Bearer ${accessToken}`;
    response = await fetch(url, options); // Retry
  }
  
  return response;
}
```

**Benefits:**
- Revoke access instantly by deleting refresh token from database
- Access tokens are short-lived (reduced risk if compromised)
- Users stay logged in without frequent re-authentication
- Works across all services (all use same access token format)

**Answer**: Use short-lived access tokens (15 min) with long-lived refresh tokens (7 days). Store refresh tokens in database for revocation. Auto-refresh on client before expiry.

---