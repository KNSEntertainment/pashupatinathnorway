# Non-Member Tax ID System Implementation

## Overview
This document outlines the implementation of a Tax ID system for non-member donors, enabling them to generate tax documents without requiring membership registration.

## Problem Solved
Previously, only registered members could generate tax documents using their membership IDs. Non-members who donated to the temple had no way to obtain official tax documentation for their contributions.

## Solution: Tax ID System

### Tax ID Format
- **Format**: `TAX-YYYY-XXXXXX` (e.g., `TAX-2024-000001`)
- **Structure**: Similar to membership IDs for consistency
- **Generation**: Automatic on first donation by a non-member

### Key Features
1. **Automatic Generation**: Tax IDs are created when non-members make their first donation
2. **Persistent Tracking**: Same tax ID is used for all donations from the same person
3. **Tax Document Generation**: Non-members can generate tax reports using their tax ID
4. **Privacy Protection**: Personal numbers remain encrypted while enabling tax reporting

## Implementation Details

### 1. Tax ID Generation Function
**File**: `lib/taxIdGenerator.ts`
- Generates unique tax IDs using yearly counter
- Format: `TAX-YYYY-XXXXXX`
- Uses separate counter from membership IDs

### 2. Donation Model Updates
**File**: `models/Donation.Model.js`
- Added `taxId` field with validation
- Optional field (members use membershipId, non-members use taxId)
- Validation ensures correct format: `TAX-YYYY-XXXXXX`

### 3. Donation API Updates
**Files**: 
- `app/api/donations/create-checkout/route.ts` (Stripe)
- `app/api/donations/vipps/route.ts` (Vipps)

**Logic**:
- For non-members (no membershipId), check if they already have a tax ID
- If existing tax ID found, reuse it
- If no tax ID, generate new one
- Store tax ID with donation record

### 4. Non-Member Tax Report API
**File**: `app/api/donations/non-member-tax-report/route.ts`
- Dedicated endpoint for non-member tax reports
- Accepts `taxId` and `year` parameters
- Validates tax ID format
- Generates tax reports using tax ID lookup
- Includes audit logging for security

### 5. Updated Tax Document Component
**File**: `components/GenerateTaxDocument.tsx`
- Added radio buttons to select ID type (Member vs Non-Member)
- Dynamic input field that changes based on selection
- Supports both membership IDs and tax IDs
- Updated validation and API calls accordingly

## User Experience

### For Non-Members
1. **Donation Process**: 
   - Non-member donates with personal number
   - System automatically generates tax ID on first donation
   - Tax ID is stored with all future donations

2. **Tax Document Generation**:
   - Admin selects "Non-Member (Tax ID)" option
   - Enters tax ID (e.g., `TAX-2024-000001`)
   - Generates tax document for all donations linked to that tax ID

### For Administrators
1. **Single Interface**: One component handles both members and non-members
2. **Clear Distinction**: Radio buttons make it obvious which ID type to use
3. **Audit Trail**: All tax document generations are logged
4. **Validation**: Proper format validation for both ID types

## Technical Benefits

### Data Integrity
- **Consistent Format**: Tax IDs follow same pattern as membership IDs
- **Unique Identification**: Each non-member gets unique tax ID
- **Persistent Tracking**: Same tax ID used across all donations

### Security & Privacy
- **Encrypted Personal Numbers**: Personal data remains protected
- **Audit Logging**: All tax document accesses are tracked
- **Admin Authentication**: Only admins can generate tax documents

### Scalability
- **Yearly Counters**: Separate counters per year prevent ID conflicts
- **Database Efficiency**: Indexed fields for fast lookups
- **Backward Compatibility**: Existing member system unchanged

## API Endpoints

### New Endpoint
```
POST /api/donations/non-member-tax-report
```

**Request Body**:
```json
{
  "taxId": "TAX-2024-000001",
  "year": 2024
}
```

**Response**:
```json
{
  "success": true,
  "taxReport": {
    "donor": {
      "name": "John Doe",
      "personalNumber": "01018512345",
      "email": "john@example.com",
      "address": "123 Main St, 0150 Oslo",
      "taxId": "TAX-2024-000001",
      "isNonMember": true
    },
    "report": {
      "year": 2024,
      "generatedAt": "2024-01-15T10:30:00Z",
      "totalDonated": 1500,
      "donationCount": 3,
      "donations": [...]
    },
    "summary": {...}
  }
}
```

## Usage Examples

### Non-Member Donation Flow
```javascript
// First donation - generates tax ID
POST /api/donations/vipps
{
  "amount": 500,
  "donorName": "Jane Smith",
  "donorEmail": "jane@example.com",
  "personalNumber": "01019067890",
  "membershipId": null, // No membership ID
  // System generates: TAX-2024-000001
}

// Second donation - reuses tax ID
POST /api/donations/vipps
{
  "amount": 300,
  "donorName": "Jane Smith", 
  "donorEmail": "jane@example.com",
  "personalNumber": "01019067890",
  "membershipId": null,
  // System finds existing: TAX-2024-000001
}
```

### Tax Document Generation
```javascript
// Generate tax document for non-member
POST /api/donations/non-member-tax-report
{
  "taxId": "TAX-2024-000001",
  "year": 2024
}
```

## Migration Notes

### Database Changes
- **No Migration Required**: `taxId` field is optional
- **Existing Data**: Unaffected - members continue using membershipId
- **New Donations**: Non-members automatically get tax IDs

### Backward Compatibility
- **Member System**: Completely unchanged
- **Existing APIs**: Still work as before
- **Tax Documents**: Member tax reports use existing endpoint

## Future Enhancements

### Recommended Improvements
1. **Email Notifications**: Send tax ID to non-members via email
2. **Donor Portal**: Allow non-members to view their tax ID online
3. **Mobile App**: Mobile access for tax document generation
4. **API Integration**: Third-party tax software integration

### Administrative Features
1. **Bulk Operations**: Bulk tax document generation for non-members
2. **Reporting**: Analytics on non-member vs member donations
3. **Search**: Search non-members by name/email to find tax ID
4. **Export**: Export non-member tax data for accounting

## Testing

### Verification Checklist
- ✅ Tax ID generation works correctly
- ✅ Same tax ID reused for repeat donations
- ✅ Tax document generation works for non-members
- ✅ Member system remains unaffected
- ✅ Validation works for both ID types
- ✅ Audit logging functions properly
- ✅ TypeScript compilation successful

### Test Cases
1. **First Donation**: Verify tax ID generation
2. **Repeat Donation**: Verify tax ID reuse
3. **Tax Report**: Verify document generation
4. **Invalid ID**: Verify validation errors
5. **Member vs Non-Member**: Verify correct endpoint usage

## Conclusion

The Tax ID system successfully solves the problem of tax document generation for non-member donors while maintaining the existing member system. The implementation is secure, scalable, and user-friendly, providing equal access to tax documentation for all temple supporters regardless of membership status.
