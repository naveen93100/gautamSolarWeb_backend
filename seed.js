const MaterialModel = require("./Models/material.schema");

const solarSystemComponents = [
  {
    name: "ALMM & BIS Approved Gautam Solar's PV Modules",
    specification:
      "Fully compliant with Indian regulations, these systems are certified for quality, safety, and performance, ensuring reliable and dependable operation for long-term project deployment.",
    unit: "kw"
  },
  {
    name: "Inverter",
    specification:
      "Designed for high-efficiency power conversion, these systems feature built-in safety and protection mechanisms and a durable, grid-compliant design for reliable long-term operation.",
    unit: "nos"
  },
  {
    name: "ACDB",
    specification:
      "Designed for safe and efficient AC power distribution, these systems feature integrated overload and short-circuit protection along with a compliant, long-life construction.",
    unit: "sets"
  },
  {
    name: "DCDB",
    specification:
      "Designed for efficient DC power handling, these systems offer surge and fault protection along with an outdoor-ready, reliable design for dependable performance.",
    unit: "sets"
  },
  {
    name: "Wiring Cables",
    specification:
      "Engineered with low-loss, high-conductivity cables, these solutions feature UV- and heat-resistant insulation and are standards-compliant to ensure a long service life.",
    unit: "mm"
  },
  {
    name: "Lightning Arrester",
    specification:
      "Built with high surge-handling capability, these systems provide fast-response protection and feature a weather-resistant construction for reliable performance.",
    unit: "sets"
  },
  {
    name: "Earthing",
    specification:
      "Designed for low-resistance current dissipation, these systems use corrosion-resistant materials and a standards-compliant safety design for reliable long-term protection.",
    unit: "sets"
  },
  {
    name: "PVC Cable",
    specification:
      "Made with high-quality copper conductors, these cables feature strong PVC insulation and are well suited for safe and reliable indoor electrical use.",
    unit: "mm"
  }
];

async function seedData() {
  try {
    const count = await MaterialModel.countDocuments();

    if (count > 0) {
      console.log("⚠️ Seed already ran before, no insertion done.");
      process.exit(0);
    }

    await MaterialModel.insertMany(solarSystemComponents);
    console.log("✅ Data inserted successfully!");

    // Delete this file after seed
    // fs.unlink("./seed.js", (err) => {
    //   if (err) {
    //     console.log("❌ Failed to delete seed file:", err);
    //   } else {
    //     console.log("🗑️ seed.js deleted automatically!");
    //   }
    //   process.exit(0);
    // });

  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

module.exports=seedData
