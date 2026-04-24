const { z, coerce } = require("zod");
const mongoose = require("mongoose");

const objectIdSchema = (field) =>
  z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: `${field} is Invalid or missing`,
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
        panelId: objectIdSchema("PanelId"),
        wattId: objectIdSchema("WattId"),
        technologyId: objectIdSchema("TechnologyId"),
        constructiveId: objectIdSchema("ConstructiveId"),
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
          .min(1, "Rate cannot be zero"),
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

// salesId, fullName, email, phone, address, companyName, gstin
const createProposalSchema=z.object({
   salesId:objectIdSchema('SalesId'),
   fullName:z.string()
})

module.exports = salesProposalSchema;
