# Automated Birthday Wishes Setup Guide

This guide explains how to set up automated birthday wishes that run every day at 8 AM to send birthday emails to members.

## Overview

The system includes:
- **API Endpoint**: `/api/email/send-daily-birthday-wishes` - Processes and sends birthday wishes
- **Nepali Email Template**: Beautiful birthday wishes in Nepali with cultural elements
- **Error Handling**: Comprehensive logging and error tracking
- **Batch Processing**: Sends emails with delays to avoid overwhelming the email server

## API Endpoints

### 1. Send Daily Birthday Wishes (POST)
```
POST /api/email/send-daily-birthday-wishes
```
- **Purpose**: Sends birthday wishes to all members with birthdays today
- **Authentication**: None required (for cron job access)
- **Response**: Detailed results of email sending process

### 2. Check Today's Birthdays (GET)
```
GET /api/email/send-daily-birthday-wishes
```
- **Purpose**: Lists members with birthdays today (for testing)
- **Authentication**: None required
- **Response**: List of members with birthdays today

## Deployment Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/email/send-daily-birthday-wishes",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Schedule Format**: `"0 8 * * *"` = 8:00 AM every day
- `0` = minute 0
- `8` = hour 8 (8 AM)
- `*` = every day
- `*` = every month
- `*` = every day of week

### Option 2: GitHub Actions (For any deployment platform)

Create `.github/workflows/birthday-wishes.yml`:

```yaml
name: Send Daily Birthday Wishes

on:
  schedule:
    - cron: '0 8 * * *'  # 8:00 AM UTC every day
  workflow_dispatch:    # Allow manual triggering

jobs:
  send-birthday-wishes:
    runs-on: ubuntu-latest
    steps:
      - name: Send birthday wishes
        run: |
          curl -X POST https://your-domain.com/api/email/send-daily-birthday-wishes \
            -H "Content-Type: application/json"
```

### Option 3: Traditional Cron Job (For VPS/Dedicated servers)

Add to your crontab:
```bash
# Edit crontab
crontab -e

# Add this line (8 AM every day)
0 8 * * * curl -X POST https://your-domain.com/api/email/send-daily-birthday-wishes -H "Content-Type: application/json"
```

### Option 4: Node-cron Package (For Node.js servers)

If you have a continuously running Node.js server:

```javascript
// Add to your server startup file
import cron from 'node-cron';

// Schedule birthday wishes for 8 AM every day
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily birthday wishes...');
  
  try {
    const response = await fetch('http://localhost:3000/api/email/send-daily-birthday-wishes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    console.log('Birthday wishes completed:', result);
  } catch (error) {
    console.error('Error sending birthday wishes:', error);
  }
});
```

## Testing the System

### 1. Test the API Endpoint
```bash
# Check today's birthdays
curl https://your-domain.com/api/email/send-daily-birthday-wishes

# Send birthday wishes (test mode)
curl -X POST https://your-domain.com/api/email/send-daily-birthday-wishes
```

### 2. Test with Different Timezones
The system uses the server's timezone. If you need to ensure 8 AM in a specific timezone:

1. **For Vercel**: The cron runs at 8 AM UTC
2. **For Node.js**: Modify the schedule to account for timezone:
   ```javascript
   // 8 AM Norway time (UTC+2 in winter, UTC+1 in summer)
   cron.schedule('0 6 * * *', async () => { ... }); // Winter (UTC+2)
   cron.schedule('0 7 * * *', async () => { ... }); // Summer (UTC+1)
   ```

## Email Template Features

The automated birthday emails include:

- **Nepali Language**: Traditional Nepali birthday wishes
- **Cultural Elements**: Sanskrit mantras and traditional blessings
- **Personalization**: Member's name and age
- **Professional Design**: Beautiful HTML template with temple branding
- **Responsive Design**: Works on all devices

## Monitoring and Logging

### 1. Console Logs
The system logs:
- Number of members processed
- Successful email sends
- Failed email sends with error details
- Processing time

### 2. Error Handling
- Individual email failures don't stop the entire process
- Detailed error messages for troubleshooting
- Graceful handling of invalid personal numbers

### 3. Monitoring Suggestions
Set up monitoring to track:
- Daily email counts
- Failed email rates
- API response times
- Error patterns

## Security Considerations

### 1. Rate Limiting
The API includes built-in delays (1 second between emails) to prevent overwhelming your email provider.

### 2. Access Control
- The endpoint is open for cron job access
- Consider adding a secret token for additional security:
  ```javascript
  // In your API route
  const secret = req.headers.get('x-secret-key');
  if (secret !== process.env.BIRTHDAY_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  ```

### 3. Email Provider Limits
- Monitor your email provider's daily sending limits
- Consider using a dedicated email service for bulk sending

## Troubleshooting

### Common Issues

1. **No emails sent**
   - Check if there are members with birthdays today
   - Verify email configuration in `.env.local`
   - Check server logs for errors

2. **Cron job not running**
   - Verify cron syntax
   - Check if the server is running at scheduled time
   - Test the endpoint manually first

3. **Email delivery issues**
   - Check spam/junk folders
   - Verify email domain reputation
   - Check email provider settings

### Debug Commands

```bash
# Check today's birthdays
curl https://your-domain.com/api/email/send-daily-birthday-wishes

# Test email sending
curl -X POST https://your-domain.com/api/email/send-daily-birthday-wishes

# Check logs (Vercel)
vercel logs

# Check cron jobs (Linux)
crontab -l
```

## Deployment Checklist

- [ ] Deploy the updated API endpoint
- [ ] Set up cron job/scheduled task
- [ ] Test the endpoint manually
- [ ] Verify email configuration
- [ ] Set up monitoring/logging
- [ ] Test with a member's birthday
- [ ] Monitor first automated run
- [ ] Set up alerts for failures

## Environment Variables

Ensure these are set in your production environment:

```env
# Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Optional: Security token
BIRTHDAY_CRON_SECRET=your-secret-key
```

## Support

For issues with the automated birthday wishes system:

1. Check the server logs first
2. Test the API endpoint manually
3. Verify email configuration
4. Check cron job setup
5. Review this documentation

The system is designed to be robust and self-healing, with comprehensive error handling and logging to help identify and resolve issues quickly.
