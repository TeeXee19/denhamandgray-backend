import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { UpdateStateDto, UpdateSummaryDto, CreateWhistleblowingReportDto, CreateContactSubmissionDto } from './app.dto';
import { AuthGuard } from './guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @UseGuards(AuthGuard)
  @Get('states')
  getStatesData(): Promise<any> {
    return this.appService.getStatesData();
  }
  
  @Get('states/:id')
  findStateById(@Param('id') id: string) {
    return this.appService.findStateById(+id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('states/:id')
  updateStateById(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    return this.appService.updateStateById(+id, updateStateDto);
  }
 
 
  @Get('summary')
  getSummary() {
    return this.appService.getSummary();
  }
 
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('summary')
  updateSummary(@Body() updateSummaryDto: UpdateSummaryDto) {
    return this.appService.updateSummary(updateSummaryDto);
  }

  @ApiTags('Reports')
  @ApiOperation({ summary: 'Submit a whistleblowing report with optional file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        role: { type: 'string' },
        misconductType: { type: 'string' },
        incidentDateTime: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        peopleInvolved: { type: 'string' },
        description: { type: 'string' },
        howAwareDetails: { type: 'string' },
        hasSupportingEvidence: { type: 'boolean' },
        remainAnonymous: { type: 'boolean' },
        canContact: { type: 'boolean' },
        additionalComments: { type: 'string' },
        evidenceFile: {
          type: 'string',
          format: 'binary',
          description: 'Supporting evidence file (PDF, images, documents)',
        },
      },
      required: ['misconductType', 'incidentDateTime', 'description', 'howAwareDetails'],
    },
  })
  @Post('reports')
  @UseInterceptors(FileInterceptor('evidenceFile'))
  async submitReport(
    @Body() createWhistleblowingReportDto: CreateWhistleblowingReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.appService.createReport(createWhistleblowingReportDto, file);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiTags('Reports')
  @ApiOperation({ summary: 'Get all reports' })
  @Get('reports')
  getAllReports() {
    return this.appService.getAllReports();
  }

  @ApiTags('Contact')
  @ApiOperation({ summary: 'Submit a contact form' })
  @Post('contact')
  submitContact(@Body() createContactSubmissionDto: CreateContactSubmissionDto) {
    return this.appService.createContactSubmission(createContactSubmissionDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiTags('Contact')
  @ApiOperation({ summary: 'Get all contact submissions' })
  @Get('contact')
  getAllContacts() {
    return this.appService.getAllContacts();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
