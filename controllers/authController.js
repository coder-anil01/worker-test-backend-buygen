import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

//*************  REGISTATION   *************//
export const registerController = async (req, res) => {
  const { email, password } = req.body;
  try {
    //Validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Plese Enter Email or Password",
      });
    }

    //***=> ExistingUser
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Alredy Registered Email",
      });
    }

    //***=> Register User
    const hashedPassword = await hashPassword(password);

    //save
    const user = await userModel.create({ email, password: hashedPassword });
    const safeUser = user.toObject();
    delete safeUser.password;

    //***=> Token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({
      success: true,
      message: "Account created successfully!",
      user: safeUser,
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Registation",
      error,
    });
  }
};

//*************  LOGIN   *************//
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //***=> Validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Plese Enter Email or Password",
      });
    }
    //***=> Check User
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Email is not Registered",
      });
    }
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).send({
        success: false,
        message: "Your account has been blocked",
      });
    }

    const safeUser = user.toObject();
    delete safeUser.password;
    //***=> Token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Login",
      error,
    });
  }
};

export const testController = async (req, res) => {
  res.status(200).send({
    success: true,
    message: "Test controller",
  });
};

//*************  FORGOT - PASSWORD   *************//
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(200).send({ message: "Somthing went wrong" });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Forgot Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//*************  GET ALL USERS   *************//
export const getAllUserController = async (req, res) => {
  try {
    const role = 0;
    const allUsers = await userModel.find({ role }).sort({ createdAt: -1 });
    if (!allUsers) {
      return res.status(404).send({ message: "Don't have any account" });
    }
    res.status(200).send({
      message: "Get All User",
      counTotal: allUsers.length,
      success: true,
      allUsers,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

//*************  GET ALL ADMIN   *************//
export const getAllAdminController = async (req, res) => {
  try {
    const role = 8987;
    const allAdmin = await userModel.find({ role });
    if (!allAdmin) {
      return res.status(404).send({ message: "Don't have any account" });
    }
    res.status(200).send({
      message: "Get All Admin",
      countTotal: allAdmin.length,
      allAdmin,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const {
      search = "",
      status = "all",
      dateFilter = "all",
      startDate,
      endDate,
      sort = "newest",
    } = req.query;

    // Search filter
    const match = {};

    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      match.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Account status filter
    if (status === "active") {
      match.isBlocked = { $ne: true };
    } else if (status === "blocked") {
      match.isBlocked = true;
    }

    // Date filter
    const now = new Date();
    let fromDate = null;
    let toDate = null;

    if (dateFilter === "today") {
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);

      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
    }

    if (dateFilter === "last7Days") {
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
    }

    if (dateFilter === "thisMonth") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
    }

    if (dateFilter === "lastMonth") {
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    if (dateFilter === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      fromDate = new Date(`${startDate}T00:00:00.000`);
      toDate = new Date(`${endDate}T23:59:59.999`);

      if (
        Number.isNaN(fromDate.getTime()) ||
        Number.isNaN(toDate.getTime()) ||
        fromDate > toDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date range",
        });
      }
    }

    if (fromDate && toDate) {
      match.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    // Dashboard statistics (not affected by list filters)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      activeCustomers,
      blockedCustomers,
      newThisMonth,
      customers,
      totalFiltered,
    ] = await Promise.all([
      userModel.countDocuments(),

      userModel.countDocuments({
        isBlocked: { $ne: true },
      }),

      userModel.countDocuments({
        isBlocked: true,
      }),

      userModel.countDocuments({
        createdAt: { $gte: monthStart },
      }),

      userModel.aggregate([
        { $match: match },

        {
          $lookup: {
            from: orderModel.collection.name,
            localField: "_id",
            foreignField: "user",
            as: "orders",
          },
        },

        {
          $addFields: {
            totalOrders: {
              $size: "$orders",
            },

            totalOrderAmount: {
              $sum: "$orders.totalAmount",
            },

            deliveredOrderAmount: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$orders",
                      as: "order",
                      cond: {
                        $eq: ["$$order.status", "delivered"],
                      },
                    },
                  },
                  as: "order",
                  in: "$$order.totalAmount",
                },
              },
            },
          },
        },

        {
          $project: {
            password: 0,
            orders: 0,
          },
        },

        {
          $sort: {
            createdAt: sort === "oldest" ? 1 : -1,
          },
        },

        { $skip: skip },
        { $limit: limit },
      ]),

      userModel.countDocuments(match),
    ]);

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",

      stats: {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        newThisMonth,
      },

      pagination: {
        total: totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
        hasNextPage: page * limit < totalFiltered,
        hasPrevPage: page > 1,
      },

      users: customers,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

//*************  UPDATE PROFILE   *************//
export const updateProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, answer, newAnswer } = req.body;

    const existingUser = await userModel.findOne({ _id: id, answer });
    if (!existingUser) {
      return res.status(200).send({ message: "User Does Not Exist" });
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
        answer: newAnswer || user.answer,
      },
      { new: true },
    );

    //***=> Token
    const token = await JWT.sign({ _id: id }, process.env.JWT_SECRET);

    res.status(201).send({
      success: true,
      message: "Profile Updated Successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const deleteAuthcontroller = async (req, res) => {
  try {
    const { id } = req.params;
    await userModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Auth Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// User Magement => status update
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer status",
      });
    }

    const user = await userModel
      .findByIdAndUpdate(
        id,
        { $set: { isBlocked } },
        { new: true, runValidators: true },
      )
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer status updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
