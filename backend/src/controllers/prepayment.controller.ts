import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const prepaymentController = {
  createPrepayment: async (req: Request, res: Response) => {
    const { amount, startDate, endDate, numberOfDays, studentId, classId } =
      req.body;

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
    const { amount, startDate, endDate, numberOfDays } = req.body;

    try {
      const updatedPrepayment = await prisma.prepayment.update({
        where: { id: parseInt(id) },
        data: {
          amount: parseFloat(amount),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          numberOfDays: parseInt(numberOfDays),
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
