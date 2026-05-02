# Personal Number Encryption Implementation

## Overview

This document describes the implementation of encryption for personal numbers in the donation system. Personal numbers (Norwegian fødselsnummer) are now encrypted before being stored in the database to protect sensitive personal information.

## Implementation Details

### Encryption Algorithm
- **Algorithm**: AES-256-GCM
- **Key Derivation**: scrypt with salt "salt"
- **Format**: `iv:tag:encrypted_data` (hex encoded)

### Security Features
- Each encryption uses a unique random IV (Initialization Vector)
- GCM mode provides authentication via an authentication tag
- Additional Authenticated Data (AAD) with "personal-number" identifier
- Encryption key derived from environment variable using scrypt

## Files Modified/Created

### New Files
- `lib/encryption.js` - Core encryption/decryption functions
- `scripts/migrate-personal-numbers.js` - Migration script for existing data
- `test-encryption.js` - Test script for validation

### Modified Files
- `models/Donation.Model.js` - Updated schema and added virtual field for decryption
- `app/api/donations/create-checkout/route.ts` - Encrypt personal numbers before storage
- `app/api/donations/vipps/route.ts` - Encrypt personal numbers before storage
- `app/api/donations/bulk-upload/route.ts` - Encrypt personal numbers during bulk upload

## Environment Variables

### Required
- `ENCRYPTION_KEY` - A strong secret key used for encryption
  - Should be at least 32 characters long
  - Must be kept secure and never exposed to client-side code
  - Should be different across development, staging, and production environments

## API Changes

### Before
Personal numbers were stored as plain text in the database.

### After
Personal numbers are encrypted server-side before being stored:
1. Client submits plain text personal number (optional field)
2. Server encrypts the personal number using AES-256-GCM
3. Encrypted data is stored in database
4. Virtual field `decryptedPersonalNumber` provides access to decrypted data when needed

## Database Schema

### Donation Model
```javascript
personalNumber: {
  type: String,
  validate: {
    validator: function(v) {
      // Accepts both encrypted format and plain 11 digits (for backward compatibility)
      if (!v) return true;
      const parts = v.split(':');
      if (parts.length === 3) {
        const iv = parts[0];
        const tag = parts[1];
        return iv.length === 32 && tag.length === 32 && /^[0-9a-fA-F]+$/.test(iv + tag);
      }
      return /^\d{11}$/.test(v);
    },
    message: 'Personal number must be exactly 11 digits or in encrypted format'
  }
}
```

### Virtual Field
```javascript
DonationSchema.virtual('decryptedPersonalNumber').get(function() {
  // Automatically decrypts personal number when accessed
  // Handles both encrypted and plain text formats
});
```

## Migration Process

### For Existing Data
Run the migration script to encrypt existing plain text personal numbers:

```bash
# Set the encryption key
export ENCRYPTION_KEY="your_secure_encryption_key_here"

# Run migration
node scripts/migrate-personal-numbers.js
```

### Migration Script Features
- Identifies existing plain text personal numbers
- Encrypts them using the current encryption key
- Skips already encrypted data
- Provides detailed logging and summary

## Usage Examples

### Encrypting a Personal Number
```javascript
const { encryptPersonalNumber } = require('./lib/encryption');

const encrypted = encryptPersonalNumber('12345678901');
// Returns: "abcdef1234567890abcdef1234567890:abcdef1234567890abcdef1234567890:encrypteddata"
```

### Decrypting a Personal Number
```javascript
const { decryptPersonalNumber } = require('./lib/encryption');

const decrypted = decryptPersonalNumber(encrypted);
// Returns: "12345678901"
```

### Checking if Data is Encrypted
```javascript
const { isEncrypted } = require('./lib/encryption');

const encrypted = isEncrypted('abcdef1234567890abcdef1234567890:abcdef1234567890abcdef1234567890:encrypteddata');
// Returns: true

const plainText = isEncrypted('12345678901');
// Returns: false
```

## Security Considerations

### Key Management
- Store `ENCRYPTION_KEY` in a secure location (environment variables, secret management service)
- Rotate encryption keys periodically (requires re-encryption of existing data)
- Never commit encryption keys to version control

### Access Control
- Encrypted data can only be decrypted server-side
- Client applications never receive the encryption key
- Access to decrypted data should be controlled through application logic

### Backup and Recovery
- Database backups will contain encrypted personal numbers
- Keep the encryption key secure and backed up separately
- Losing the encryption key means permanent loss of personal number data

## Testing

### Run Tests
```bash
# Set encryption key for testing
export ENCRYPTION_KEY="test_key_for_development_purposes"

# Run test script
node test-encryption.js
```

### Test Coverage
- Encryption and decryption round-trip
- Invalid encrypted data handling
- Empty input handling
- Format validation

## Troubleshooting

### Common Issues

#### "ENCRYPTION_KEY environment variable is not set"
- Set the `ENCRYPTION_KEY` environment variable
- Ensure it's available in all runtime environments

#### "Invalid initialization vector" during decryption
- The encrypted data may be corrupted
- Check if the encryption key has changed
- Verify the encrypted data format

#### Migration script errors
- Ensure database connection is working
- Check that the encryption key is set
- Verify MongoDB permissions for the database user

## Future Considerations

### Key Rotation
- Implement a key rotation strategy
- Create scripts to re-encrypt data with new keys
- Consider supporting multiple active keys for gradual migration

### Performance
- Monitor encryption/decryption performance
- Consider caching frequently accessed decrypted data
- Evaluate if encryption impacts database query performance

### Compliance
- Ensure implementation meets GDPR requirements
- Document data processing activities
- Consider data retention policies for encrypted personal data
