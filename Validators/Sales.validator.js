const { z, coerce } = require("zod");
const mongoose = require("mongoose");

const objectIdSchema = (field) =>
  z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: `${field} is missing`,
});


const salesProposalSchema = z.object({
  propId: objectIdSchema("ProposalId").optional(),
  salesId: objectIdSchema("SalesId").optional(),
  clientId: objectIdSchema("ClientId").optional(),

  gst: z.coerce
    .number({
      required_error: "Gst is required",
      invalid_type_error: "Gst Must be a Number",
    })
    .refine((val) => val !== 0, { message: "Gst is required" })
    .min(0, "Gst cannot be negative"),

  termsAndConditions: z
    .string({
      required_error: "Terms are Required",
      invalid_type_error: "Term must be a string",
    })
    .min(1, "Term cannot be empty"),

  selectedPanels: z
    .array(
      z.object({
        panelId: objectIdSchema("Panel"),
        wattId: objectIdSchema("Watt"),
        technologyId: objectIdSchema("Technology"),
        constructiveId: objectIdSchema("Constructive"),
        quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity Must be a Number",
          })
          .min(1, "Quantity cannot be zero"),
        rate: z
          .number({
            required_error: "Rate is required",
            invalid_type_error: "Rate Must be a Number",
          })
          .min(1, "Rate cannot be less than one"),
        totalPrice: z.number(),
        gstAmount: z.number(),
      }),
      {
        required_error: "SelectedPanels is required",
        invalid_type_error: "SelectedPanels must be an array",
      },
    )
    .min(1, "At least one panel is required"),
});


const createClientSchema = z.object({
  salesId: objectIdSchema("SalesId"),

  fullName: z.string().optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .transform((val) => val?.trim().toLowerCase()),

  address: z.string().optional(),

  phone: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z
      .string({
        required_error: "Phone Number is required",
        invalid_type_error: "Invalid phone type.",
      })
      .trim()
      .superRefine((val, ctx) => {
        if (!val) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number is required.",
          });
          return;
        }
        if (!/^[6-9]\d{9}$/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number is Invalid.",
          });
        }
      }),
  ),

  companyName: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z
      .string({ required_error: "Company name is required" })
      .trim()
      .min(1, "CompanyName is required."),
  ),

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
            message: "GSTIN is required.",
          });
          return;
        }
        if (
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid GSTIN Format!",
          });
        }
      }),
  ),
});


const updateClientSchema=createClientSchema.extend({
   clientId:objectIdSchema("ClientId")
});

module.exports = { salesProposalSchema, createClientSchema,updateClientSchema };
