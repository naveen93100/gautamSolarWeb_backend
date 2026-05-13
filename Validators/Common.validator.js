const { z } = require("zod");

const createDealerAccountAdminSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z
    .any()
    .transform((val) => val ?? "")
    .superRefine((val, ctx) => {
      const email = String(val).trim();
      if (!email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is required",
        });
        return;
      }

      if (!z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Email",
        });
        return;
      }
    }),
  gstin: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z
      .string()
      .trim()
      .transform((val) => val?.toUpperCase())
      .superRefine((val, ctx) => {
        if (!val) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Gstin is required.",
          });
          return;
        }
        if (
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Gstin Format",
          });
        }
      }),
  ),

  contactNumber: z
    .any()
    .transform((val) => val ?? "")
    .superRefine((val, ctx) => {
      const phone = String(val).trim();
      if (!phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required",
        });
        return;
      }

      if (!/^[6-9]\d{9}$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid phone number",
        });
        return;
      }
    }),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(10, "Password cannot exceed 10 characters"),

  address: z.string().min(1, "Address is required"),
});

module.exports = { createDealerAccountAdminSchema };
