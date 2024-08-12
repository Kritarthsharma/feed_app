import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Step 1: Create users
  const johnDoe = await prisma.user.upsert({
    where: { username: "john_doe" },
    update: {},
    create: {
      id: "clzpw1r2g00000cjzdy27h5is",
      username: "john_doe",
      email: "john@example.com",
      password: await argon2.hash("hashed_password_1"),
      name: "John",
      lastname: "Doe",
    },
  });

  const janeDoe = await prisma.user.upsert({
    where: { username: "jane_doe" },
    update: {},
    create: {
      id: "clzqevgda00000cmj78cc8ujt",
      username: "jane_doe",
      email: "jane@example.com",
      password: await argon2.hash("hashed_password_2"),
      name: "Jane",
      lastname: "Doe",
    },
  });

  const aliceSmith = await prisma.user.upsert({
    where: { username: "alice_smith" },
    update: {},
    create: {
      id: "clzqew52l00010cmj359rajgl",
      username: "alice_smith",
      email: "alice@example.com",
      password: await argon2.hash("hashed_password_3"),
      name: "Alice",
      lastname: "Smith",
    },
  });

  // Step 2: Create posts and comments now that users are in the database
  const post1 = await prisma.post.create({
    data: {
      content: "This is my first post!",
      authorId: johnDoe.id,
      comments: {
        create: [
          {
            content: "Nice post, John!",
            authorId: janeDoe.id,
          },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: "Hello world, this is Jane!",
      authorId: janeDoe.id,
      comments: {
        create: [
          {
            content: "Welcome to the platform, Jane!",
            authorId: johnDoe.id,
          },
          {
            content: "Thanks, John!",
            authorId: janeDoe.id,
          },
        ],
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      content: "Alice here, sharing some thoughts.",
      authorId: aliceSmith.id,
      comments: {
        create: [
          {
            content: "Great insights, Alice!",
            authorId: johnDoe.id,
          },
        ],
      },
    },
  });

  console.log("Data loaded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
