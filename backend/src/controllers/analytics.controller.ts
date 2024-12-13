import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const analyticsController = {
  getAdminAnalytics: async (req: Request, res: Response) => {
    try {
      const [totalAdmins, totalStudents, totalClasses, totalAmount] =
        await Promise.all([
          prisma.user.count({
            where: { role: "SUPER_ADMIN" },
          }),
          prisma.student.count(),
          prisma.class.count(),
          prisma.record.aggregate({
            _sum: {
              amount: true,
            },
          }),
        ]);

      const totalCollections = totalAmount._sum.amount || 0;

      res.status(200).json({
        totalAdmins,
        totalStudents,
        totalCollections,
        totalClasses,
      });
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getClassAnalytics: async (req: Request, res: Response) => {
    const { classId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [totalStudents, paidRecords, unpaidRecords] = await Promise.all([
        prisma.student.count({
          where: { classId: parseInt(classId) },
        }),
        prisma.record.findMany({
          where: {
            classId: parseInt(classId),
            submitedAt: { gte: today },
            hasPaid: true,
            payedBy: {
              not: null,
            },
          },
          select: {
            amount: true,
          },
        }),
        prisma.record.findMany({
          where: {
            classId: parseInt(classId),
            submitedAt: { gte: today },
            hasPaid: false,
            payedBy: {
              not: null,
            },
          },
          select: {
            amount: true,
          },
        }),
      ]);

      const paidAmount = paidRecords.reduce(
        (sum, record) => sum + record.amount,
        0
      );
      const unpaidAmount = unpaidRecords.reduce(
        (sum, record) => sum + record.amount,
        0
      );
      const totalAmount = paidAmount + unpaidAmount;

      res.status(200).json({
        totalAmount,
        totalStudents,
        paidStudents: {
          count: paidRecords.length,
          amount: paidAmount,
        },
        unpaidStudents: {
          count: unpaidRecords.length,
          amount: unpaidAmount,
        },
      });
    } catch (error) {
      console.error("Error fetching class analytics:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getDailyAnalytics: async (req: Request, res: Response) => {
    const { date } = req.query;
    const queryDate = date ? new Date(date as string) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    try {
      const [paidRecords, unpaidRecords, absentRecords] = await Promise.all([
        prisma.record.findMany({
          where: {
            submitedAt: {
              gte: queryDate,
              lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
            },
            hasPaid: true,
          },
          select: {
            amount: true,
          },
        }),
        prisma.record.findMany({
          where: {
            submitedAt: {
              gte: queryDate,
              lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
            },
            hasPaid: false,
            isAbsent: false,
          },
          select: {
            amount: true,
          },
        }),
        prisma.record.count({
          where: {
            submitedAt: {
              gte: queryDate,
              lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
            },
            isAbsent: true,
          },
        }),
      ]);

      const paidAmount = paidRecords.reduce(
        (sum, record) => sum + record.amount,
        0
      );
      const unpaidAmount = unpaidRecords.reduce(
        (sum, record) => sum + record.amount,
        0
      );
      const totalAmount = paidAmount + unpaidAmount;
      const totalRecords =
        paidRecords.length + unpaidRecords.length + absentRecords;

      res.status(200).json({
        date: queryDate.toISOString().split("T")[0],
        totalRecords,
        totalAmount,
        paidRecords: {
          count: paidRecords.length,
          amount: paidAmount,
        },
        unpaidRecords: {
          count: unpaidRecords.length,
          amount: unpaidAmount,
        },
        absentRecords: {
          count: absentRecords,
        },
      });
    } catch (error) {
      console.error("Error fetching daily analytics:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
