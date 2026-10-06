
const jwt = require("jsonwebtoken");
const GaloAdmin = require("../Models/Galo/GaloAdminModels/GaloAdminSchema");

const galoAdminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await GaloAdmin.findOne({
            _id: decode?.adminId,
        }).select("-password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is disabled",
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || "Unauthorized",
        });
    }
};

module.exports = galoAdminAuth;
