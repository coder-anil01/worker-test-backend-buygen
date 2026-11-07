
import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  try {
    const saltPassword = 10;
    const hashedPassword = await bcrypt.hash(password, saltPassword);
    return hashedPassword;
  } catch (error) {
    console.log("Password hashing error:", error);
    throw error;
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.log("Password comparison error:", error);
    throw error;
  }
};
