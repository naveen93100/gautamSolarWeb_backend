const Sales = require("../../Models/Sales/sales.schema");

const createSalesPerson = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res
        .status(400)
        .json({ success: false, message: "Please fill required fields.." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email) || !phoneRegex.test(phone))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Phone address!" });

    const newSalesPerson = await Sales.create({
      name,
      email,
      phone,
      password,
    });

    return res.status(201).json({ success: true, message: "Account Created" });
  } catch (er) {
    if (er?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email Or Phone already exists" });
    }
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const getSalesPersonList = async (req, res) => {
  try {
    const sales = await Sales.find({});

    return res.status(200).json({ success: true, data: sales });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const createClient=async(req,res)=>{
     try {
        
        const {salesId,name,email,phone,address,companyName,gst}=req.body;

        

     } catch (er) {
        return res.status(500).json({success:false,message:er?.message});
     }
}

module.exports = {
  createSalesPerson,
  getSalesPersonList,
  createClient,
};
