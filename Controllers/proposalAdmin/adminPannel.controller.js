const Panel = require("../../Models/AdminModel/pannelTypeSchema");
const Technology = require("../../Models/AdminModel/panneTechnologySchema");
const Constructive = require("../../Models/AdminModel/constructiveSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin } = require("../../Models/AdminModel/AdminSchema");
const { default: mongoose } = require("mongoose");
const DealerModel = require("../../Models/dealer.schema");

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
      return res
        .status(400)
        .json({ success: false, message: "Panel type should be string" });
    }

    panelType = panelType?.trim().toUpperCase();

    const existingPannel = await Panel.findOne({ panelType });

    if (existingPannel) {
      return res.status(409).json({
        success: false,
        message: "Panel already Exits..Try with different Name!!",
      });
    }

    const panel = await Panel.create({
      panelType,
    });
    return res.status(201).json({
      success: true,
      message: "Panel is created sucessfully..",
    });
  } catch (er) {
    console.log(er);
    res.status(500).json({
      success: false,
      message:
        "Internal Server Error, Couldn't add Panel Type.." || er?.message,
    });
  }
};

const getPanel = async (req, res) => {
  try {
    const panelData = await Panel.find();

    return res.status(200).json({
      success: true,
      data: panelData,
    });
  } catch (er) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.." || er?.message,
    });
  }
};

const updatePanel = async (req, res) => {
  try {
    let { _id, panelType } = req.query;

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

    const findPanel = await Panel.findById({ _id: _id });
    // console.log("findPanel : ", findPanel)

    if (!findPanel) {
      return res.status(400).json({
        success: false,
        message: "Panel not found ",
      });
    }

    if (findPanel?.panelType === panelType) {
      return res.status(409).json({
        success: false,
        message: "This name panel is already exits you can not update the panel with same name , Try with different name "
      })
    }

    const panelData = await Panel.find();
    // console.log("panelData : ",panelData)

    // panelData?.some(item => console.log(item));
    const data = panelData?.some(item => item?.panelType === panelType);
    // console.log("data : ", data)
    if (data) {
      return res.status(409).json({
        success: false,
        message: "This  panel name is already exist , Try with New Name.."
      })
    }

    // if (findPanel?.panelActive.toString() === panelActive?.toString()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `${panelActive !== true ? "Panel is Already Active" : "Panel is already disable"} `,
    //   });
    // }

    const updateData = await Panel.findByIdAndUpdate(
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
    // console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal Server Error.." || error?.message,
    });
  }
};

const togglePanel = async (req, res) => {
  // console.log("id,isActive : ", id, isActive)
  try {
    const { id, panelActive } = req.body;

    // checking panelActive is string or not
    if (typeof panelActive === "string")
      return res.status(400).json({
        success: false,
        message: "panelActive should be boolean but getting string",
      });

    //   checking if id's coming as string or something else

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

    // checking if id's are valid or not
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Technology id is not valid" });


    const findPanel = await Panel.findById(id);

    if (!findPanel) {
      return res.status(400).json({
        success: false,
        message: "Panel is not find ,try with correct panel Id..",
      });
    }

    const updateData = await Panel.findByIdAndUpdate(
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

const createTechnology = async (req, res) => {
  try {
    let { panelId, technologyPanel } = req.body;

    if (typeof technologyPanel !== "string" || typeof panelId !== "string")
      return res
        .status(400)
        .json({ success: false, message: "Technology should be String!!" });

    if (!panelId.trim() || !technologyPanel.trim()) {
      return res.status(400).json({
        success: false,
        message: "Panel Id and technology panel not be empty...",
      });
    }

    panelId = panelId.trim();

    //  check format of panelId
    if (!mongoose.Types.ObjectId.isValid(panelId))
      return res
        .status(400)
        .json({ success: false, message: "You did something with Id" });

    technologyPanel = technologyPanel?.trim().toUpperCase();

    const panelExits = await Panel.findById(panelId);
    if (!panelExits) {
      return res.status(400).json({
        success: false,
        message: "Panel is not found.Try with correct panel Id",
      });
    }
    const isExisting = await Technology.findOne({ panelId, technologyPanel });

    if (isExisting?.technologyPanel === technologyPanel) {
      return res.status(400).json({
        success: false,
        message: " This Technology is already register...",
      });
    }

    await Technology.create({
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
    let { panelId } = req?.query;

    if (!panelId.trim())
      return res
        .status(400)
        .json({ success: false, message: "Panel id Not found" });

    panelId = panelId.trim();
    if (!mongoose.Types.ObjectId.isValid(panelId))
      return res
        .status(400)
        .json({ success: false, message: "Panel id is not valid at all" });

    const isExits = await Panel.findOne({ _id: panelId });
    if (!isExits) {
      return res.status(404).json({
        success: false,
        message: "Panel Id is not found try with another panel Id..",
      });
    }
    const data = await Technology.find({ panelId });
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
      return res
        .status(400)
        .json({ success: false, message: "Technology id is not valid" });

    const existingData = await Technology.findOne({ _id });

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

    const allData = await Technology.findOne({ panelId, technologyPanel });

    if (!allData) {
      const updateData = await Technology.findByIdAndUpdate(
        { _id },
        { technologyPanel },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: "Data is update successfully",
        updateData: updateData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error..." || error?.message,
    });
  }
};

const activeDisableTech = async (req, res) => {
  // console.log("id,isActive : ", id, isActive)
  try {
    const { id, panelId, isActive } = req.body;

    // checking isActive is string or not
    if (typeof isActive === "string")
      return res.status(400).json({
        success: false,
        message: "isActive should be boolean but getting string",
      });

    //   checking if id's coming as string or something else

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

    // checking if id's are valid or not
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Technology id is not valid" });
    if (!mongoose.Types.ObjectId.isValid(panelId))
      return res
        .status(400)
        .json({ success: false, message: "Panel id is not valid" });

    const findPanel = await Panel.findById({ _id: panelId });

    if (!findPanel) {
      return res.status(400).json({
        success: false,
        message: "Panel is not find ,try with correct panel Id..",
      });
    }
    const findTech = await Technology.findById({ _id: id });

    if (!findTech) {
      return res.status(400).json({
        success: false,
        message: "Technology not found..",
      });
    }

    const updateData = await Technology.findByIdAndUpdate(
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
        message: "PanelId ,technologyId and constructiveType should be string",
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
    const panelExits = await Panel.findOne({ _id: panelId });
    const technologyExits = await Technology.findOne({ _id: technologyId });
    const isExits = await Constructive.findOne({ constructiveType });

    // console.log("technology",technologyExits);
    // console.log("panel ",panelExits);
    console.log("Constructive ", isExits);

    if (!panelExits) {
      return res.status(404).json({
        success: false,
        message: "Panel Id is not exits, try with correct panel Id",
      });
    }

    if (!technologyExits) {
      return res.status(404).json({
        success: false,
        message: "Technology Id is not exits, try with correct technology Id",
      });
    }

    if (isExits) {
      return res.status(409).json({
        success: false,
        message: "Constructive Type is already exits,Try with different type..",
      });
    }

    // console.log("constructiveType : ", constructiveType)
    // console.log("constructiveType : ", constructiveType.length)

    const createConstructive = await Constructive.create({
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
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error..",
    });
  }
};

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
      });
    }
    const data = await Constructive.find({ technologyId });
    return res.status(200).json({
      success: true,
      message: "Data fetch Successfully..",
      data: data,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error..",
    });
  }
};

const updateConstructive = async (req, res) => {
  let { id, panelId, technologyId, constructiveType } = req.body;
  // console.log(id, panelId, technologyId, constructiveType);
  // console.log(req.body);
  constructiveType = constructiveType.trim().toUpperCase();

  try {
    if (!id || !panelId || !technologyId || !constructiveType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required...",
      });
    }

    const findPanel = await Panel.findById({ _id: panelId });

    if (!findPanel) {
      return res.status(404).json({
        success: false,
        message: "Panel is not find try with correct panel id..",
      });
    }

    const findTechnology = await Technology.findById({ _id: technologyId });
    if (!findTechnology) {
      return res.status(404).json({
        success: false,
        message: "Technology is not find try with correct technology id..",
      });
    }

    const findConstructive = await Constructive.findById({ _id: id });

    // console.log("findTechnology: ", findTechnology);
    // console.log("findConstructive: ", findConstructive);
    // console.log(constructiveType)
    if (!findConstructive) {
      return res.status(404).json({
        success: false,
        message: "Constructive is not find try with correct constructive id..",
      });
    }

    const allData = await Constructive.find({ panelId });
    // console.log("allData : ", allData);
    const isExits = allData.some((data) => {
      // console.log("data",data)
      // console.log("data?.constructiveType : ",data?.constructiveType)
      return data?.constructiveType === constructiveType;
    });
    // console.log("isExits : ", isExits)

    if (isExits) {
      return res.status(400).json({
        success: false,
        message:
          "This name constructive is already exits , you can not update with same name,Try with different name",
      });
    }

    const updateData = await Constructive.findByIdAndUpdate(
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
    const findPanel = await Panel.findById({ _id: panelId });
    if (!findPanel) {
      return res.status(400).json({
        success: false,
        message: "Panel is not find ,try with correct panel Id..",
      });
    }
    const findTech = await Technology.findById({ _id: technologyId });
    if (!findTech) {
      return res.status(400).json({
        success: false,
        message: "Technology is not find ,try with correct technology Id..",
      });
    }
    const findConstrutive = await Constructive.findById({ _id: id });
    if (!findConstrutive) {
      return res.status(400).json({
        success: false,
        message: "Construtive is not find ,try with correct Construtive Id..",
      });
    }

    const data = await Constructive.findByIdAndUpdate(
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

const createAdmin = async (req, res) => {
  let { email, password, role } = req.body;
  email = email?.toLowerCase().trim();
  // console.log("email ", email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.."
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be 6 digits"
      })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invaild email format.."
      })
    }

    const admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists"
      });
    }

    const hashPass = await bcrypt.hash(password, 10);
    // console.log("hashPass : ", hashPass)

    const adminData = await Admin.create({
      email,
      password: hashPass,
      role
    })

    return res.status(201).json({
      success: true,
      message: "Admin created successfully...",
      admin: adminData
    })

  } catch (error) {
    // console.log("Error : ", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error.."
    })
  }
}

const getAdmin = async (req, res) => {
  try {
    const allData = await Admin.find();
    return res.status(200).json({
      success: true,
      data: allData
    })

  } catch (error) {
    // console.log("Error : ", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error.."
    })


  }

}

const loginAdmin = async (req, res) => {
  let { email, password } = req.body;
  email = email?.toLowerCase().trim();
  // console.log("Email ", email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.."
      })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invaild email format.."
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be 6 digit.."
      })
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    // console.log("Admin : ", admin); 

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign({
      adminId: admin._id,
      email: admin.email,
      role: "admin"
    },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )
    // console.log("Match ", match)
    if (match) {
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.cookie("role", admin?.role, {
        httpOnly: false, // frontend can read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

    }
    return res.status(200).json({
      success: true,
      message: "Admin Login successfully.."
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error..."
    })

  }

}

const logoutAdmin = async (req, res) => {
  try {
    console.log(req?.cookies)
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",

    });

    res.clearCookie("role", {
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });


  } catch (err) {
    return (res.status(500).json({
      success: false,
      message: err.message || "Internal server Error..."
    }))
  }
}

const adminDashBoardData = async (req, res) => {
  try {

    const totalPannel = await Panel.find().select("panelType panelActive")
    const totalDealer = await DealerModel.find().select(" firstName email companyName contactNumber ")

    // console.log("totalPannel ", totalPannel)
    // console.log("totalDelaer ", totalDealer)

    return res.status(200).json({
      success: true,
      data: {
        pannelData: totalPannel,
        dealerData: totalDealer
      }
    })


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server Error.."
    })
  }

}




module.exports = {
  createPanel,
  getPanel,
  updatePanel,
  togglePanel,
  createTechnology,
  getTechnology,
  updateTechnology,
  activeDisableTech,
  createConstructive,
  getConstructive,
  updateConstructive,
  activeDisableConst,
  createAdmin,
  getAdmin,
  loginAdmin,
  logoutAdmin,
  adminDashBoardData
};
