const DealerModel = require("../Models/dealer.schema");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req?.headers?.authorization;  
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    let tokenData = await DealerModel.findOne({ token });

    if (tokenData.tokenExpiry < new Date()) {
      tokenData.token = null;
      tokenData.tokenExpiry = null;
      await tokenData.save();

      return res.status(401).json({ success: false, message: "Session Expired! Please Login Again" });
    }

     next();
  } catch (er) {
    console.log(er);
    return res
      .status(401)
      .json({
        success: true,
        message: "Session expired",
      });
  }
};

module.exports = verifyToken;
