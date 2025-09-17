# Event-Driven Email Architecture

## Overview

The whistleblowing report system now uses an event-driven architecture for email notifications. This provides several benefits:

- **Non-blocking**: API responses are faster since email sending doesn't block the response
- **Resilient**: Email failures don't affect report creation
- **Scalable**: Multiple listeners can be added for different notification types
- **Decoupled**: Email logic is separated from business logic

## Architecture

### Event Flow

1. **Client** submits whistleblowing report via API
2. **AppService** creates report in database
3. **AppService** emits `whistleblowing.report.created` event (non-blocking)
4. **AppService** returns response immediately to client
5. **EmailService** listens for the event and processes email asynchronously

### Event Details

**Event Name**: `whistleblowing.report.created`

**Payload**: 
```typescript
interface WhistleblowingReportWithId extends CreateWhistleblowingReportDto {
  id: number; // Generated database ID
}
```

**Listener**: `EmailService.handleWhistleblowingReportCreated()`

## Implementation

### AppService (Event Emitter)

```typescript
async createReport(createWhistleblowingReportDto: CreateWhistleblowingReportDto) {
  // Create report in database
  const report = await this.dbService.whistleblowingReport.create({...});
  
  // Emit non-blocking event
  this.eventEmitter.emit('whistleblowing.report.created', {
    ...createWhistleblowingReportDto,
    id: report.id,
  });
  
  // Return immediately - don't wait for email
  return report;
}
```

### EmailService (Event Listener)

```typescript
@OnEvent('whistleblowing.report.created')
async handleWhistleblowingReportCreated(reportData: WhistleblowingReportWithId) {
  try {
    await this.sendWhistleblowingReport(reportData);
    this.logger.log(`Email sent for report ${reportData.id}`);
  } catch (error) {
    this.logger.error(`Email failed for report ${reportData.id}:`, error);
  }
}
```

## Benefits

### Performance
- **API Response Time**: Reduced from ~2-5 seconds to milliseconds
- **User Experience**: Users get immediate feedback
- **Throughput**: Higher request handling capacity

### Reliability
- **Fault Isolation**: Email failures don't break report submission
- **Retry Logic**: Easy to add retry mechanisms for failed emails
- **Monitoring**: Separate logging and metrics for email vs. API operations

### Maintainability
- **Separation of Concerns**: Business logic separate from notification logic
- **Testability**: Easier to unit test each component independently
- **Extensibility**: Easy to add more event listeners (SMS, Slack, etc.)

## Dependencies

```bash
pnpm add @nestjs/event-emitter
```

## Configuration

### AppModule
```typescript
imports: [
  EventEmitterModule.forRoot(),
  // other modules...
]
```

## Monitoring

### Logs to Watch For

**Successful Flow:**
```
[AppService] Whistleblowing report 123 created and email event emitted
[EmailService] Email notification sent for whistleblowing report 123
```

**Email Failure (Non-blocking):**
```
[AppService] Whistleblowing report 123 created and email event emitted
[EmailService] Failed to send email notification for report 123: [error details]
```

### Metrics to Track
- Event emission rate
- Email success/failure rates
- Email processing time
- Queue depth (if using advanced event processing)

## Future Enhancements

1. **Retry Logic**: Add exponential backoff for failed emails
2. **Multiple Channels**: Add SMS, Slack, Teams notifications
3. **Email Templates**: Template-based emails with branding
4. **Batch Processing**: Group multiple reports for digest emails
5. **Priority Queues**: High-priority reports get faster email delivery