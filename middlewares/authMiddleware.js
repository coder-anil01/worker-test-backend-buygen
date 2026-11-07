import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//****** =>  Protected Routes Token Base
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

//****** =>  Protected Routes ADMIN
export const isAdmin = async (req, res, next) => {
  try {
    const {id} =req.body;
    const user = await userModel.findById(id);
    if(!user){
      return res.status(404).send({success: false, message: "User Not Found"})
    }
    if (user.role !== "admin") {
      return res.status(200).send({
        success: false,
        message: "UnAuthorize Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Error on isAdmin",
      error,
    });
  }
};
