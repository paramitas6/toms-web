"use server";

import db from "@/db/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { DeliveryFeeTypes, DeliveryFeeType } from "@/lib/deliveryFeeTypes";

const deliveryFeeConfigSchema = z.object({
  basePostalCode: z.string().min(1),
  type: z.string().refine((val) => Object.values(DeliveryFeeTypes).includes(val as DeliveryFeeType), {
    message: "Invalid delivery fee type",
  }),
  distanceFeePerKm: z.number().int().min(0).optional(),
  customRules: z
    .array(
      z.object({
        postalCodePrefix: z.string().min(1),
        feeInCents: z.number().int().min(0),
      })
    )
    .optional(),
});

export async function addDeliveryFeeConfig(data: any) {
  const result = deliveryFeeConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid data");
  }

  const { basePostalCode, type, distanceFeePerKm, customRules } = result.data;

  const config = await db.deliveryFeeConfig.create({
    data: {
      basePostalCode,
      type,
      distanceFeePerKm,
    },
  });

  if (type === DeliveryFeeTypes.CUSTOM && customRules) {
    for (const rule of customRules) {
      await db.customDeliveryRule.create({
        data: {
          deliveryFeeConfigId: config.id,
          postalCodePrefix: rule.postalCodePrefix,
          feeInCents: rule.feeInCents,
        },
      });
    }
  }

  redirect("/admin/prices");
}

export async function updateDeliveryFeeConfig(data: any) {
  const result = deliveryFeeConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid data");
  }

  const { basePostalCode, type, distanceFeePerKm, customRules } = result.data;

  const existingConfig = await db.deliveryFeeConfig.findFirst();
  if (!existingConfig) {
    throw new Error("No existing configuration found");
  }

  await db.deliveryFeeConfig.update({
    where: { id: existingConfig.id },
    data: {
      basePostalCode,
      type,
      distanceFeePerKm,
    },
  });

  if (type === DeliveryFeeTypes.CUSTOM) {
    // Delete existing custom rules
    await db.customDeliveryRule.deleteMany({
      where: { deliveryFeeConfigId: existingConfig.id },
    });

    if (customRules) {
      for (const rule of customRules) {
        await db.customDeliveryRule.create({
          data: {
            deliveryFeeConfigId: existingConfig.id,
            postalCodePrefix: rule.postalCodePrefix,
            feeInCents: rule.feeInCents,
          },
        });
      }
    }
  }

  redirect("/admin/prices");
}

export async function deleteCustomRule(ruleId: string) {
  await db.customDeliveryRule.delete({
    where: { id: ruleId },
  });
}
