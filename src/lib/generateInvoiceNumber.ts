import dayjs from "dayjs";

export default async function generateInvoiceNumber(orderId: string, createdAt: Date): Promise<number> {
  // Base from createdAt date, formatted as YYMMDD
  const dateBase = parseInt(dayjs(createdAt).format("YYMMDD"), 10);

  // Extract the last few digits from the UUID for uniqueness
  const uniquePart = parseInt(orderId.slice(-3), 16);

  // Combine and ensure an 8-digit integer using modulo
  const invoiceNumber = (dateBase * 1000 + uniquePart) % 100000000;
  
  return invoiceNumber;
}
