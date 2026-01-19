const Panel = require("../../Models/AdminModel/pannelTypeSchema")
const Technology = require("../../Models/AdminModel/panneTechnologySchema")
const Constructive = require("../../Models/AdminModel/constructiveSchema")

const createPanel = async (req, res) => {
    try {
        const { panelType } = req.body;

        // console.log("panelType", panelType)

        if (!panelType) {
            return res.status(404).json({
                success: false,
                message: "Panel Type Data is required.."
            })
        }

        panelType = panelType?.trim().replace(/\s+/g, "").toUpperCase()

        const existingPannel = await Panel.findOne({ panelType })
        // console.log("existingPannel : ", existingPannel)
        if (existingPannel) {
            return res.status(409).json({
                success: false,
                message: "Panel already Exits..",

            })
        }
        if (panelType) {
            const panel = await Panel.create({
                panelType
            })
            return res.status(201).json({
                success: true,
                message: "Panel is created sucessfully..",
                data: panel
            })
        }
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error, Couldn't add Panel Type.."
        })

    }

}

const getPanel = async (req, res) => {
    try {
        const panelData = await Panel.find();
        //  console.log("panelData",panelData)
        return res.status(200).json({
            success: true,
            data: panelData
        })

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error.."
        })

    }
}

const updatePanel = async (req, res) => {
    const { _id, panelType, panelActive } = req.query;
    panelType = panelType?.trim().replace(/\s+/g, "").toUpperCase()

    //  console.log("_id : ",_id)

    // console.log("panelActive : ", panelActive)

    // console.log("_id panelType", id, panelType)
    try {

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Id must be required..."
            })
        }

        const findPanel = await Panel.findById({ _id: _id });
        // console.log("pannelData ", findPanel)
        if (!findPanel ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid Panel Id , "
            })
        }

        if (!panelType  || panelType.length < 1) {
            return res.status(400).json({
                success: false,
                message: "Panel Type not be null"
            })
        }


        // console.log("findPanel?.panelActive == panelActive : ", findPanel?.panelActive.toString() === panelActive.toString())
        // console.log("panelActive : ", typeof (panelActive));


        if (findPanel?.panelActive.toString() === panelActive?.toString()) {
            return res.status(400).json({
                success: false,
                message: `${(panelActive.toString() == "true") ? "Panel is Already Active" : "Panel is already disable"} `
            })
        }

        // console.log("...req?.body : ",{ ...req?.query})
        const updateData = await Panel.findByIdAndUpdate({ _id: _id }, { ...req?.query }, { new: true })
        // console.log("updateData : ", updateData)

        return res.status(200).json({
            success: true,
            message: "Panel Update Successfully..",
            data: updateData
        })

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error.."
        })
    }
}

const createTechnology = async (req, res) => {
    let { panelId, technologyPanel } = req.body;

    // console.log("PanelId,technologyPanel : ", panelId, technologyPanel)
    try {

        if (!panelId || !technologyPanel ) {
            return res.status(400).json({
                success: false,
                message: "Panel Id and technology of panel not be empty..."
            })
        }

        if (technologyPanel?.length === 0 || panelId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Panel Id and technology of panel not be empty..."
            })
        }


        // const panelData = await Panel.findOne({ _id: panelId });
        // console.log("panelData : ", panelData)

        technologyPanel = technologyPanel?.trim().replace(/\s+/g, "").toUpperCase()

        const isExiting = await Technology.findOne({ panelId, technologyPanel });
        // console.log("data", isExiting);

        if (isExiting?.technologyPanel === technologyPanel) {
            return res.status(400).json({
                success: false,
                message: " This Technology is already register..."
            })
        }

        const technologyData = await Technology.create({ panelId: panelId, technologyPanel })
        // console.log("technology data : ", technologyData)

        return res.status(201).json({
            success: true,
            message: "Panel technology is created successfully..."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error..."
        })

    }


}

const getTechnology = async (req, res) => {
    const { panelId } = req?.query;
    try {

        const isExits = await Panel.findOne({ _id: panelId })
        if (!isExits) {
            return res.status(404).json({
                success: false,
                message: "Panel Id is not found try with another panel Id.."
            })
        }
        const data = await Technology.find({ panelId });
        return res.status(200).json({
            success: true,
            message: "Data fetch successfully..",
            data: data
        })

    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error..."
        })
    }
}

const updateTechnology = async (req, res) => {
    let { _id, panelId, technologyPanel, isActive } = req.body;
    // console.log("_id, technologyPanel, isActive ", _id, technologyPanel, isActive);
    technologyPanel = technologyPanel?.trim().replace(/\s+/g, "").toUpperCase()

    try {
        if (!_id || !technologyPanel) {
            return res.status(400).json({
                success: false,
                message: "Panel ID and technology is not be empty"
            })
        }
        if (_id?.length === 0 || technologyPanel?.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Panel ID and technology is not be empty"
            })
        }

        const exitingData = await Technology.findOne({ _id });
        // console.log("IsExiting data : ", exitingData)

         if(!exitingData){
            return res.status(400).json({
                success:false,
                message:"Technology is not found.."
            })
         }

        if (technologyPanel === exitingData?.technologyPanel) {
            return res.status(409).json({
                success: false,
                message: "You are try to update with same technology name , if you are update try with new name..."
            })
        }


        const allData = await Technology.findOne({ panelId, technologyPanel });
        console.log("allData", allData);

        // if (!allData) return res.status(409).json({ success: false, message: "Cannot Update Same Name" });

        if (!allData) {
            const updateData = await Technology.findByIdAndUpdate({ _id }, { technologyPanel, isActive }, { new: true })

            return res.status(200).json({
                success: true,
                message: "Data is update successfully",
                updateData: updateData
            })

        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error..."
        })
    }
}

const createConstructive = async (req, res) => {
    let { panelId, technologyId, constructiveType } = req.body;
    // console.log("panel id : ", panelId)

    // console.log("panelId, technologyId, constructiveType", panelId, technologyId, constructiveType);
    try {
        if (!panelId || !technologyId  || !constructiveType ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (panelId, technologyId, constructiveType)"

            })
        }

        if (panelId?.length === 0 || technologyId?.length === 0 || constructiveType?.length === 0) {
            return res.status(400).json({
                success: false,
                message: "All fields are reqquired (panelId, technologyId, constructiveType)"
            })
        }
        constructiveType = constructiveType.trim().replace(/\s+/g, "").toUpperCase();
        const panelExits = await Panel.findOne({ _id: panelId });
        const technologyExits = await Technology.findOne({ _id: technologyId });
        const isExits = await Constructive.findOne({ constructiveType });

        // console.log("technology",technologyExits);
        // console.log("panel ",panelExits);
        console.log("Constructive ", isExits);

        if (!panelExits ) {
            return res.status(404).json({
                success: false,
                message: "Panel Id is not exits, try with correct panel Id"
            })
        }

        if (!technologyExits ) {
            return res.status(404).json({
                success: false,
                message: "Technology Id is not exits, try with correct technology Id"
            })
        }

        if (isExits ) {
            return res.status(409).json({
                success: false,
                message: "Constructive Type is already exits,Try with different type.."
            })
        }


        // console.log("constructiveType : ", constructiveType)
        // console.log("constructiveType : ", constructiveType.length)

        const createConstructive = await Constructive.create({ panelId, technologyId, constructiveType });
        return res.status(201).json({
            success: true,
            message: "Constructive is Created successfully..",
            data: createConstructive
        })

    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.."
        })
    }

}

const getConstructive = async (req, res) => {
    const { technologyId } = req.query;
    // console.log("technologyId : ", technologyId);

    try {
        // const isExits = await Technology.findOne({ _id: technologyId });
        const isExits = await Technology.findOne({ _id: technologyId });

        if (isExits === null) {
            return res.status(404).json({
                success: false,
                message: "Technology is not find try with correct technology Id",
            })
        }
        const data = await Constructive.find({ technologyId });
        return res.status(200).json({
            success: true,
            message: "Data fetch Successfully..",
            data: data
        })

    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.."
        })

    }


}

const updateConstructive = async (req, res) => {
    const { id, panelId, technologyId, constructiveType, isActive } = req.body;
    // console.log(id, panelId, technologyId, constructiveType);
    // console.log(req.body);

    try {
        if (!id || !panelId  || !technologyId  || !constructiveType ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required..."
            })
        }

        



        return res.status(false).json({
            success: false,
            message: "Update sucessfully"
        })

    } catch (error) {
        console.log("error : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.."
        })
    }
}


module.exports = {
    createPanel,
    getPanel,
    updatePanel,
    createTechnology,
    getTechnology,
    updateTechnology,
    createConstructive,
    getConstructive,
    updateConstructive
}
