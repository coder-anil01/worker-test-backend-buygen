import express from "express";
import {
  createCategoryController,
  deleteCategory,
  getCategoryController,
  updateCategoryController,
} from "../controllers/categortController.js";


//router object
const router = express.Router();


router.post("/create", createCategoryController);

router.get("/get", getCategoryController);

router.put('/update/:id', updateCategoryController);

router.delete('/delete/:id', deleteCategory);


export default router;
