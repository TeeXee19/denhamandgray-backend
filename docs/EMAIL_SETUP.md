# Whistleblowing Report Email Configuration

This document explains how to set up email notifications for whistleblowing reports.

## Overview

When a whistleblowing report is submitted through the API, the system automatically:
1. Saves the report to the database
2. Sends an email notification with the report details
3. Attaches a JSON file containing the complete report data

## Email Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Outlook SMTP Configuration
OUTLOOK_SMTP_HOST=smtp-mail.outlook.com
OUTLOOK_SMTP_PORT=587

# Email Credentials
OUTLOOK_EMAIL_USER=your-outlook-email@outlook.com
OUTLOOK_EMAIL_PASSWORD=your-app-password

# Recipient Email (can be different from sender)
WHISTLEBLOWING_RECIPIENT_EMAIL=hr@denhamandgray.com
```

### Outlook Setup Requirements

For Outlook/Office 365 accounts:

1. **Enable 2-Factor Authentication** on your Microsoft account
2. **Generate an App Password**:
   - Go to Microsoft Account Security settings
   - Select "App passwords"
   - Generate a new app password for "Mail"
   - Use this app password instead of your regular password

3. **Alternative: OAuth2** (Recommended for production)
   - For production environments, consider using OAuth2 instead of app passwords
   - This requires additional configuration but is more secure

## Email Content

Each whistleblowing report email includes:

### Email Subject
`Whistleblowing Report - [Misconduct Type] - [Date]`

### Email Body
- **HTML formatted** email with styled sections
- **Plain text** version for email clients that don't support HTML
- Complete report details organized by section:
  - Reporter Information (if provided)
  - Incident Details
  - Confidentiality Preferences

### Attachments
- **JSON file** containing the complete report data
- Filename format: `whistleblowing-report-[timestamp].json`
- Includes metadata like submission timestamp and system info

## Testing

To test the email functionality:

1. **Set up environment variables** as described above
2. **Install dependencies**:
   ```bash
   pnpm add nodemailer @types/nodemailer
   ```
3. **Submit a test report** via the API:
   ```bash
   POST /whistleblowing-report
   ```
4. **Check logs** for email sending status
5. **Verify email receipt** in the configured recipient inbox

## Error Handling

The system is designed to be resilient:
- If email sending fails, the report is still saved to the database
- Email errors are logged but don't prevent report submission
- Failed email attempts are logged with detailed error messages

## Security Considerations

- Store sensitive email credentials in environment variables, never in code
- Use app passwords instead of regular passwords for Outlook
- Consider OAuth2 for production environments
- Regularly rotate email credentials
- Monitor email logs for suspicious activity

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure 2FA is enabled on your Microsoft account
   - Use an app password, not your regular password
   - Verify the email address is correct

2. **SMTP Connection Issues**
   - Check SMTP host and port settings
   - Verify firewall settings allow SMTP connections
   - Test with a simple email client first

3. **Email Not Received**
   - Check spam/junk folders
   - Verify recipient email address
   - Check email provider's delivery logs

### Logging

Email operations are logged with the following levels:
- **INFO**: Successful email sends
- **ERROR**: Failed email attempts with detailed error messages
- **WARN**: Configuration warnings

Check application logs for troubleshooting information.