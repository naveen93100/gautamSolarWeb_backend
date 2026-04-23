const jwt = require("jsonwebtoken");
const Sales = require("../Models/Sales/sales.schema");

const salesAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "No token Found.."
            })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const sales = await Sales.findOne({ _id: decode?.id });

        if (!sales) {
            return res.status(401).json({ success:false, message: "Unauthorized" });
        }
        req.sales = sales;
        next()
    } catch (error) {
        return res.status(401).json(error.message || { message: "Unauthorized" });
    }

}

module.exports = salesAuth;
