const Panel = require("../../Models/AdminModel/pannelTypeSchema")


const createPanel = async (req, res) => {
    try {
        const { panelType } = req.body;

        console.log("panelType", panelType)

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
    const { id, panelType, panelActive } = req.query;

    console.log("panelActive : ", panelActive)

    // console.log("_id panelType", id, panelType)
    try {

        const findPanel = await Panel.findById({ _id: id });
        console.log("pannelData ", findPanel)
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
        console.log("panelActive : ", typeof(panelActive));


        if (findPanel?.panelActive.toString() === panelActive.toString()) {
            return res.status(400).json({
                success: false,
                message: `${(panelActive.toString() == "true") ? "Panel is Already Active" : "Panel is already disable"} `
            })
        }


        // const updateData = await Panel.findByIdAndUpdate({ _id: _id }, {}, { new: true })

        return res.status(200).json({
            success: true,
            message: "Panel Update Successfully..",
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error.."
        })
    }
}




module.exports = { createPanel, getPanel, updatePanel }