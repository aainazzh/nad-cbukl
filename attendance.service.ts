import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays, startOfDay } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendance(userId: number, date: Date, status: string, note?: string) {
    // Prevent duplicate for same date (same user)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: { userId, date: { gte: dayStart, lt: new Date(dayStart.getTime() + 24*60*60*1000) } },
    });
    if (existing) {
      // jika sudah ada, kita bisa update atau return error; di sini return existing
      return existing;
    }
    return this.prisma.attendance.create({
      data: { userId, date, status: status as any, note },
    });
  }

  async getHistory(userId: number) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getMonthlySummary(userId: number, year: number, month: number) {
    // month: 1..12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const rows = await this.prisma.attendance.findMany({
      where: { userId, date: { gte: start, lt: end } },
    });
    const totalDays = rows.length;
    const counts = rows.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalDays, counts };
  }

  async analyze(params: { startDate: Date; endDate: Date; groupBy?: string }) {
    // Simplified: counts per user in period
    const rows = await this.prisma.attendance.groupBy({
      by: ['userId', 'status'],
      where: { date: { gte: params.startDate, lte: params.endDate } },
      _count: { id: true },
    });
    return rows;
  }
}
