import express from "express";
import { addToCart, deleteCart, deleteManyCart, getCart } from "../controllers/cartController.js";

//router object
const router = express.Router();

router.post("/create", addToCart);

router.post("/get", getCart)

router.delete("/delete/:id", deleteCart)

router.delete("/alldelete/:id", deleteManyCart)


export default router;
