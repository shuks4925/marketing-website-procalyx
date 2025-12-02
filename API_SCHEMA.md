# PROCALYX Notify Me API Schema

## Endpoint Specification

Create a REST API endpoint for the PROCALYX "Coming Soon" page email subscription feature.

### Endpoint Details

- **URL**: `https://api.procalyx.com/notify-me`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: (Specify if needed - API key, JWT, etc.)

---

## Request Schema

### Headers
```
Content-Type: application/json
Accept: application/json
```

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Request Validation Rules
- `email` (required): Valid email address format
  - Must be a non-empty string
  - Must match standard email regex pattern
  - Maximum length: 255 characters

### Example Request
```bash
curl -X POST https://api.procalyx.com/notify-me \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

## Response Schema

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Email subscription successful"
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Invalid email address format",
  "error": "VALIDATION_ERROR"
}
```

#### 400 Bad Request - Missing Email
```json
{
  "success": false,
  "message": "Email is required",
  "error": "MISSING_FIELD"
}
```

#### 409 Conflict - Email Already Exists
```json
{
  "success": false,
  "message": "Email already subscribed",
  "error": "DUPLICATE_EMAIL"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "SERVER_ERROR"
}
```

---

## Implementation Requirements

### Database Schema

Create a table/collection to store email subscriptions:

**Table Name**: `email_subscriptions` or `notifications`

**Fields**:
- `id` (Primary Key): UUID or auto-increment integer
- `email` (String, Unique, Required): Email address
- `created_at` (DateTime, Required): Timestamp when subscription was created
- `status` (String, Optional): Subscription status (e.g., "active", "unsubscribed")
- `source` (String, Optional): Source identifier (e.g., "coming-soon-page")

### Business Logic

1. **Email Validation**
   - Validate email format using regex or library (e.g., `validator.js`)
   - Check for common typos or invalid formats

2. **Duplicate Check**
   - Check if email already exists in database
   - Return 409 Conflict if duplicate found (or handle silently based on requirements)

3. **Database Storage**
   - Store email with current timestamp
   - Set default status to "active"

4. **Optional Features**
   - Send confirmation email to subscriber
   - Log subscription event for analytics
   - Rate limiting to prevent abuse

### Error Handling

- Return appropriate HTTP status codes
- Provide clear error messages
- Log errors for debugging
- Handle database connection errors gracefully

### Security Considerations

- Implement rate limiting (e.g., max 5 requests per IP per minute)
- Validate and sanitize input
- Use parameterized queries to prevent SQL injection
- Consider CORS configuration if needed
- Add request logging for security monitoring

---

## Example Node.js/Express Implementation

```javascript
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('./database'); // Your database connection

// Validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address too long')
];

// POST /notify-me
router.post('/notify-me', validateEmail, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        error: 'VALIDATION_ERROR'
      });
    }

    const { email } = req.body;

    // Check for duplicate email
    const existing = await db.emailSubscriptions.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already subscribed',
        error: 'DUPLICATE_EMAIL'
      });
    }

    // Store email subscription
    const subscription = await db.emailSubscriptions.create({
      email,
      created_at: new Date(),
      status: 'active',
      source: 'coming-soon-page'
    });

    // Optional: Send confirmation email
    // await sendConfirmationEmail(email);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Email subscription successful'
    });

  } catch (error) {
    console.error('Error processing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
```

---

## Testing Checklist

- [ ] Valid email address is accepted and stored
- [ ] Invalid email format returns 400 error
- [ ] Missing email field returns 400 error
- [ ] Duplicate email returns 409 error (or handled appropriately)
- [ ] Database errors are handled gracefully
- [ ] Rate limiting works correctly
- [ ] CORS headers are set correctly (if needed)
- [ ] Response format matches schema exactly

---

## Notes

- The frontend expects a JSON response with a `success` field
- The frontend handles both success and error cases
- Timestamp is handled server-side (created_at field)
- Consider adding email verification/confirmation flow if needed

