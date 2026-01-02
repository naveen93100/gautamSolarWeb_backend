const mongoose = require("mongoose");

const MaterialSchema = mongoose.Schema({
  name: String,
  specification: String,
  unit: {
    type: String,
    enum: ["kw",'nos','sets','mm'],
  }

},{timestamps:true});

const MaterialModel=mongoose.model('Material',MaterialSchema);
module.exports=MaterialModel;
