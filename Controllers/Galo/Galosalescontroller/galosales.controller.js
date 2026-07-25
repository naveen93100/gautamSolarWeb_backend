




const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const GaloSales = require("../../../Models/Galo/GaloSalesModal/galosales.schema");
const GalosalesCustomer = require("../../../Models/Galo/GaloSalesModal/galosalescounter.schema");
const GaloSalesPanel = require("../../../Models/Galo/GaloSalesModal/galosales.panel.schema");

const {
    galoSalesProposalSchema,
    galoCreateClientSchema,
    galoUpdateClientSchema,
    
} = require("../../../Validators/Galosales.validator");

const createGaloSalesProposal = async (req, res) => {
    try {
        const result = galoSalesProposalSchema.safeParse(req.body);

        if (!result.success) {
            const message = [];

            result.error.issues.forEach((err) => {
                message.push({ message: err.message });
            });

            return res.status(400).json({
                success: false,
                message,
            });
        }

        const { salesId, customerId, gst, termsAndConditions, selectedPanels } =
            result.data;

        const wattIds = selectedPanels.map((panel) => panel.wattId);

        const uniqueWattIds = new Set(wattIds);

        if (wattIds.length !== uniqueWattIds.size) {
            return res.status(400).json({
                success: false,
                message: "Duplicate wattId found in selectedPanels",
            });
        }

        const finalPrice = selectedPanels.reduce((total, item) => {
            return (
                total +
                Number(item.totalPrice || 0) +
                Number(item.gstAmount || 0)
            );
        }, 0);

        const panelProposal = await GaloSalesPanel.create({
            salesId,
            customerId,
            gst,
            termsAndConditions,
            selectedPanels,
            finalPrice,
        });

        return res.status(201).json({
            success: true,
            message: "Proposal Created Successfully!",
            data: panelProposal,
        });
    } catch (er) {
        return res.status(500).json({
            success: false,
            message: er?.message,
        });
    }
};

const getGaloClientProposals = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!mongoose.isValidObjectId(customerId))
            return res.status(400).json({
                success: false,
                message: "Invalid or missing customerId",
            });

        const proposal = await GaloSalesPanel.find({ customerId })
            .populate("customerId salesId")
            .populate({
                path: "selectedPanels",
                populate: [
                    { path: "wattId" },
                    { path: "panelId" },
                    { path: "constructiveId" },
                    { path: "technologyId" },
                ],
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ success: true, data: proposal });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const deleteGaloProposal = async (req, res) => {
    try {
        const { propId } = req.params;

        if (!mongoose.isValidObjectId(propId))
            return res.status(400).json({
                success: false,
                message: "Invalid or missing Proposal Id",
            });

        const deletedProposal = await GaloSalesPanel.findByIdAndDelete(propId);

        if (!deletedProposal)
            return res
                .status(404)
                .json({ success: false, message: "Proposal Not found" });

        return res
            .status(200)
            .json({ success: true, message: "Proposal Deleted!" });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const updateGaloSalesProposal = async (req, res) => {
    try {
        const result = galoSalesProposalSchema.safeParse(req.body);

        if (!result.success) {
            const message = [];
            result.error.issues.forEach((err) => {
                message.push({ message: err.message });
            });

            return res.status(400).json({
                success: false,
                message,
            });
        }

        const { propId, gst, termsAndConditions, selectedPanels } = result.data;

        const wattIds = selectedPanels.map((panel) => panel.wattId);

        const uniqueWattIds = new Set(wattIds);
        if (wattIds.length !== uniqueWattIds.size) {
            return res.status(400).json({
                success: false,
                message: "Duplicate wattId found in selectedPanels",
            });
        }

        const finalPrice = selectedPanels.reduce((total, item) => {
            return (
                total +
                Number(item.totalPrice || 0) +
                Number(item.gstAmount || 0)
            );
        }, 0);

        const data = { finalPrice, ...result.data };

        const updatedProposal = await GaloSalesPanel.findByIdAndUpdate(
            propId,
            { $set: data },
            { new: true },
        );

        if (!updatedProposal)
            return res
                .status(404)
                .json({ success: false, message: "Proposal not found!" });

        return res.status(200).json({
            success: true,
            message: "Proposal Updated successfully!",
            data: updatedProposal,
        });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const galoSalesLogin = async (req, res) => {
    try {
        let { userId, password } = req.body;

        if (!userId || !password)
            return res.status(400).json({
                success: false,
                message: "userId and Password not provided",
            });

        userId = userId.toUpperCase();

        const salesPerson = await GaloSales.findOne({ userId }).select(
            "+password",
        );

        if (!salesPerson)
            return res
                .status(404)
                .json({ success: false, message: "Account Not found!" });

        if (!salesPerson.isActive)
            return res
                .status(400)
                .json({ success: false, message: "Account is De-Activated" });

        const comparePass = await bcrypt.compare(
            password,
            salesPerson.password,
        );

        if (!comparePass)
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password" });

        const token = jwt.sign(
            { id: salesPerson._id, userId: salesPerson.userId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successfully!",
            data: {
                _id: salesPerson._id,
                name: salesPerson.name,
                userId: salesPerson.userId,
                phone: salesPerson.phone,
            },
            token,
        });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const galoLogout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res
            .status(200)
            .json({ success: true, message: "Logout successfully!" });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const createGaloClient = async (req, res) => {
    try {
        const result = galoCreateClientSchema.safeParse(req.body);

        if (!result.success) {
            const message = [];
            result.error.issues.forEach((err) => {
                message.push({ message: err.message });
            });

            return res.status(400).json({
                success: false,
                message,
            });
        }

        const { salesId, ...rest } = result.data;

        const data = {
            ...rest,
            salesPersonId: salesId,
        };

        const createCustomer = await GalosalesCustomer.create(data);

        return res.status(201).json({
            success: true,
            message: "Customer Created!",
            data: { ...createCustomer },
        });
    } catch (er) {
        if (er?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: [{ message: "Phone or Gstin Number already exist!" }],
            });
        }

        return res
            .status(500)
            .json({ success: false, message: [{ message: er?.message }] });
    }
};

const updateGaloClient = async (req, res) => {
    try {
        const result = galoUpdateClientSchema.safeParse(req.body);

        if (!result.success) {
            const message = [];
            result.error.issues.forEach((err) => {
                message.push({ message: err.message });
            });

            return res.status(400).json({
                success: false,
                message,
            });
        }

        const { customerId, salesId, ...rest } = result.data;

        await GalosalesCustomer.findOneAndUpdate(
            { _id: customerId, salesPersonId: salesId },
            { $set: rest },
            { new: true },
        );

        return res
            .status(200)
            .json({ success: true, message: "Client Updated!" });
    } catch (er) {
        if (er?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: [
                    {
                        message:
                            "Phone or Gstin Already exist! Use different one",
                    },
                ],
            });
        }
        return res
            .status(500)
            .json({ success: false, message: [{ message: er?.message }] });
    }
};

const getGaloClient = async (req, res) => {
    try {
        const { salesId } = req.params;

        if (!mongoose.isValidObjectId(salesId))
            return res
                .status(400)
                .json({ success: false, message: "Invalid or missing Id" });

        const sales = await GalosalesCustomer.find({ salesPersonId: salesId });
        return res.status(200).json({ success: true, sales });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

module.exports = {
    createGaloClient,
    galoSalesLogin,
    galoLogout,
    getGaloClient,
    updateGaloClient,
    createGaloSalesProposal,
    getGaloClientProposals,
    deleteGaloProposal,
    updateGaloSalesProposal,
};




