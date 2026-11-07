import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        require: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true,
    },
    });
export default mongoose.model('cart', cartSchema);