const jwt = require("jsonwebtoken");
const { Admin } = require("../Models/AdminModel/AdminSchema");

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(404).json({
                success: false,
                message: "No token provide.."
            })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode);
        const admin = await Admin.find({ _id: decode?.adminId });
        //  console.log("Admin : ",admin)
        if (!admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }
            req.admin=admin
        next()
    } catch (error) {
        return res.status(401).json(error.message || { message: "Unauthorized" });
    }

}

module.exports = adminAuth;
