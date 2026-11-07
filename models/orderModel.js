import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity:{
      type: Number,
      default:1,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD", "NET_BANKING"],
      default: "COD",
      required: true,
    },
    status: {
      type: String,
      default: "order confirmed",
      // enum: ["order confirmed","processing","packed","shipped","out_for_delivery","delivered","cancelled","return_requested","returned",],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "address"
    },
    
    trackingNumber: {
      type: String,
      default: "",
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("order", orderSchema);
