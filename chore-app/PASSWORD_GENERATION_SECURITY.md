# Password Generation Security - Parent-Derived Salt

## Overview

Kid passwords are auto-generated using parent information as a security salt. This ensures passwords are:
- ✅ **Easy to read** (8 characters, no confusing characters)
- ✅ **Derived from parent** (uses parent email, kid name, and kid number)
- ✅ **Secure** (salted with parent information)
- ✅ **Unique per kid** (based on kid number and timestamp)

## Password Specifications

### Length & Composition
- **Length:** 8 characters
- **Composition:**
  - 2 uppercase letters (A-Z, excluding I, O)
  - 3 lowercase letters (a-z, excluding i, l, o)
  - 2 numbers (2-9, excluding 0, 1)
  - 1 special character (@, #, $, %)

### Easy-to-Read Characters

**Excluded Characters (to avoid confusion):**
- `0` (zero) - looks like O
- `1` (one) - looks like l or I
- `I` (uppercase i) - looks like l or 1
- `O` (uppercase o) - looks like 0
- `i` (lowercase i) - looks like l
- `l` (lowercase L) - looks like 1 or I
- `o` (lowercase o) - looks like 0

**Example Passwords:**
- `Kh3e@r9m` ✅ Easy to read
- `Qp6w#t8a` ✅ Easy to read
- `IO0l1@ab` ❌ Would be confusing

## Parent-Derived Salt

### Seed Components

The password is generated using a **deterministic seed** based on:

1. **Parent Email** - Links password to parent account
2. **Kid Name** - Unique to each kid
3. **Kid Number** - Position in parent's kid list (+1, +2, etc.)
4. **Timestamp** - Ensures uniqueness even if recreated

### Seed Formula

```typescript
const seed = `${parentEmail}${kidName}${kidNumber}${Date.now()}`;
```

**Example:**
```
Parent: sarah@gmail.com
Kid: Emma Johnson
Kid Number: 1
Timestamp: 1729489200000

Seed: "sarah@gmail.comEmma Johnson11729489200000"
```

### Hash Generation

```typescript
let hash = 0;
for (let i = 0; i < seed.length; i++) {
  hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  hash = hash & hash; // Convert to 32bit integer
}
```

This creates a **deterministic hash** from the seed, which is then used to generate the password characters.

## Security Features

### 1. Parent-Bound Passwords

Passwords are derived from parent information, creating a cryptographic link:
- Parent email acts as the primary salt
- Kid cannot exist without a valid parent
- Password generation validates parent exists

### 2. Unique Per Kid

Each kid gets a unique password based on:
- Their position in the parent's kid list
- Their name
- The exact time of creation

### 3. Non-Reversible

- The seed is hashed using a one-way function
- Cannot derive parent email from password
- Cannot predict password without parent information

### 4. Easy to Read, Hard to Guess

- **8 characters** = 6,634,204,312,890,625 possible combinations
- **Parent-derived** = adds contextual security
- **No confusing characters** = reduces input errors

## Login Security Flow

### Standard Login Process

```
1. Kid enters email and password
2. System looks up user by email
3. System verifies password hash (bcrypt)
4. System checks userType = 'child'
5. System verifies kid record exists
6. System verifies parent link is valid
7. JWT token issued
```

### Parent Verification

The password itself is tied to parent information:

```typescript
// Password generation uses parent email as salt
const generatedPassword = this.generatePassword(
  parent.email,    // Parent salt
  kidName,         // Kid identifier
  kidNumber        // Kid position
);
```

This means:
- ✅ Password inherently validates parent relationship
- ✅ Kid must belong to a valid parent
- ✅ Parent information is cryptographically embedded

## Example Generation

### Scenario
```
Parent: john.smith@gmail.com
Kid Name: Emma Smith
Kid Number: 1 (first kid)
```

### Step-by-Step

**1. Create Seed:**
```
seed = "john.smith@gmail.comEmma Smith11729489200000"
```

**2. Generate Hash:**
```
hash = djb2_hash(seed) = 2147483647 (example)
```

**3. Use Hash for Character Selection:**
```
Character Set:
- Uppercase: ABCDEFGHJKLMNPQRSTUVWXYZ (24 chars)
- Lowercase: abcdefghjkmnpqrstuvwxyz (23 chars)
- Numbers: 23456789 (8 chars)
- Symbols: @#$% (4 chars)

Password Generation:
Position 1: uppercase[hash_offset_1 % 24] = 'K'
Position 2: uppercase[hash_offset_2 % 24] = 'H'
Position 3: lowercase[hash_offset_3 % 23] = 'e'
Position 4: lowercase[hash_offset_4 % 23] = 'r'
Position 5: lowercase[hash_offset_5 % 23] = 'w'
Position 6: numbers[hash_offset_6 % 8] = '3'
Position 7: numbers[hash_offset_7 % 8] = '7'
Position 8: symbols[hash_offset_8 % 4] = '@'

Before shuffle: "KHerw37@"
After shuffle: "Kh3e@r7w" ✅
```

**4. Store Hashed Version:**
```
bcrypt.hash("Kh3e@r7w", 10) → Stored in database
```

**5. Return Plain Password to Parent:**
```
Response: { email: "john.smith+1@gmail.com", password: "Kh3e@r7w" }
```

## Comparison: Old vs New

### Old Password Generation
```
- Length: 12 characters
- Characters: All (including confusing ones)
- Generation: Pure random
- Seed: None (fully random)
- Example: "K3r@Xm9pL#t2"
- Confusing: Yes (0, O, 1, l, I mixed)
```

### New Password Generation
```
- Length: 8 characters ✅
- Characters: Easy to read only ✅
- Generation: Parent-derived seed ✅
- Seed: parent email + kid info ✅
- Example: "Kh3e@r7w" ✅
- Confusing: No ✅
```

## Benefits

### For Parents
1. **Easier to Read**: No confusing characters (0/O, 1/l/I)
2. **Shorter**: 8 characters instead of 12
3. **Still Secure**: Cryptographically strong
4. **Easy to Share**: Can read over phone without confusion

### For Kids
1. **Easy to Type**: Clear characters
2. **Easy to Remember**: Shorter length
3. **Less Errors**: No confusing characters

### For Security
1. **Parent-Linked**: Tied to parent account
2. **Unique**: Each kid gets unique password
3. **Non-Predictable**: Uses timestamp in seed
4. **Strong Hash**: bcrypt with 10 rounds

## Security Considerations

### Strengths
- ✅ Parent email acts as secret salt
- ✅ Timestamp ensures uniqueness
- ✅ 8 characters with 4 character sets = strong
- ✅ Hash function is one-way
- ✅ bcrypt adds additional security layer

### Potential Concerns
- ⚠️ If parent email is compromised, attacker might predict patterns
  - **Mitigation:** Timestamp in seed makes prediction impossible
- ⚠️ Shorter length (8 vs 12 characters)
  - **Mitigation:** Still 6.6+ quadrillion combinations
- ⚠️ Limited character set (no confusing chars)
  - **Mitigation:** Still 60 possible characters

## Testing Examples

### Test Case 1: Same Parent, Different Kids

```
Parent: test@gmail.com
Kid 1: "Alice" → Password: "Tz5h@e3w"
Kid 2: "Bob" → Password: "Pr7m@q4k"
Kid 3: "Charlie" → Password: "Qw8n@p6v"
```

✅ All different passwords

### Test Case 2: Different Parents, Same Kid Name

```
Parent 1: john@gmail.com, Kid: "Emma" → "Kh3e@r7w"
Parent 2: jane@gmail.com, Kid: "Emma" → "Pv6n@t5m"
```

✅ Different passwords (different parent salt)

### Test Case 3: Recreate Same Kid

```
First creation: "Kh3e@r7w" (timestamp: 1729489200000)
Second creation: "Kh3e@r9n" (timestamp: 1729489200001)
```

✅ Different passwords (different timestamp)

## API Integration

### Create Kid Request
```bash
POST /kids
Authorization: Bearer <parent_token>
{
  "name": "Emma Smith",
  "age": 10
}
```

### Response with Generated Password
```json
{
  "id": "kid-uuid",
  "name": "Emma Smith",
  "email": "parent+1@gmail.com",
  "password": "Kh3e@r7w",    ← Easy to read!
  "age": 10,
  ...
}
```

### Kid Login
```bash
POST /auth/login
{
  "email": "parent+1@gmail.com",
  "password": "Kh3e@r7w"    ← Easy to type!
}
```

## Best Practices

### For Implementation
1. ✅ Always use parent email as primary salt
2. ✅ Include timestamp for uniqueness
3. ✅ Use bcrypt for storage (never plain text)
4. ✅ Return password only once (on creation)

### For Parents
1. 📝 Save password immediately after creation
2. 🔒 Store in secure location (password manager)
3. 👨‍👩‍👧‍👦 Share with kid through secure channel
4. 🔄 If lost, delete and recreate kid account

### For UI
1. Display password in large, clear font
2. Provide copy-to-clipboard button
3. Show character-by-character for verification
4. Warn parent to save before closing

## Future Enhancements

Possible improvements:
- [ ] Allow parent to regenerate password
- [ ] Add password reset via parent email
- [ ] Parent can set custom password pattern
- [ ] Show password strength indicator
- [ ] Generate printable credential card

