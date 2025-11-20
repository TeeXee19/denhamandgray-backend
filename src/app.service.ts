import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DbService } from './db/db.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { UpdateStateDto, UpdateSummaryDto, CreateWhistleblowingReportDto } from './app.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private dbService: DbService,
    private readonly eventEmitter: EventEmitter2,
    private cloudinaryService: CloudinaryService
  ) { }
  
  async getStatesData(): Promise<any> {
    return await this.dbService.state.findMany();
  }

  async findStateById(id: number) {
    return await this.dbService.state.findUnique({
      where: {
        id
      }
    })
  }

  async updateStateById(id: number, updateStateDto: UpdateStateDto) {
    return await this.dbService.state.update({
      where: {
        id
      },
      data: updateStateDto
    })
  }
  
  async getSummary() {
    return await this.dbService.summary.findUnique({
      where: {
        id: 1
      }
    })
  }

  async updateSummary(updateSummaryDto: UpdateSummaryDto) {
    return await this.dbService.summary.update({
      where: {
        id: 1
      },
      data: updateSummaryDto
    })
  }

  async createReport(createWhistleblowingReportDto: CreateWhistleblowingReportDto, file?: Express.Multer.File) {
    try {
      let evidenceFileUrl: string | null = null;

      // Upload file to Cloudinary if provided
      if (file) {
        this.logger.log(`Uploading evidence file: ${file.originalname}`);
        evidenceFileUrl = await this.cloudinaryService.uploadFile(file);
        this.logger.log(`File uploaded successfully: ${evidenceFileUrl}`);
      }

      // Parse boolean values from form-data strings
      const parseBooleanValue = (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1';
        }
        return false;
      };

      // Create the report in the database
      const report = await this.dbService.whistleblowingReport.create({
        data: {
          firstName: createWhistleblowingReportDto.firstName,
          lastName: createWhistleblowingReportDto.lastName,
          email: createWhistleblowingReportDto.email,
          phone: createWhistleblowingReportDto.phone,
          role: createWhistleblowingReportDto.role,
          misconductType: createWhistleblowingReportDto.misconductType,
          incidentDateTime: new Date(createWhistleblowingReportDto.incidentDateTime),
          location: createWhistleblowingReportDto.location,
          peopleInvolved: createWhistleblowingReportDto.peopleInvolved,
          description: createWhistleblowingReportDto.description,
          howAwareDetails: createWhistleblowingReportDto.howAwareDetails,
          hasSupportingEvidence: parseBooleanValue(createWhistleblowingReportDto.hasSupportingEvidence),
          evidenceFileUrl: evidenceFileUrl,
          remainAnonymous: parseBooleanValue(createWhistleblowingReportDto.remainAnonymous),
          canContact: parseBooleanValue(createWhistleblowingReportDto.canContact),
          additionalComments: createWhistleblowingReportDto.additionalComments,
        }
      });

      // Emit event for async email processing (non-blocking)
      const reportDataWithId = {
        ...createWhistleblowingReportDto,
        id: report.id,
        evidenceFileUrl: evidenceFileUrl,
      };

      // Emit event - non-blocking and won't delay the response
      this.eventEmitter.emit('whistleblowing.report.created', reportDataWithId);
      this.logger.log(`Whistleblowing report {ID: ${report.id}} created and email event emitted`);

      return report;
    } catch (error) {
      this.logger.error('Failed to create whistleblowing report:', error);
      throw error;
    }
  }

  async getAllReports() {
    return await this.dbService.whistleblowingReport.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
