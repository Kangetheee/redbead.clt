import { z } from "zod";

export const floatSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (val) {
        const numVal = parseFloat(val);
        return numVal >= 0 && /^\d+(\.\d{1,2})?$/.test(val);
      }
      return true;
    },
    { message: "Invalid" }
  );

export const requiredFloatSchema = z
  .string()
  .min(1, "Required")
  .refine(
    (val) => {
      const numVal = parseFloat(val);
      return numVal >= 0 && /^\d+(\.\d{1,2})?$/.test(val);
    },
    { message: "Invalid" }
  );

export const numberSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (val) {
        const numVal = parseInt(val);
        return numVal >= 0;
      }
      return true;
    },
    { message: "Invalid" }
  );
export const requiredNumberSchema = z
  .string()
  .min(1, "Required")
  .refine(
    (val) => {
      const numVal = parseInt(val);
      return numVal >= 0;
    },
    { message: "Invalid" }
  );
