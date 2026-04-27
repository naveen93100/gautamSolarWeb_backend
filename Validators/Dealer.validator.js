const { default: mongoose } = require("mongoose");
const { z } = require("zod");

const optionalValidatedString = (
  requiredMsg,
  invalidMsg = null,
  regex = null,
) =>
  z.preprocess(
    (val) => (val === undefined || val === null ? "" : val),
    z.string().superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMsg,
        });
        return;
      }

      if (regex && !regex.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: invalidMsg,
        });
      }
    }),
  );

const objectIdSchema = (field) =>
  z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: `${field} is missing`,
  })

const createClientSchema = z.object({
  dealerId: objectIdSchema("DealerId"),
  name: optionalValidatedString("Name is required", null, null),

  email: optionalValidatedString(
    "Email is required",
    "Invalid email",
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ),

  address: optionalValidatedString("Address is required", null, null),

  phone: optionalValidatedString(
    "Phone is required",
    "Invalid Phone Number",
    /^[6-9]\d{9}$/,
  ),
});

const updateClientSchema = createClientSchema
  .omit({
    dealerId: true,
  })
  .extend({
    customerId: objectIdSchema("CustomerId"),
  });

module.exports = { createClientSchema };
