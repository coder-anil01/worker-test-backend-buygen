import express from "express";
import {
  deleteProductController,
  filterProductConteroller,
  getMultipleProducts,
  getProductController,
  getSingleProductController,
  productByCategoryController,
  productCreateController,
  reletedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/create", productCreateController);

router.get("/get", getProductController);

router.get("/getmultiple", getMultipleProducts);

router.get("/get/:id", getSingleProductController);

router.post("/search/:keyword", searchProductController);

router.get("/releted/:pid/:cid", reletedProductController);

router.get("/category/:id", productByCategoryController);

router.post("/filter", filterProductConteroller);

router.put("/update/:id", updateProductController);

router.delete("/delete/:id", deleteProductController);

export default router;
