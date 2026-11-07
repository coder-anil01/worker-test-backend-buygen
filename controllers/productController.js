import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import reviewModel from "../models/reviewModel.js";

//*************  CREATE   *************//
export const productCreateController = async (req, res) => {
  try {
    const createProduct = await new productModel(req.body).save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      createProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      // error,
    });
  }
};

//*************  FETCH   *************//
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category", "name _id")
      .populate("subCategory", "name _id")
      .sort({ createdAt: -1 });
    // const products = await productModel.find({}).sort({ createdAt: -1});
    res.status(200).send({
      success: true,
      message: "All Product",
      counTotal: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//*************  FETCH   *************//
export const getSingleProductController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).send({ message: "Product Not Found" });
    }
    // const product = await productModel.findById(id).populate('category');
    const product = await productModel
      .findById(id)
      .populate("category", "name")
      .populate("subCategory", "name");
    // const reletedProduct = await productModel.find({});
    if (!product) {
      return res.status(200).send({ message: "Product Not Found" });
    }
    const reviews = await reviewModel
      .find({ product: id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
      console.log(reviews);

    const stats = await reviewModel.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const totalReviews = stats.reduce((total, item) => total + item.count, 0);
    const totalStars = stats.reduce(
      (total, item) => total + item._id * item.count,
      0,
    );
    const averageRating =
      totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 0;
    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
      const found = stats.find((item) => item._id === star);
      const count = found ? found.count : 0;

      const percentage =
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return {
        star,
        count,
        percentage,
      };
    });
    res.status(200).send({
      success: true,
      message: "Single Product",
      product,
      reviews,
      totalReviews,
      averageRating,
      ratingBreakdown,
      // reletedProduct,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//*************  Get Multiple Products   *************//
export const getMultipleProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of product IDs",
      });
    }

    // Validate MongoDB ObjectIds
    const invalidIds = productIds.filter((id) => !/^[0-9a-fA-F]{24}$/.test(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID found",
        invalidIds,
      });
    }

    // Find all products in one query
    const products = await Product.find({
      _id: { $in: productIds },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//*************  UPDATE   *************//
// export const updateProductController = async(req, res)=> {
//     try {
//         const{ id } = req.params
//         const {title, description, image, images, price, category, countInStock, rating, numReviews, isFeatured} = req.body
//         const updateProduct = await productModel.findByIdAndUpdate(id, {title, description, image, images, price, category, countInStock, rating, numReviews, isFeatured},
//             {new: true})
//         res.status(201).send({
//             success: true,
//             message: "Product Updated Successfully",
//             updateProduct,
//         })
//     } catch (error) {
//         res.status(500).send({
//             success: false,
//             message: "Internal server error",
//             error,
//         })
//     }
// }

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    //   .populate("category", "name")
    //   .populate("subCategory", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//*************  DELETE   *************//
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).send({ success: false, });
    }
    const deleteProduct = await productModel.findByIdAndDelete(id);
    if (!deleteProduct) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//*************  FILTER   *************//
export const filterProductConteroller = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      message: "filtered Product",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//*************  SEARCH   *************//
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await productModel.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
    res.status(200).send({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//*************  SEARCH   *************//
export const reletedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const reletedProduct = await productModel
      .find({
        category: cid,
        _id: { $ne: pid }, //note include
      })
      .populate("category");
    res.status(200).send({
      success: true,
      total: reletedProduct.length,
      reletedProduct,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//*************  Product By Category   *************//
export const productByCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel
      .find({ category: id })
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      total: product.length,
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
