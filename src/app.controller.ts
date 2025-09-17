import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdateStateDto, UpdateSummaryDto, CreateWhistleblowingReportDto } from './app.dto';
import { AuthGuard } from './guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Submit a report' })
  @Post('reports')
  submitReport(@Body() createWhistleblowingReportDto: CreateWhistleblowingReportDto) {
    return this.appService.createReport(createWhistleblowingReportDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiTags('Reports')
  @ApiOperation({ summary: 'Get all reports' })
  @Get('reports')
  getAllReports() {
    return this.appService.getAllReports();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
