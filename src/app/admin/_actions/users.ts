"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import  { User } from "@prisma/client";

// Schema for user creation
const addSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]),
});

// Add User
export async function addUser(prevState: unknown, formdata: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

// Delete User
export async function deleteUser(id: string) {
  const user = await db.user.delete({ where: { id } });
  if (!user) return notFound();

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

// Update User
export async function updateUser(
  id: string,
  prevState: unknown,
  formdata: FormData
) {
  const result = addSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (!result.success) return result.error.formErrors.fieldErrors;

  const data = result.data;
  let password = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  await db.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      password,
      role: data.role,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}


export async function fetchUsers() {
  return await db.user.findMany();
}


// Fetch Users based on search query
export async function searchUsers(query: string): Promise<Pick<User, "id" | "name" | "email">[]> {
  if (!query || query.trim() === "") return [];
  
  return await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query} },
        { email: { contains: query} },
      ],
    },
    take: 10, // Limit to 10 results
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}
