// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";
import * as argon2 from "argon2";

export async function POST(req: NextRequest) {
  const { email, password, name, lastname, username } = await req.json();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      lastname,
      username,
    },
  });

  return NextResponse.json({ user });
}
