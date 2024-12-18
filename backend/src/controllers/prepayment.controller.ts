import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { eachDayOfInterval, isWeekend } from "date-fns";

const prisma = new PrismaClient();

export const prepaymentController = {
  createPrepayment: async (req: Request, res: Response) => {
    const {
      amount,
      startDate,
      endDate,
      numberOfDays,
      studentId,
      classId,
      userId,
    } = req.body;

    try {
      const prepayment = await prisma.prepayment.create({
        data: {
          amount: parseFloat(amount),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          numberOfDays: parseInt(numberOfDays),
          studentId: parseInt(studentId),
          classId: parseInt(classId),
        },
      });

      // Update existing records or create new ones for the prepayment period
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dailyAmount = parseFloat(amount) / parseInt(numberOfDays);

      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        await prisma.record.upsert({
          where: {
            payedBy_submitedAt: {
              payedBy: parseInt(studentId),
              submitedAt: new Date(date),
            },
          },
          update: {
            amount: dailyAmount,
            isPrepaid: true,
            hasPaid: true,
          },
          create: {
            amount: dailyAmount,
            submitedAt: new Date(date),
            submitedBy: parseInt(userId), // Assuming req.user is set by authentication middleware
            payedBy: parseInt(studentId),
            isPrepaid: true,
            hasPaid: true,
            isAbsent: false,
            settingsAmount: dailyAmount,
            classId: parseInt(classId),
          },
        });
      }

      res.status(201).json(prepayment);
    } catch (error) {
      console.error("Error creating prepayment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllPrepayments: async (req: Request, res: Response) => {
    try {
      const prepayments = await prisma.prepayment.findMany({
        include: {
          student: true,
          class: true,
        },
      });
      res.status(200).json(prepayments);
    } catch (error) {
      console.error("Error fetching prepayments:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllPrepaymentsByClass: async (req: Request, res: Response) => {
    const { id } = req.params;
    const classId = id;

    // Validate classId
    if (!classId) {
      return res.status(400).json({ error: `Class ID is required ${id}` });
    }

    try {
      const prepayments = await prisma.prepayment.findMany({
        where: {
          classId: parseInt(classId.toString()),
        },
        include: {
          student: true,
          class: true,
        },
      });
      res.status(200).json(prepayments);
    } catch (error) {
      console.error("Error fetching prepayments by classId:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllPrepaymentsWithinADate: async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    try {
      const prepayments = await prisma.prepayment.findMany({
        where: {
          startDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
          endDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
        include: {
          student: true,
          class: true,
        },
      });
      res.status(200).json(prepayments);
    } catch (error) {
      console.error("Error fetching prepayments within date range:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updatePrepayment: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, startDate, endDate } = req.body;

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numberOfDays = eachDayOfInterval({ start, end }).filter(
        (date) => !isWeekend(date)
      ).length;

      const updatedPrepayment = await prisma.prepayment.update({
        where: { id: parseInt(id) },
        data: {
          amount: parseFloat(amount),
          startDate: start,
          endDate: end,
          numberOfDays,
        },
      });

      // Update existing prepaid records
      await prisma.record.updateMany({
        where: {
          payedBy: updatedPrepayment.studentId,
          isPrepaid: true,
          submitedAt: {
            gte: start,
            lte: end,
          },
        },
        data: {
          amount: parseFloat(amount) / numberOfDays,
          settingsAmount: parseFloat(amount) / numberOfDays,
        },
      });

      res.status(200).json(updatedPrepayment);
    } catch (error) {
      console.error("Error updating prepayment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deletePrepayment: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.prepayment.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prepayment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
