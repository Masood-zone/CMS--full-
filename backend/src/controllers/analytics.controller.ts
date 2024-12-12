import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const analyticsController = {
  getAdminAnalytics: async (req: Request, res: Response) => {
    try {
      const [totalAdmins, totalStudents, totalClasses, settingsAmount] =
        await Promise.all([
          prisma.user.count({
            where: { role: "ADMIN" },
          }),
          prisma.student.count(),
          prisma.class.count(),
          prisma.settings.findFirst({
            where: { name: "amount" },
            select: { value: true },
          }),
        ]);

      const amount = settingsAmount ? parseInt(settingsAmount.value) : 0;
      const totalCollections = totalStudents * amount;

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
      const [settingsAmount, totalStudents, paidStudents, unpaidStudents] =
        await Promise.all([
          prisma.settings.findFirst({
            where: { name: "amount" },
            select: { value: true },
          }),
          prisma.student.count({
            where: { classId: parseInt(classId) },
          }),
          prisma.record.count({
            where: {
              classId: parseInt(classId),
              submitedAt: { gte: today },
              hasPaid: true,
              payedBy: {
                not: null,
              },
            },
          }),
          prisma.record.count({
            where: {
              classId: parseInt(classId),
              submitedAt: { gte: today },
              hasPaid: false,
              payedBy: {
                not: null,
              },
            },
          }),
        ]);

      const amount = settingsAmount ? parseInt(settingsAmount.value) : 0;
      const totalAmount = totalStudents * amount;
      const paidAmount = paidStudents * amount;
      const unpaidAmount = unpaidStudents * amount;

      res.status(200).json({
        totalAmount,
        totalStudents,
        paidStudents: {
          count: paidStudents,
          amount: paidAmount,
        },
        unpaidStudents: {
          count: unpaidStudents,
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
      const [
        settingsAmount,
        totalRecords,
        paidRecords,
        unpaidRecords,
        absentRecords,
      ] = await Promise.all([
        prisma.settings.findFirst({
          where: { name: "amount" },
          select: { value: true },
        }),
        prisma.record.count({
          where: {
            submitedAt: {
              gte: queryDate,
              lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.record.count({
          where: {
            submitedAt: {
              gte: queryDate,
              lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
            },
            hasPaid: true,
          },
        }),
        prisma.record.count({
          where: {
            submitedAt: {
              gte: queryDate,
              lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
            },
            hasPaid: false,
            isAbsent: false,
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

      const amount = settingsAmount ? parseInt(settingsAmount.value) : 0;
      const totalAmount = totalRecords * amount;
      const paidAmount = paidRecords * amount;
      const unpaidAmount = unpaidRecords * amount;

      res.status(200).json({
        date: queryDate.toISOString().split("T")[0],
        totalRecords,
        totalAmount,
        paidRecords: {
          count: paidRecords,
          amount: paidAmount,
        },
        unpaidRecords: {
          count: unpaidRecords,
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
