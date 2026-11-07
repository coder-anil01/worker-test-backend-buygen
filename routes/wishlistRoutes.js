import express from "express";
import { createwishlist, userwishlist, userwishlistRemove } from "../controllers/wishlistController.js";

const router = express.Router();

router.post('/create', createwishlist);

router.post('/get/:id', userwishlist);

router.delete('/delete/:id', userwishlistRemove);

export default router;