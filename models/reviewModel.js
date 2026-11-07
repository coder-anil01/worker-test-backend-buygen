import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: 2000,
    },

    images: [
      {
        url: {
          type: String,
          trim: true,
        },
        publicId: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true }
);

const reviewModel = mongoose.model("Review", reviewSchema);

export default reviewModel;