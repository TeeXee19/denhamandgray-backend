import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { CreateWhistleblowingReportDto } from '../app.dto';

// Extended DTO for email purposes that includes the generated ID and file URL
interface WhistleblowingReportWithId extends CreateWhistleblowingReportDto {
  id?: number;
  evidenceFileUrl?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_EMAIL_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      requireTLS: true, // Force TLS
      auth: {
        user: process.env.SMTP_EMAIL_USERNAME,
        pass: process.env.SMTP_EMAIL_PASSWORD,
      },
       tls: {
        ciphers: 'SSLv3', // Office 365 compatibility
        rejectUnauthorized: false // Accept self-signed certificates if needed
      },
      debug: true, // Enable debug logging
      logger: true // Enable logging
    });
  }

  @OnEvent('whistleblowing.report.created')
  async handleWhistleblowingReportCreated(reportData: WhistleblowingReportWithId) {
    try {
      await this.sendWhistleblowingReport(reportData);
      this.logger.log(`Email notification sent for whistleblowing report ${reportData.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification for report ${reportData.id}:`, error);
      // Email failure doesn't affect the main application flow since this is async
    }
  }

  async sendWhistleblowingReport(reportData: WhistleblowingReportWithId) {
    try {
      const emailContent = this.formatReportForEmail(reportData);
      const jsonAttachment = this.createJsonAttachment(reportData);

      const mailOptions = {
        from: process.env.SMTP_EMAIL_USERNAME,
        to: process.env.WHISTLEBLOWING_RECIPIENT_EMAIL || process.env.SMTP_EMAIL_USERNAME,
        subject: `Whistleblowing Report - ${reportData.misconductType || 'Incident'} - ${new Date().toLocaleDateString()}`,
        text: emailContent,
        html: this.formatReportForHtml(reportData),
        attachments: [
          {
            filename: `whistleblowing-report-${Date.now()}.json`,
            content: jsonAttachment,
            contentType: 'application/json',
          },
        ],
      };

      const result: nodemailer.SentMessageInfo = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Whistleblowing report email sent successfully: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to send whistleblowing report email:', error);
      throw new Error('Failed to send email notification');
    }
  }

  private formatReportForEmail(data: WhistleblowingReportWithId): string {
    return `
WHISTLEBLOWING REPORT NOTIFICATION

A new whistleblowing report has been submitted with the following details:

=== REPORTER INFORMATION ===
${data.firstName || data.lastName ? `Name: ${data.firstName || ''} ${data.lastName || ''}`.trim() : 'Name: Not provided'}
Email: ${data.email || 'Not provided'}
Phone: ${data.phone || 'Not provided'}
Role: ${data.role || 'Not provided'}

=== INCIDENT DETAILS ===
Type of Misconduct: ${data.misconductType || 'Not specified'}
Date & Time: ${data.incidentDateTime || 'Not provided'}
Location/Department: ${data.location || 'Not provided'}
People Involved: ${data.peopleInvolved || 'Not provided'}

Description: ${data.description || 'Not provided'}

How Reporter Became Aware: ${data.howAwareDetails || 'Not provided'}

Supporting Evidence: ${data.hasSupportingEvidence ? 'Yes' : 'No'}
${data.evidenceFileUrl ? `Evidence File: ${data.evidenceFileUrl}` : ''}

=== CONFIDENTIALITY ===
Wishes to Remain Anonymous: ${data.remainAnonymous ? 'Yes' : 'No'}
Can be Contacted for More Details: ${data.canContact ? 'Yes' : 'No'}

Additional Comments: ${data.additionalComments || 'None'}

=== SUBMISSION DETAILS ===
Report ID: ${data.id || 'Generated after database save'}
Submitted On: ${new Date().toLocaleString()}

This report has been automatically generated and stored in the system.
The complete report data is also attached as a JSON file for record-keeping.

Please handle this report according to company whistleblowing policies and procedures.
    `.trim();
  }

  private formatReportForHtml(data: WhistleblowingReportWithId): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #dc3545; }
            .section { margin: 20px 0; }
            .section-title { color: #dc3545; font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .field { margin: 8px 0; }
            .field-label { font-weight: bold; color: #555; }
            .field-value { margin-left: 10px; }
            .footer { background-color: #f8f9fa; padding: 15px; margin-top: 30px; border-top: 2px solid #dc3545; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🚨 WHISTLEBLOWING REPORT NOTIFICATION</h2>
            <p>A new whistleblowing report has been submitted and requires attention.</p>
          </div>

          <div class="section">
            <div class="section-title">👤 REPORTER INFORMATION</div>
            <div class="field">
              <span class="field-label">Name:</span>
              <span class="field-value">${data.firstName || data.lastName ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${data.email || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Phone:</span>
              <span class="field-value">${data.phone || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Role:</span>
              <span class="field-value">${data.role || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📋 INCIDENT DETAILS</div>
            <div class="field">
              <span class="field-label">Type of Misconduct:</span>
              <span class="field-value">${data.misconductType || 'Not specified'}</span>
            </div>
            <div class="field">
              <span class="field-label">Date & Time:</span>
              <span class="field-value">${data.incidentDateTime || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Location/Department:</span>
              <span class="field-value">${data.location || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">People Involved:</span>
              <span class="field-value">${data.peopleInvolved || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Description:</span>
              <div class="field-value" style="background-color: #f8f9fa; padding: 10px; margin-top: 5px; border-radius: 4px;">
                ${data.description || 'Not provided'}
              </div>
            </div>
            <div class="field">
              <span class="field-label">How Reporter Became Aware:</span>
              <div class="field-value" style="background-color: #f8f9fa; padding: 10px; margin-top: 5px; border-radius: 4px;">
                ${data.howAwareDetails || 'Not provided'}
              </div>
            </div>
            <div class="field">
              <span class="field-label">Supporting Evidence:</span>
              <span class="field-value">${data.hasSupportingEvidence ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🔒 CONFIDENTIALITY</div>
            <div class="field">
              <span class="field-label">Wishes to Remain Anonymous:</span>
              <span class="field-value">${data.remainAnonymous ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="field">
              <span class="field-label">Can be Contacted:</span>
              <span class="field-value">${data.canContact ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="field">
              <span class="field-label">Additional Comments:</span>
              <div class="field-value" style="background-color: #f8f9fa; padding: 10px; margin-top: 5px; border-radius: 4px;">
                ${data.additionalComments || 'None'}
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Submission Details:</strong></p>
            <p>Report ID: ${data.id || 'Generated after database save'}</p>
            <p>Submitted On: ${new Date().toLocaleString()}</p>
            <p style="margin-top: 15px;">
              <em>This report has been automatically generated and stored in the system. 
              The complete report data is also attached as a JSON file for record-keeping.</em>
            </p>
            <p style="color: #dc3545; font-weight: bold;">
              Please handle this report according to company whistleblowing policies and procedures.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private createJsonAttachment(data: WhistleblowingReportWithId): string {
    const reportWithMetadata = {
      ...data,
      submissionTimestamp: new Date().toISOString(),
      reportId: data.id || 'Generated after database save',
      systemInfo: {
        generatedBy: 'Denham & Gray Whistleblowing System',
        version: '1.0',
      },
    };

    return JSON.stringify(reportWithMetadata, null, 2);
  }
}