### Mathematical Foundation (Simplified)

RSA security is based on a mathematical problem that's easy to do one way, but extremely hard to reverse.

#### The Core Concept
- **Easy to multiply**: 13 × 17 = 221 (anyone can do this quickly)
- **Hard to factor**: Given 221, finding 13 and 17 takes much longer
- **With huge numbers**: Factoring becomes practically impossible

#### How RSA Keys Are Generated

**Step 1: Choose Two Large Prime Numbers**
```
p = 61
q = 53
(In real RSA, these are 300+ digit numbers!)
```

**Step 2: Calculate n (The Modulus)**
```
n = p × q
n = 61 × 53 = 3233
```
- This number `n` is public and shared with everyone
- Even though `n` is public, it's extremely hard to figure out the original primes (p and q)

**Step 3: Calculate φ (Phi)**
```
φ = (p - 1) × (q - 1)
φ = 60 × 52 = 3120
```
- This is called Euler's totient function
- It counts numbers less than n that don't share factors with n

**Step 4: Choose Public Exponent e**
```
e = 17 (commonly used value)
```
- Must be coprime with φ (they share no common factors except 1)
- Common choices: 3, 17, or 65537

**Step 5: Calculate Private Exponent d**
```
d × e ≡ 1 (mod φ)
d × 17 ≡ 1 (mod 3120)
d = 2753
```
- This is found using the Extended Euclidean Algorithm
- `d` is the "inverse" of `e` in modular arithmetic

#### Final Keys
```
Public Key: (n, e) = (3233, 17)
Private Key: (n, d) = (3233, 2753)
```

#### How Signing Works

**Step 1: Hash the Message**
```
message = "Hello"
hash = SHA256(message) = 89... (large number)
Let's call this hash value: h = 123 (simplified)
```

**Step 2: Sign with Private Key**
```
signature = h^d mod n
signature = 123^2753 mod 3233
signature = 855 (example result)
```
- This uses modular exponentiation
- Only someone with `d` (private key) can create this signature

**Step 3: Send Message + Signature**
```
{ message: "Hello", signature: 855 }
```

#### How Verification Works

**Step 1: Receive Message and Signature**
```
Received: { message: "Hello", signature: 855 }
```

**Step 2: Hash the Message**
```
hash = SHA256("Hello") = 123
```

**Step 3: Verify with Public Key**
```
computed = signature^e mod n
computed = 855^17 mod 3233
computed = 123
```

**Step 4: Compare**
```
If computed hash (123) == original hash (123)
  → Signature is VALID ✅
  → Message is authentic and unchanged
Else
  → Signature is INVALID ❌
  → Message was tampered with
```

#### Why This Works Mathematically

The beauty of RSA is in this property:
```
(message^d)^e ≡ message (mod n)
(message^e)^d ≡ message (mod n)
```

**In Plain English:**
- Signing with private key, then verifying with public key → gets back original message
- Encrypting with public key, then decrypting with private key → gets back original message
- The keys are mathematical inverses of each other

#### Why It's Secure

**What Attackers Can See:**
- Public key: `(n, e)` = (3233, 17)
- Signed message and signature

**What Attackers Would Need:**
- Private key `d` = 2753
- To find `d`, they need to factor `n` into `p × q`

**The Problem:**
- With small numbers: 3233 = 61 × 53 (easy to crack)
- With real RSA (2048-bit): n has 617 digits!
- Factoring a 617-digit number would take millions of years with current computers

**Example of Real RSA Number Size:**
```
n = 25195908475657893494027183240048398571429282126204...
    (600+ more digits)
```

#### Real-World Comparison

Think of it like a lock and key:
- **Public key** = A mailbox slot (anyone can drop mail in)
- **Private key** = The mailbox key (only you can open and read)
- Even though everyone sees the mailbox, only you have the key
- Similarly, everyone can see your public key, but only you have the private key

#### Key Sizes in Practice

| Key Size | Decimal Digits | Security Level | Usage |
|----------|----------------|----------------|-------|
| 1024-bit | ~309 digits | Weak (deprecated) | Don't use |
| 2048-bit | ~617 digits | Standard | Current minimum |
| 3072-bit | ~925 digits | High security | Recommended |
| 4096-bit | ~1234 digits | Very high | Max security |

**Why Larger is Better:**
- Harder to factor = More secure
- But slower to compute
- 2048-bit is the sweet spot for most applications

---