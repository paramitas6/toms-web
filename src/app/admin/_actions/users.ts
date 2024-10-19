"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
const addSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]),
});

export async function addUser(prevState: unknown, formdata: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(data.password, 10); // 10 is the salt rounds

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword, // Store the hashed password
      role: data.role,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  const user = await db.user.delete({
    where: {
      id,
    },
  });
  if (user == null) {
    return notFound();
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(
  id: string,
  prevState: unknown,
  formdata: FormData
) {
  const result = addSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // If the password is being updated, hash it
  let password = data.password;
  if (password) {
    password = await bcrypt.hash(password, 10);
  }

  const user = await db.user.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      email: data.email,
      password, // Store the hashed password (if updated)
      role: data.role,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}