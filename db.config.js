const mongoose = require("mongoose");
require("dotenv").config();

const connect = mongoose.connect(process.env.MONGO_URI);


module.exports = { connect };
