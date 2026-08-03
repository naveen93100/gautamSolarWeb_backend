const { z } = require("zod");
const mongoose = require("mongoose");

const objectIdSchema = (field) =>
  z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: `${field} is missing`,
  });

// ================= Proposal =================

const galoSalesProposalSchema = z.object({
  propId: objectIdSchema("ProposalId").optional(),

  salesId: objectIdSchema("SalesId").optional(),

  customerId: objectIdSchema("CustomerId").optional(),

  gst: z.coerce
    .number({
      required_error: "GST is required",
      invalid_type_error: "GST must be a number",
    })
    .min(0, "GST cannot be negative"),

  termsAndConditions: z
    .string({
      required_error: "Terms & Conditions are required",
      invalid_type_error: "Terms & Conditions must be a string",
    })
    .min(1, "Terms & Conditions cannot be empty"),

  selectedPanels: z
    .array(
      z.object({
        panelId: objectIdSchema("Panel"),

        technologyId: objectIdSchema("Technology"),

        constructiveId: objectIdSchema("Constructive"),

        wattId: objectIdSchema("Panel Watt"),
        inverterId: objectIdSchema("Inverter capacity").optional(),

        quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .min(1, "Quantity must be at least 1"),

        rate: z
          .number({
            required_error: "Rate is required",
            invalid_type_error: "Rate must be a number",
          })
          .min(1, "Rate must be greater than 0"),

        totalPrice: z.number({
          required_error: "Total Price is required",
        }),

        subsidyAmount: z.number().optional().decode(0),
        gstAmount: z.number({
          required_error: "GST Amount is required",
        }),
      }),
      {
        required_error: "Selected Panels are required",
        invalid_type_error: "Selected Panels must be an array",
      }
    )
    .min(1, "At least one panel is required"),
});

// ================= Customer =================

const galoCreateClientSchema = z.object({
  salesId: objectIdSchema("SalesId"),

  fullName: z.string().optional(),

  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .transform((val) => val?.trim().toLowerCase()),

  address: z.string().optional(),

  phone: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z
      .string({
        required_error: "Phone number is required",
      })
      .trim()
      .superRefine((val, ctx) => {
        if (!val) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number is required",
          });
          return;
        }

        if (!/^[6-9]\d{9}$/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid phone number",
          });
        }
      })
  ),

  companyName: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z
      .string({
        required_error: "Company Name is required",
      })
      .trim()
      .min(1, "Company Name is required")
  ),

  gstin: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .superRefine((val, ctx) => {
        if (!val) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "GSTIN is required",
          });
          return;
        }

        if (
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            val
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid GSTIN format",
          });
        }
      })
  ),
});

// ================= Update Customer =================

const galoUpdateClientSchema = galoCreateClientSchema.extend({
  customerId: objectIdSchema("CustomerId"),
});

module.exports = {
  galoSalesProposalSchema,
  galoCreateClientSchema,
  galoUpdateClientSchema,
};