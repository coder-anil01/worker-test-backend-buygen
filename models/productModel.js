import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    // Slug url-friendly name hota hai
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 220,
      // unique: true,
    },

    shortDescription: [
      {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },

    // Offers
    bogoOffers: [
      {
        enabled: {
          type: Boolean,
          default: true,
        },
        buyQuantity: {
          type: Number,
          min: 1,
        },
        getQuantity: {
          type: Number,
          min: 1,
        },
      },
    ],

    /* ================= CATEGORY ================= */

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      default: null,
    },

    /* ================= BRAND ================= */

    brand: {
      type: String,
      trim: true,
      default: "",
      maxlength: 50,
    },
    offer: {
      type: String,
      trim: true,
    },

    /* ================= PRICING ================= */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    /* ================= RATING ================= */

    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
    },

    /* ================= INVENTORY ================= */

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    /* ================= PRODUCT OPTIONS ================= */

    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    sizes: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ================= PRODUCT DETAILS ================= */

    specifications: [
      {
        name: {
          type: String,
          trim: true,
        },

        value: {
          type: String,
          trim: true,
        },
      },
    ],

    /* ================= SHIPPING ================= */

    weight: {
      type: String,
    },

    length: {
      type: String,
    },

    width: {
      type: String,
    },

    height: {
      type: String,
    },

    freeShipping: {
      type: Boolean,
      default: false,
    },

    /* ================= SALES ================= */

    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ================= SEO ================= */

    keywords: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true,
  },
);

/* ================= INDEXES ================= */

productSchema.index({
  name: 1,
});

productSchema.index({
  category: 1,
});

productSchema.index({
  subCategory: 1,
});

export default mongoose.model("products", productSchema);
