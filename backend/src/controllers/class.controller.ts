import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const classController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const classes = await prisma.class.findMany();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: "Error fetching classes" });
    }
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const class_ = await prisma.class.findUnique({
        where: { id: parseInt(id) },
        include: { supervisor: true, students: true },
      });
      if (class_) {
        res.json(class_);
      } else {
        res.status(404).json({ error: "Class not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching class" });
    }
  },

  create: async (req: Request, res: Response) => {
    const { name, description, supervisorId } = req.body;
    try {
      const newClass = await prisma.class.create({
        data: {
          name,
          description,
          supervisorId: supervisorId ? parseInt(supervisorId) : undefined,
        },
        include: {
          supervisor: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      res.status(201).json(newClass);
    } catch (error) {
      res.status(400).json({ error: "Error creating class" });
    }
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, supervisorId } = req.body;
    try {
      const updatedClass = await prisma.class.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          supervisorId: supervisorId ? parseInt(supervisorId) : undefined,
        },
        include: {
          supervisor: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      res.json(updatedClass);
    } catch (error) {
      res.status(400).json({ error: "Error updating class" });
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.class.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Error deleting class" });
    }
  },
  getClassBySupervisorId: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const class_ = await prisma.class.findFirst({
        where: { supervisorId: parseInt(id) },
      });
      res.json({ supervisor: class_ });
    } catch (error) {
      res.status(500).json({ error: "Error fetching class by supervisor" });
    }
  },
};
