import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const recordController = {
  generateDailyRecords: async (req: Request, res: Response) => {
    const { classId, date } = req.params;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Admin ID is required " + id });
    }

    const recordDate = new Date(date as string);
    recordDate.setHours(0, 0, 0, 0);

    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({ error: "Invalid date provided " + date });
    }

    try {
      const settings = await prisma.settings.findFirst({
        where: { name: "amount" },
      });
      const settingsAmount = settings ? parseInt(settings.value) : 0;

      const classQuery = classId
        ? { where: { id: parseInt(classId as string) } }
        : undefined;

      const classes = await prisma.class.findMany({
        include: { students: true },
        ...classQuery,
      });

      const createdRecords = [];
      const skippedRecords = [];

      for (const classItem of classes) {
        for (const student of classItem.students) {
          try {
            const record = await prisma.record.create({
              data: {
                classId: classItem.id,
                payedBy: student.id,
                submitedAt: recordDate,
                amount: settingsAmount,
                hasPaid: false,
                isPrepaid: false,
                isAbsent: false,
                settingsAmount,
                submitedBy: parseInt(id as string),
              },
            });
            createdRecords.push(record);
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === "P2002") {
                skippedRecords.push({
                  studentId: student.id,
                  date: recordDate.toISOString(),
                });
              } else {
                console.error("Prisma error:", error);
                throw error;
              }
            } else {
              console.error("Unknown error:", error);
              throw error;
            }
          }
        }
      }

      res.status(200).json({
        message: "Daily records generated successfully",
        createdRecords: createdRecords.length,
        skippedRecords: skippedRecords,
      });
    } catch (error) {
      console.error("Error generating daily records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllRecords: async (req: Request, res: Response) => {
    try {
      const records = await prisma.record.findMany({
        include: {
          student: true,
          class: true,
        },
      });
      res.status(200).json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getStudentRecordsByClassAndDate: async (req: Request, res: Response) => {
    const classId = parseInt(req.params.classId);
    const date = new Date(req.query.date as string);

    if (isNaN(classId) || isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid classId or date" });
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const records = await prisma.record.findMany({
        where: {
          classId,
          submitedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          payedBy: {
            not: undefined,
          },
        },
        include: { student: true },
      });

      res.status(200).json(records);
    } catch (error) {
      console.error("Error fetching student records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  submitAdminRecord: async (req: Request, res: Response) => {
    const {
      classId,
      date,
      unpaidStudents,
      paidStudents,
      absentStudents,
      adminId,
    } = req.body;
    const id = adminId ? parseInt(adminId as string) : 0;
    if (
      !classId ||
      !date ||
      !Array.isArray(unpaidStudents) ||
      !Array.isArray(paidStudents) ||
      !Array.isArray(absentStudents)
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    try {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const allStudents = [
        ...unpaidStudents,
        ...paidStudents,
        ...absentStudents,
      ];

      const updatedRecords = await prisma.$transaction(
        allStudents.map((student) =>
          prisma.record.upsert({
            where: {
              payedBy_submitedAt: {
                payedBy: parseInt(student.paidBy),
                submitedAt: startOfDay,
              },
            },
            update: {
              amount: student.amount || student.amount_owing,
              hasPaid: student.hasPaid,
              isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
              submitedBy: id, // Assuming req.user is set by the authentication middleware
            },
            create: {
              classId: parseInt(classId),
              payedBy: parseInt(student.paidBy),
              submitedAt: startOfDay,
              amount: student.amount || student.amount_owing,
              hasPaid: student.hasPaid,
              isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
              submitedBy: id, // Assuming req.user is set by the authentication middleware
              settingsAmount: student.amount || student.amount_owing,
            },
          })
        )
      );

      res.status(201).json(updatedRecords);
    } catch (error) {
      console.error("Error submitting admin record:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateStudentStatus: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hasPaid, isAbsent } = req.body;

    if (typeof hasPaid !== "boolean" || typeof isAbsent !== "boolean") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    try {
      const updatedRecord = await prisma.record.update({
        where: { id: parseInt(id) },
        data: {
          hasPaid,
          isAbsent,
        },
        include: { student: true },
      });

      res.status(200).json(updatedRecord);
    } catch (error) {
      console.error("Error updating student status:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Record not found" });
        } else {
          res.status(400).json({ error: "Error updating record" });
        }
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, payedBy, isPrepaid, hasPaid, adminId, classId, isAbsent } =
      req.body;
    try {
      const updatedRecord = await prisma.record.update({
        where: { id: parseInt(id) },
        data: {
          amount: parseInt(amount),
          payedBy: payedBy ? parseInt(payedBy) : undefined,
          isPrepaid: Boolean(isPrepaid),
          hasPaid: Boolean(hasPaid),
          classId: parseInt(classId),
          isAbsent: Boolean(isAbsent),
          submitedBy: parseInt(adminId), // Assuming req.user is set by the authentication middleware
        },
      });
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: "Error updating record" });
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.record.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Error deleting record" });
    }
  },
};
