import { Controller, Post, Body, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  async create(@Body() body: { userId: number; date?: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; note?: string }) {
    const date = body.date ? new Date(body.date) : new Date();
    return this.attendanceService.createAttendance(body.userId, date, body.status, body.note);
  }

  @Get('history/:userId')
  async history(@Param('userId', ParseIntPipe) userId: number) {
    return this.attendanceService.getHistory(userId);
  }

  @Get('summary/:userId')
  async summary(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.attendanceService.getMonthlySummary(userId, y, m);
  }

  @Post('analysis')
  async analysis(@Body() body: { startDate: string; endDate: string }) {
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    return this.attendanceService.analyze({ startDate: start, endDate: end });
  }
}
