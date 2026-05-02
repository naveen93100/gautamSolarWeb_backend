const jwt = require("jsonwebtoken");
const { Admin } = require("../Models/AdminModel/AdminSchema");

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Unauthorized.."
            })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("decode : ",decode);
        const admin = await Admin.findOne({ _id: decode?.adminId }).select('-password');

        if (!admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.admin = admin
        next()
    } catch (error) {
        return res.status(401).json(error.message || { message: "Unauthorized" });
    }

}

module.exports = adminAuth;
