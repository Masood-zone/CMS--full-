// const { PrismaClient } = require("@prisma/client");
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
// Seed Users
// const users = await Promise.all([
//   // prisma.user.create({
//   //   data: {
//   //     email: "super@canteen.com",
//   //     password: "password",
//   //     name: "Ama Owusu",
//   //     phone: "0241234567",
//   //     role: "SUPER_ADMIN",
//   //     gender: "female",
//   //   },
//   // }),
//   prisma.user.create({
//     data: {
//       email: "kirito@gmail.com",
//       password: "password",
//       name: "Newman Offoe",
//       phone: "0542335678",
//       role: "SUPER_ADMIN",
//       gender: "male",
//     },
//   }),
// ]);

// console.log("Seeded users:", users);

//   //   Seed Classes
//   const classes = await Promise.all([
//     prisma.class.create({
//       data: {
//         id: 1,
//         name: "JHS 1",
//       },
//     }),
//     prisma.class.create({
//       data: {
//         id: 2,
//         name: "JHS 2",
//       },
//     }),
//   ]);

//   console.log("Seeded classes:", classes);
// }
// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
