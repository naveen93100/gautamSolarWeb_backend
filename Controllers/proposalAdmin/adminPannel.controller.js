const Panel = require("../../Models/AdminModel/pannelTypeSchema")
const Technology = require("../../Models/AdminModel/panneTechnologySchema")

const createPanel = async (req, res) => {
    try {
        const { panelType } = req.body;

        // console.log("panelType", panelType)

        if (panelType === undefined) {
            return res.status(404).json({
                success: false,
                message: "Panel Type Data is required.."
            })
        }

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

    //  console.log("_id : ",_id)

    // console.log("panelActive : ", panelActive)

    // console.log("_id panelType", id, panelType)
    try {

        if (_id === undefined) {
            return res.status(400).json({
                success: false,
                message: "Id must be required..."
            })
        }

        const findPanel = await Panel.findById({ _id: _id });
        // console.log("pannelData ", findPanel)
        if (findPanel === null) {
            return res.status(400).json({
                success: false,
                message: "Enter valid Panel Id , "
            })
        }

        if (panelType == null || panelType.length < 1) {
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

        if (panelId === undefined && technologyPanel === undefined) {
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

        technologyPanel = technologyPanel?.toUpperCase()

        const isExiting = await Technology.findOne({ panelId, technologyPanel });
        // console.log("data", isExiting);

        if (isExiting?.technologyPanel === technologyPanel) {
            return res.status(400).json({
                success: false,
                message: " This Technology is already register..."
            })
        }

        const technologyData = await Technology.create({ panelId: panelId, technologyPanel: technologyPanel.replace(/\s+/g, "").toUpperCase() })
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
    const { _id, panelId, technologyPanel, isActive } = req.body;
    // console.log("_id, technologyPanel, isActive ", _id, technologyPanel, isActive);

    try {
        if (_id === undefined && technologyPanel === undefined) {
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

        const exitingData = await Technology.findOne({ _id: _id });
        // console.log("IsExiting data : ", exitingData)

        if (technologyPanel === exitingData?.technologyPanel) {
            return res.status(409).json({
                success: false,
                message: "You are try to update with same technology name , if you are update try with new name..."
            })
        }


        const allData = await Technology.findOne({ panelId, technologyPanel });
        // console.log("allData", allData);

        if (allData) return res.status(409).json({ success: false, message: "Cannot Update Same Name" });

        if (allData === null) {
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







module.exports = {
    createPanel,
    getPanel,
    updatePanel,
    createTechnology,
    getTechnology,
    updateTechnology
}
