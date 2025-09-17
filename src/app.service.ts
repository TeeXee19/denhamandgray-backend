import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DbService } from './db/db.service';
import { UpdateStateDto, UpdateSummaryDto, CreateWhistleblowingReportDto } from './app.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private dbService: DbService,
    private readonly eventEmitter: EventEmitter2
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

  async createReport(createWhistleblowingReportDto: CreateWhistleblowingReportDto) {
    try {
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
          hasSupportingEvidence: createWhistleblowingReportDto.hasSupportingEvidence || false,
          remainAnonymous: createWhistleblowingReportDto.remainAnonymous || false,
          canContact: createWhistleblowingReportDto.canContact || false,
          additionalComments: createWhistleblowingReportDto.additionalComments,
        }
      });

      // Emit event for async email processing (non-blocking)
      const reportDataWithId = {
        ...createWhistleblowingReportDto,
        id: report.id,
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
