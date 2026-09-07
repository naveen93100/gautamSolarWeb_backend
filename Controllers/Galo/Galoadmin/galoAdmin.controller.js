// const mongoose = require("mongoose");
// const GaloPanel = require("../../../Models/Galo/GaloAdminModels/GaloPannelTypeSchema");
// const GaloTechnology = require("../../../Models/Galo/GaloAdminModels/GaloPannelTechnologySchema");
// const GaloConstructive = require("../../../Models/Galo/GaloAdminModels/GaloConstructiveSchema");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const {GaloAdmin} = require("../../../Models/Galo/GaloAdminModels/GaloAdminSchema");
// const GaloPanelWatt = require("../../../Models/Galo/GaloAdminModels/GaloPannelWattSchema")
// const path = require("path");
// const fs = require("fs");
// const fsp = require("fs").promises;
// const xlxs = require("xlsx");

// const GaloSales = require("../../../Models/Galo/GaloSalesModal/galosales.schema");
// const sharp = require("sharp");

// const createGaloSalesPerson = async (req, res) => {
//     try {
//         let { name, phone, password } = req.body;

//         if (!name || !phone || !password)
//             return res.status(400).json({
//                 success: false,
//                 message: "Please fill required fields..",
//             });

//         name = name.trim();
//         const phoneRegex = /^[6-9]\d{9}$/;
//         const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

//         if (!phoneRegex.test(phone))
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid phone number!" });

//         if (!nameRegex.test(name))
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid name" });

//         const newSalesPerson = await GaloSales.create({
//             name,
//             phone,
//             password,
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Account Created",
//             data: {
//                 _id: newSalesPerson._id,
//                 name: newSalesPerson.name,
//                 phone: newSalesPerson.phone,
//                 isActive: newSalesPerson.isActive,
//                 userId: newSalesPerson.userId,
//             },
//         });
//     } catch (er) {
//         if (er?.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: "userId Or Phone already exists",
//             });
//         }
//         return res.status(500).json({ success: false, message: er?.message });
//     }
// };

// const updateGaloSalesAccount = async (req, res) => {
//     try {
//         let { salesId, name, phone } = req.body;

//         if (!mongoose.isValidObjectId(salesId))
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid or missing Id." });

//         const salesAccount = await GaloSales.findOne({ _id: salesId });

//         if (!salesAccount)
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Account not found!" });

//         const newData = {};

//         if (name && name.trim()) {
//             newData.name = name.trim();
//         }

//         if (phone) {
//             phone = phone.replace(/\D/g, "");
//             if (!/^[6-9]\d{9}$/.test(phone)) {
//                 return res
//                     .status(400)
//                     .json({ success: false, message: "Invalid Phone number!" });
//             }
//             if (phone !== salesAccount.phone) {
//                 newData.phone = phone;
//             }
//         }

//         if (Object.keys(newData).length === 0) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "No Changes provided!" });
//         }

//         await GaloSales.findByIdAndUpdate(salesId, { $set: newData });
//         return res
//             .status(200)
//             .json({ success: true, message: "Account Updated." });
//     } catch (er) {
//         if (er?.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: "Email or phone already exist",
//             });
//         }
//         return res.status(500).json({ success: false, message: er?.message });
//     }
// };

// const getGaloSalesPersonList = async (req, res) => {
//     try {
//         let { pageNo } = req.query;
//         const limit = 6;

//         pageNo = parseInt(pageNo) || 1;

//         const sales = await GaloSales.aggregate([
//             {
//                 $facet: {
//                     totalRecord: [{ $count: "count" }],

//                     data: [
//                         { $sort: { _id: -1 } },
//                         { $skip: (pageNo - 1) * limit },
//                         { $limit: limit },

//                         {
//                             $lookup: {
//                                 from: "galosalespanels",
//                                 localField: "_id",
//                                 foreignField: "salesId",
//                                 as: "totalClient",
//                             },
//                         },

//                         {
//                             $addFields: {
//                                 totalClient: {
//                                     $size: {
//                                         $ifNull: ["$totalClient", []],
//                                     },
//                                 },
//                             },
//                         },

//                         {
//                             $project: {
//                                 password: 0,
//                             },
//                         },
//                     ],
//                 },
//             },

//             {
//                 $project: {
//                     data: 1,
//                     totalRecord: {
//                         $ifNull: [
//                             { $arrayElemAt: ["$totalRecord.count", 0] },
//                             0,
//                         ],
//                     },
//                 },
//             },

//             {
//                 $addFields: {
//                     currentPage: pageNo,
//                     limit,
//                     hasNextPage: {
//                         $gt: ["$totalRecord", pageNo * limit],
//                     },
//                 },
//             },
//         ]);

//         return res.status(200).json({ success: true, ...sales[0] });
//     } catch (er) {
//         return res.status(500).json({ success: false, message: er?.message });
//     }
// };

// const toggleGaloSalesStatus = async (req, res) => {
//     try {
//         const { salesId, isActive } = req.body;

//         if (!mongoose.isValidObjectId(salesId))
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid or missing Id" });

//         if (typeof isActive !== "boolean") {
//             return res.status(400).json({
//                 success: false,
//                 message: "isActive must be true or false",
//             });
//         }

//         const sales = await GaloSales.findOneAndUpdate(
//             { _id: salesId },
//             { $set: { isActive } },
//             { new: true },
//         );

//         if (!sales) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Sales person not found",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: `Account ${isActive === true ? "Activated" : "De-Activated"}`,
//         });
//     } catch (er) {
//         return res.status(500).json({ success: false, message: er?.message });
//     }
// };

// module.exports = {
//     createGaloSalesPerson,
//     updateGaloSalesAccount,
//     getGaloSalesPersonList,
//     toggleGaloSalesStatus,
// };

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// ------------------------------------------------
// Galo Models
// ------------------------------------------------
const GaloPanel = require("../../../Models/Galo/GaloAdminModels/GaloPannelTypeSchema");
const GaloTechnology = require("../../../Models/Galo/GaloAdminModels/GaloPannelTechnologySchema");
const GaloConstructive = require("../../../Models/Galo/GaloAdminModels/GaloConstructiveSchema");
const GaloAdmin = require("../../../Models/Galo/GaloAdminModels/GaloAdminSchema");
const GaloPanelWatt = require("../../../Models/Galo/GaloAdminModels/GaloPannelWattSchema");
const GaloInverter = require("../../../Models/Galo/GaloAdminModels/GaloInverterSchema");

// Sales models (kept – not dealer/inverter)
const GaloSales = require("../../../Models/Galo/GaloSalesModal/galosales.schema");

// ------------------------------------------------
// 1. PANEL CRUD
// ------------------------------------------------
const createPanel = async (req, res) => {
    try {
        let { panelType } = req.body;

        if (!panelType) {
            return res.status(400).json({
                success: false,
                message: "Panel Type Data is required..",
            });
        }

        if (panelType && typeof panelType !== "string") {
            return res.status(400).json({
                success: false,
                message: "Panel type should be string",
            });
        }

        panelType = panelType?.trim().toUpperCase();

        const existingPannel = await GaloPanel.findOne({ panelType });

        if (existingPannel) {
            return res.status(409).json({
                success: false,
                message: "Panel already Exits..Try with different Name!!",
            });
        }

        await GaloPanel.create({ panelType });
        return res.status(201).json({
            success: true,
            message: "Panel is created sucessfully..",
        });
    } catch (er) {
        console.log(er);
        res.status(500).json({
            success: false,
            message:
                "Internal Server Error, Couldn't add Panel Type.." ||
                er?.message,
        });
    }
};

const getPanel = async (req, res) => {
    try {
        const { isActive } = req.query;
        let panelData;
        if (!isActive) {
            panelData = await GaloPanel.find();
        } else {
            panelData = await GaloPanel.find({ panelActive: isActive });
        }
        return res.status(200).json({
            success: true,
            data: panelData,
        });
    } catch (er) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error.." || er?.message,
        });
    }
};

const updatePanel = async (req, res) => {
    try {
        let { _id, panelType } = req.body;

        panelType = panelType?.trim().toUpperCase();

        if (!mongoose.Types.ObjectId.isValid(_id))
            return res
                .status(400)
                .json({ success: false, message: "You did something with Id" });

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Id must be required...",
            });
        }
        if (!panelType) {
            return res.status(400).json({
                success: false,
                message: "Panel Type Required",
            });
        }

        const findPanel = await GaloPanel.findById({ _id: _id });
        if (!findPanel) {
            return res.status(400).json({
                success: false,
                message: "Panel not found ",
            });
        }

        if (findPanel?.panelType === panelType) {
            return res.status(409).json({
                success: false,
                message:
                    "This name panel is already exits you can not update the panel with same name , Try with different name ",
            });
        }

        // Efficient duplicate check (exclude current)
        const existingDuplicate = await GaloPanel.findOne({
            panelType,
            _id: { $ne: _id },
        });
        if (existingDuplicate) {
            return res.status(409).json({
                success: false,
                message:
                    "This panel name is already exist , Try with New Name..",
            });
        }

        const updateData = await GaloPanel.findByIdAndUpdate(
            _id,
            { _id, panelType },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "Panel Update Successfully..",
            data: updateData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error.." || error?.message,
        });
    }
};

const togglePanel = async (req, res) => {
    try {
        const { id, panelActive } = req.body;

        if (typeof panelActive === "string")
            return res.status(400).json({
                success: false,
                message: "panelActive should be boolean but getting string",
            });

        if (typeof id !== "string")
            return res.status(400).json({
                success: false,
                message: "Panel Id should be string",
            });

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Panel Id  is required.. ",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id))
            return res
                .status(400)
                .json({ success: false, message: "Panel id is not valid" });

        const findPanel = await GaloPanel.findById(id);
        if (!findPanel) {
            return res.status(400).json({
                success: false,
                message: "Panel is not find ,try with correct panel Id..",
            });
        }

        const updateData = await GaloPanel.findByIdAndUpdate(
            id,
            { $set: { panelActive } },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: `${panelActive === true ? "Panel is Active" : "Panel is Disable"}`,
            data: updateData,
        });
    } catch (error) {
        console.log("error : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server Error...",
        });
    }
};

// ------------------------------------------------
// 2. TECHNOLOGY CRUD
// ------------------------------------------------
const createTechnology = async (req, res) => {
    try {
        let { panelId, technologyPanel } = req.body;

        if (typeof technologyPanel !== "string" || typeof panelId !== "string")
            return res.status(400).json({
                success: false,
                message: "Technology should be String!!",
            });

        if (!panelId.trim() || !technologyPanel.trim()) {
            return res.status(400).json({
                success: false,
                message: "Panel Id and technology panel not be empty...",
            });
        }

        panelId = panelId.trim();
        if (!mongoose.Types.ObjectId.isValid(panelId))
            return res
                .status(400)
                .json({ success: false, message: "You did something with Id" });

        technologyPanel = technologyPanel?.trim().toUpperCase();

        const panelExits = await GaloPanel.findById(panelId);
        if (!panelExits) {
            return res.status(400).json({
                success: false,
                message: "Panel is not found.Try with correct panel Id",
            });
        }

        const isExisting = await GaloTechnology.findOne({
            panelId: new mongoose.Types.ObjectId(panelId),
            technologyPanel,
        });

        if (isExisting) {
            return res.status(400).json({
                success: false,
                message: " This Technology is already register...",
            });
        }

        await GaloTechnology.create({
            panelId: panelId,
            technologyPanel,
        });

        return res.status(201).json({
            success: true,
            message: "Panel technology is created successfully...",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error..." || error?.message,
        });
    }
};

const getTechnology = async (req, res) => {
    try {
        let { panelId, isActive } = req?.query;

        if (!panelId.trim())
            return res
                .status(400)
                .json({ success: false, message: "Panel id Not found" });

        panelId = panelId.trim();
        if (!mongoose.Types.ObjectId.isValid(panelId))
            return res.status(400).json({
                success: false,
                message: "Panel id is not valid at all",
            });

        const isExits = await GaloPanel.findOne({ _id: panelId });
        if (!isExits) {
            return res.status(404).json({
                success: false,
                message: "Panel Id is not found try with another panel Id..",
            });
        }

        let data;
        if (!isActive) {
            data = await GaloTechnology.find({ panelId });
        } else {
            data = await GaloTechnology.find({ panelId, isActive });
        }
        return res.status(200).json({
            success: true,
            message: "Data fetch successfully..",
            data: data,
        });
    } catch (error) {
        console.log("error", error?.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error...",
        });
    }
};

const updateTechnology = async (req, res) => {
    try {
        let { _id, panelId, technologyPanel } = req.body;

        if (typeof _id !== "string" || typeof technologyPanel !== "string") {
            return res.status(400).json({
                success: false,
                message: "Panel ID and technology must be string",
            });
        }

        if (!_id.trim() || !technologyPanel.trim())
            return res.status(400).json({
                success: false,
                message: "panel id and technology panel cannot be empty",
            });

        _id = _id.trim();
        technologyPanel = technologyPanel?.trim().toUpperCase();

        if (!mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                success: false,
                message: "Technology id is not valid",
            });

        const existingData = await GaloTechnology.findOne({ _id });
        if (!existingData) {
            return res.status(400).json({
                success: false,
                message: "Technology not found..",
            });
        }

        if (technologyPanel === existingData?.technologyPanel) {
            return res.status(409).json({
                success: false,
                message:
                    "You are trying to update same technology name , if you are updating try with new name...",
            });
        }

        // Check duplicate (exclude current)
        const allData = await GaloTechnology.findOne({
            panelId,
            technologyPanel,
        });
        if (allData && allData._id.toString() !== _id) {
            return res.status(409).json({
                success: false,
                message: "Technology already exists for this panel",
            });
        }

        const updateData = await GaloTechnology.findByIdAndUpdate(
            { _id },
            { technologyPanel },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "Data is update successfully",
            updateData: updateData,
        });
    } catch (error) {
        console.log("error : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error..." || error?.message,
        });
    }
};

const activeDisableTech = async (req, res) => {
    try {
        const { id, panelId, isActive } = req.body;

        if (typeof isActive === "string")
            return res.status(400).json({
                success: false,
                message: "isActive should be boolean but getting string",
            });

        if (typeof panelId !== "string" || typeof id !== "string")
            return res.status(400).json({
                success: false,
                message: "Panel Id and technology id should be string",
            });

        if (!id || !panelId) {
            return res.status(400).json({
                success: false,
                message: "Panel Id & Technology Id is required.. ",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({
                success: false,
                message: "Technology id is not valid",
            });
        if (!mongoose.Types.ObjectId.isValid(panelId))
            return res
                .status(400)
                .json({ success: false, message: "Panel id is not valid" });

        const findPanel = await GaloPanel.findById({ _id: panelId });
        if (!findPanel) {
            return res.status(400).json({
                success: false,
                message: "Panel is not find ,try with correct panel Id..",
            });
        }
        const findTech = await GaloTechnology.findById({ _id: id });
        if (!findTech) {
            return res.status(400).json({
                success: false,
                message: "Technology not found..",
            });
        }

        const updateData = await GaloTechnology.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: `${isActive === true ? "Technology is Active" : "Technology is Disable"}`,
            data: updateData,
        });
    } catch (error) {
        console.log("error : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server Error...",
        });
    }
};

// ------------------------------------------------
// 3. CONSTRUCTIVE CRUD
// ------------------------------------------------
const createConstructive = async (req, res) => {
    try {
        let { panelId, technologyId, constructiveType } = req.body;

        if (
            typeof panelId !== "string" ||
            typeof technologyId !== "string" ||
            typeof constructiveType !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "PanelId ,technologyId and constructiveType should be string",
            });
        }

        if (!panelId || !technologyId || !constructiveType) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required (panelId, technologyId, constructiveType)",
            });
        }
        constructiveType = constructiveType.trim().toUpperCase();

        const panelExits = await GaloPanel.findOne({ _id: panelId });
        const technologyExits = await GaloTechnology.findOne({
            _id: technologyId,
        });
        const isExits = await GaloConstructive.findOne({
            technologyId,
            constructiveType,
        });

        if (!panelExits) {
            return res.status(404).json({
                success: false,
                message: "Panel Id is not exits, try with correct panel Id",
            });
        }

        if (!technologyExits) {
            return res.status(404).json({
                success: false,
                message:
                    "Technology Id is not exits, try with correct technology Id",
            });
        }

        if (isExits) {
            return res.status(409).json({
                success: false,
                message:
                    "Constructive Type is already exits,Try with different type..",
            });
        }

        const createConstructive = await GaloConstructive.create({
            panelId,
            technologyId,
            constructiveType,
        });
        return res.status(201).json({
            success: true,
            message: "Constructive is Created successfully..",
            data: createConstructive,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error..",
        });
    }
};

const getConstructive = async (req, res) => {
    const { technologyId, isActive } = req.query;

    try {
        const isExits = await GaloTechnology.findOne({ _id: technologyId });
        if (isExits === null) {
            return res.status(404).json({
                success: false,
                message:
                    "Technology is not find try with correct technology Id",
            });
        }
        let data;
        if (!isActive) {
            data = await GaloConstructive.find({ technologyId });
        } else {
            data = await GaloConstructive.find({ technologyId, isActive });
        }
        return res.status(200).json({
            success: true,
            message: "Data fetch Successfully..",
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error..",
        });
    }
};

const updateConstructive = async (req, res) => {
    let { id, panelId, technologyId, constructiveType } = req.body;
    constructiveType = constructiveType.trim().toUpperCase();

    try {
        if (!id || !panelId || !technologyId || !constructiveType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required...",
            });
        }

        const findPanel = await GaloPanel.findById({ _id: panelId });
        if (!findPanel) {
            return res.status(404).json({
                success: false,
                message: "Panel is not find try with correct panel id..",
            });
        }

        const findTechnology = await GaloTechnology.findById({
            _id: technologyId,
        });
        if (!findTechnology) {
            return res.status(404).json({
                success: false,
                message:
                    "Technology is not find try with correct technology id..",
            });
        }

        const findConstructive = await GaloConstructive.findById({ _id: id });
        if (!findConstructive) {
            return res.status(404).json({
                success: false,
                message:
                    "Constructive is not find try with correct constructive id..",
            });
        }

        // Efficient duplicate check (exclude current)
        const existingDuplicate = await GaloConstructive.findOne({
            panelId,
            technologyId,
            constructiveType,
            _id: { $ne: id },
        });
        if (existingDuplicate) {
            return res.status(400).json({
                success: false,
                message:
                    "This name constructive is already exits , you can not update with same name,Try with different name",
            });
        }

        const updateData = await GaloConstructive.findByIdAndUpdate(
            { _id: id },
            { $set: { _id: id, panelId, technologyId, constructiveType } },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "Update sucessfully",
            updatedData: updateData,
        });
    } catch (error) {
        console.log("error : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error..",
        });
    }
};

const activeDisableConst = async (req, res) => {
    const { id, panelId, technologyId, isActive } = req.body;
    try {
        if (!id || !panelId || !technologyId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required(id,panelId,technology)..",
            });
        }
        const findPanel = await GaloPanel.findById({ _id: panelId });
        if (!findPanel) {
            return res.status(400).json({
                success: false,
                message: "Panel is not find ,try with correct panel Id..",
            });
        }
        const findTech = await GaloTechnology.findById({ _id: technologyId });
        if (!findTech) {
            return res.status(400).json({
                success: false,
                message:
                    "Technology is not find ,try with correct technology Id..",
            });
        }
        const findConstrutive = await GaloConstructive.findById({ _id: id });
        if (!findConstrutive) {
            return res.status(400).json({
                success: false,
                message:
                    "Construtive is not find ,try with correct Construtive Id..",
            });
        }

        const data = await GaloConstructive.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true },
        );
        return res.status(200).json({
            success: true,
            message: `${isActive ? "Construvtive is Active" : "Constructive is Disable"}`,
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server Error...",
        });
    }
};

// ------------------------------------------------
// 4. PANEL WATT CRUD
// ------------------------------------------------
const panelWatt = async (req, res) => {
    try {
        const { panelId, technologyId, constructiveId, watt } = req.body;

        if (!panelId || !technologyId || !constructiveId) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required(panelId,technologId,constructiveId)",
            });
        }

        if (
            watt === undefined ||
            watt === null ||
            typeof watt !== "number" ||
            isNaN(watt) ||
            watt <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Watt must be a positive number.",
            });
        }

        if (
            typeof panelId !== "string" ||
            typeof technologyId !== "string" ||
            typeof constructiveId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invaild format of panelId,technologId,constructiveId.",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(panelId) ||
            !mongoose.Types.ObjectId.isValid(technologyId) ||
            !mongoose.Types.ObjectId.isValid(constructiveId)
        ) {
            return res.status(400).json({
                success: false,
                message: "You did something with Id",
            });
        }

        const panelExits = await GaloPanel.findById(panelId);
        const technologExit = await GaloTechnology.findById(technologyId);
        const constructiveExit =
            await GaloConstructive.findById(constructiveId);

        if (!panelExits || !technologExit || !constructiveExit) {
            return res.status(404).json({
                success: false,
                message:
                    "Oops! We couldn’t find the panel you’re trying to create watts for.",
            });
        }

        // Check duplicate for full combination
        const isExits = await GaloPanelWatt.findOne({
            panelId,
            technologyId,
            constructiveId,
            watt,
        });
        if (isExits) {
            return res.status(409).json({
                success: false,
                message: "This watt of panel is already exits..",
            });
        }

        await GaloPanelWatt.create({
            panelId,
            technologyId,
            constructiveId,
            watt,
        });

        return res.status(201).json({
            success: true,
            message: "Panel Watt Create Successfully..",
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error...",
        });
    }
};

const getPanelWatt = async (req, res) => {
    try {
        const { constructiveId, isActive } = req.query;
        if (
            !constructiveId ||
            !mongoose.Types.ObjectId.isValid(constructiveId) ||
            typeof constructiveId !== "string"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Constructive Id must be required..|| Invaild Constructive Id",
            });
        }
        let getData;
        if (!isActive) {
            getData = await GaloPanelWatt.find({ constructiveId });
        } else {
            getData = await GaloPanelWatt.find({ constructiveId, isActive });
        }

        return res.status(200).json({
            success: true,
            data: getData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error..",
        });
    }
};

const togglePanelWatt = async (req, res) => {
    try {
        const { constructiveId, _id, isActive } = req.query;
        if (!constructiveId || !_id) {
            return res.status(404).json({
                success: false,
                message: "Constructive Id and panel Watt _id is required..",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(_id) ||
            !mongoose.Types.ObjectId.isValid(constructiveId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid constructive Id and panel watt _id..",
            });
        }

        const panelWattExits = await GaloPanelWatt.findOne({ _id });
        const constructiveExits = await GaloPanelWatt.findOne({
            constructiveId,
        });

        if (!constructiveExits) {
            return res.status(404).json({
                success: false,
                message:
                    "Constructive ID not found. Please provide a valid Constructive ID and try again.",
            });
        }

        if (!panelWattExits) {
            return res.status(404).json({
                success: false,
                message:
                    "Panel watt not found. Please provide a valid panel watt ID and try again.",
            });
        }

        if (panelWattExits?.isActive.toString() === isActive) {
            return res.status(409).json({
                success: false,
                message: `Your panel watt is already ${isActive === "true" ? "Active" : "InActive"}`,
            });
        }

        const tooglePanel = await GaloPanelWatt.findByIdAndUpdate(
            { _id },
            { $set: { isActive } },
            { new: true },
        );
        return res.status(200).json({
            success: true,
            message: `Panel watt ${isActive == "true" ? "activated" : "deactivated"} successfully.`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server Error...",
        });
    }
};

const updatePanelWatt = async (req, res) => {
    let { id, watt, constructiveId } = req.body;
    watt = Number(watt);
    try {
        if (!id || !watt) {
            return res.status(404).json({
                success: false,
                message: "Panel watt Required..",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id) || typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message:
                    "Panel watt Id must be required..|| Invaild Panel Watt Id",
            });
        }

        const isExisting = await GaloPanelWatt.findById(id);
        if (!isExisting) {
            return res.status(400).json({
                success: false,
                message:
                    "The panel you’re trying to update was not found. Please reload the page and try again.",
            });
        }

        const duplicate = await GaloPanelWatt.findOne({
            constructiveId,
            watt,
            _id: { $ne: id },
        });
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "This watt already exists for this Panel Watt",
            });
        }

        let imgWatt;
        // ONLY if new images uploaded
        if (req.files?.length) {
            // DELETE OLD FILES
            isExisting?.imgWatt?.forEach((img) => {
                const filePath = path.join(
                    __dirname,
                    "../../Proposal_Images/watt",
                    img,
                );
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });

            // ORDER NEW FILES
            const orders = req.body.imgOrder;
            imgWatt = req.files
                .map((file, i) => ({
                    name: file.filename,
                    order: Array.isArray(orders)
                        ? Number(orders[i])
                        : Number(orders),
                }))
                .sort((a, b) => b.order - a.order)
                .map((i) => i.name);
        }
        const update = { watt };
        if (imgWatt) update.imgWatt = imgWatt;

        await GaloPanelWatt.findByIdAndUpdate(id, update);

        return res.json({
            success: true,
            message: "Panel watt updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Internal server error..",
        });
    }
};

// ------------------------------------------------
// 5. ADMIN AUTH & MANAGEMENT
// ------------------------------------------------
const createAdmin = async (req, res) => {
    try {
        let { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required..",
            });
        }

        email = email?.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be 6 words long",
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invaild email format..",
            });
        }

        const admin = await GaloAdmin.findOne({ email }).lean();
        if (admin) {
            return res.status(409).json({
                success: false,
                message: "Admin already exists",
            });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const adminData = await GaloAdmin.create({
            email,
            password: hashPass,
            role,
        });

        adminData.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Admin created successfully...",
            data: adminData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Internal Server Error..",
        });
    }
};

const createSuperAdmin = async (req, res) => {
    // Same as createAdmin
    try {
        let { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required..",
            });
        }
        email = email?.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be 6 words long",
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invaild email format..",
            });
        }

        const admin = await GaloAdmin.findOne({ email }).lean();
        if (admin) {
            return res.status(409).json({
                success: false,
                message: "Admin already exists",
            });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const adminData = await GaloAdmin.create({
            email,
            password: hashPass,
            role,
        });

        adminData.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Admin created successfully...",
            data: adminData,
        });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const toggleAdmin = async (req, res) => {
    try {
        let { adminId, isActive } = req.body;

        if (!mongoose.isValidObjectId(adminId))
            return res
                .status(400)
                .json({ success: false, message: "Invalid AdminId" });

        if (typeof isActive === "string") {
            const value = isActive.trim().toLowerCase();
            if (value === "true") isActive = true;
            else if (value === "false") isActive = false;
            else {
                return res.status(400).json({
                    success: false,
                    message:
                        "'isActive' must be a boolean value (true or false).",
                });
            }
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "'isActive' must be a boolean value (true or false).",
            });
        }

        const updatedAdmin = await GaloAdmin.findByIdAndUpdate(
            adminId,
            { $set: { isActive } },
            { new: true, runValidators: true },
        );

        if (!updatedAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Account ${isActive ? "Activated" : "De-Activated"} successfully`,
        });
    } catch (er) {
        return res.status(500).json({ success: false, message: er?.message });
    }
};

const getAdmin = async (req, res) => {
    try {
        const allData = await GaloAdmin.find()
            .select("-password")
            .sort({ role: -1 })
            .lean();
        return res.status(200).json({
            success: true,
            data: allData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Internal server error..",
        });
    }
};

const loginAdmin = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required..",
            });
        }

        email = email?.toLowerCase().trim();
        password = String(password);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invaild email format..",
            });
        }

        const admin = await GaloAdmin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!admin.isActive) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is currently inactive. Please contact the super admin to activate your account.",
            });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                adminId: admin._id,
                email: admin.email,
                role: admin.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie("role", admin?.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        let data = {
            adminId: admin._id,
            email: admin.email,
            role: admin.role,
        };

        return res.status(200).json({
            success: true,
            message: "Admin Login successfully..",
            token,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error...",
        });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.clearCookie("role", {
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server Error...",
        });
    }
};

// ------------------------------------------------
// 6. SALES PERSON CRUD (kept)
// ------------------------------------------------
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

// ------------------------------------------------
// 7. INVERTER  CRUD
// ------------------------------------------------

const createInverter = async (req, res) => {
    try {
        const { inverterCapacity } = req.body;

        const normalizedCap = normalizeString(inverterCapacity);

        const alreadyExists = await GaloInverter.findOne({
            inverterCapacity: normalizedCap,
        });
        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message:
                    "Inverter capacity already exists, please use a different capacity.",
            });
        }
        const inverter = await GaloInverter.create({
            inverterCapacity: normalizedCap,
        });

        return res.status(201).json({
            success: true,
            message: "Inverter created successfully",
            data: inverter,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getInverter = async (req, res) => {
    try {
        const inverters = await GaloInverter.find().sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            data: inverters,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// const updateInverter = async (req, res) => {
//     try {
//         const { id, inverterCapacity } = req.body;
//         const normalizedCap = normalizeString(inverterCapacity);

//         const inverter = await GaloInverter.findByIdAndUpdate(
//             id,
//             { inverterCapacity: normalizedCap },
//             { new: true },
//         );

//         if (!inverter) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Inverter not found",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Inverter updated successfully",
//             data: inverter,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

const updateInverter = async (req, res) => {
    try {
        const { id, inverterCapacity } = req.body;
        const normalizedCap = normalizeString(inverterCapacity);

        const existing = await GaloInverter.findOne({
            inverterCapacity: normalizedCap,
            _id: { $ne: id }, // Ignore the current document
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Inverter capacity already exists",
            });
        }

        const inverter = await GaloInverter.findByIdAndUpdate(
            id,
            { inverterCapacity: normalizedCap },
            { new: true },
        );

        if (!inverter) {
            return res.status(404).json({
                success: false,
                message: "Inverter not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inverter updated successfully",
            data: inverter,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const toggleInverter = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Inverter ID is required",
            });
        }
        const inverter = await GaloInverter.findById(id);

        if (!inverter) {
            return res.status(404).json({
                success: false,
                message: "Inverter not found",
            });
        }

        inverter.isActive = !inverter.isActive;

        await inverter.save();

        return res.status(200).json({
            success: true,
            message: "Inverter toggled successfully",
            data: inverter,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//util
const normalizeString = (str) => {
    return String(str).trim().toUpperCase();
};

// ------------------------------------------------
// EXPORT (only the functions kept)
// ------------------------------------------------
module.exports = {
    // Panel
    createPanel,
    getPanel,
    updatePanel,
    togglePanel,

    // Technology
    createTechnology,
    getTechnology,
    updateTechnology,
    activeDisableTech,

    // Constructive
    createConstructive,
    getConstructive,
    updateConstructive,
    activeDisableConst,

    // Panel Watt
    panelWatt,
    getPanelWatt,
    togglePanelWatt,
    updatePanelWatt,

    // Admin Auth
    createAdmin,
    createSuperAdmin,
    toggleAdmin,
    getAdmin,
    loginAdmin,
    logoutAdmin,

    // Sales Person
    createGaloSalesPerson,
    updateGaloSalesAccount,
    getGaloSalesPersonList,
    toggleGaloSalesStatus,

    // Inverter
    createInverter,
    getInverter,
    updateInverter,
    toggleInverter,
};
