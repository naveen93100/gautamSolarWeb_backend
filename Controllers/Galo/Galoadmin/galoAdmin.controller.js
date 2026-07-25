const mongoose = require("mongoose");

const GaloSales = require("../../../Models/Galo/GaloSalesModal/galosales.schema");

const createGaloSalesPerson = async (req, res) => {
    try {
        let { name, phone, password } = req.body;

        if (!name || !phone || !password)
            return res.status(400).json({
                success: false,
                message: "Please fill required fields..",
            });

        name = name.trim();
        const phoneRegex = /^[6-9]\d{9}$/;
        const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

        if (!phoneRegex.test(phone))
            return res
                .status(400)
                .json({ success: false, message: "Invalid phone number!" });

        if (!nameRegex.test(name))
            return res
                .status(400)
                .json({ success: false, message: "Invalid name" });

        const newSalesPerson = await GaloSales.create({
            name,
            phone,
            password,
        });

        return res.status(201).json({
            success: true,
            message: "Account Created",
            data: {
                _id: newSalesPerson._id,
                name: newSalesPerson.name,
                phone: newSalesPerson.phone,
                isActive: newSalesPerson.isActive,
                userId: newSalesPerson.userId,
            },
        });
    } catch (er) {
        if (er?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "userId Or Phone already exists",
            });
        }
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const updateGaloSalesAccount = async (req, res) => {
    try {
        let { salesId, name, phone } = req.body;

        if (!mongoose.isValidObjectId(salesId))
            return res
                .status(400)
                .json({ success: false, message: "Invalid or missing Id." });

        const salesAccount = await GaloSales.findOne({ _id: salesId });

        if (!salesAccount)
            return res
                .status(404)
                .json({ success: false, message: "Account not found!" });

        const newData = {};

        if (name && name.trim()) {
            newData.name = name.trim();
        }

        if (phone) {
            phone = phone.replace(/\D/g, "");
            if (!/^[6-9]\d{9}$/.test(phone)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid Phone number!" });
            }
            if (phone !== salesAccount.phone) {
                newData.phone = phone;
            }
        }

        if (Object.keys(newData).length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "No Changes provided!" });
        }

        await GaloSales.findByIdAndUpdate(salesId, { $set: newData });
        return res
            .status(200)
            .json({ success: true, message: "Account Updated." });
    } catch (er) {
        if (er?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or phone already exist",
            });
        }
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const getGaloSalesPersonList = async (req, res) => {
    try {
        let { pageNo } = req.query;
        const limit = 6;

        pageNo = parseInt(pageNo) || 1;

        const sales = await GaloSales.aggregate([
            {
                $facet: {
                    totalRecord: [{ $count: "count" }],

                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: (pageNo - 1) * limit },
                        { $limit: limit },

                        {
                            $lookup: {
                                from: "galosalespanels",
                                localField: "_id",
                                foreignField: "salesId",
                                as: "totalClient",
                            },
                        },

                        {
                            $addFields: {
                                totalClient: {
                                    $size: {
                                        $ifNull: ["$totalClient", []],
                                    },
                                },
                            },
                        },

                        {
                            $project: {
                                password: 0,
                            },
                        },
                    ],
                },
            },

            {
                $project: {
                    data: 1,
                    totalRecord: {
                        $ifNull: [
                            { $arrayElemAt: ["$totalRecord.count", 0] },
                            0,
                        ],
                    },
                },
            },

            {
                $addFields: {
                    currentPage: pageNo,
                    limit,
                    hasNextPage: {
                        $gt: ["$totalRecord", pageNo * limit],
                    },
                },
            },
        ]);

        return res.status(200).json({ success: true, ...sales[0] });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const toggleGaloSalesStatus = async (req, res) => {
    try {
        const { salesId, isActive } = req.body;

        if (!mongoose.isValidObjectId(salesId))
            return res
                .status(400)
                .json({ success: false, message: "Invalid or missing Id" });

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false",
            });
        }

        const sales = await GaloSales.findOneAndUpdate(
            { _id: salesId },
            { $set: { isActive } },
            { new: true },
        );

        if (!sales) {
            return res.status(404).json({
                success: false,
                message: "Sales person not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Account ${isActive === true ? "Activated" : "De-Activated"}`,
        });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

module.exports = {
    createGaloSalesPerson,
    updateGaloSalesAccount,
    getGaloSalesPersonList,
    toggleGaloSalesStatus,
};
