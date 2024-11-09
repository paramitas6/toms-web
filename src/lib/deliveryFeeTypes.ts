// src\lib\deliveryFeeTypes.ts

// Define allowed values for DeliveryFeeType
export const DeliveryFeeTypes = {
    DISTANCE: "DISTANCE",
    CUSTOM: "CUSTOM",
  } as const;
  
  export type DeliveryFeeType = typeof DeliveryFeeTypes[keyof typeof DeliveryFeeTypes];
  