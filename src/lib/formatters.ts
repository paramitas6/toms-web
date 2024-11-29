// src/lib/formatters.ts

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: 2,
  })
  
  export function formatCurrency(amount: number) {


    return CURRENCY_FORMATTER.format(amount)
  }
  
  const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")
  
  export function formatNumber(number: number) {
    return NUMBER_FORMATTER.format(number)
  }

  export function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }