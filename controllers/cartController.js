import cartModel from "../models/cartModel.js";

export const addToCart = async(req, res) => {
    try {
        const {product, user} = req.body;
        if(!product || ! user){
            return res.status(200).send({message : "Plese Enter Require Filds"})
        }
        await new cartModel({product, user}).save();
        res.status(201).send({
            success: true,
            message: "Product Added To Cart",
        })
    } catch (error) {
        res.status(404).send({
            success: false,
            message: "Internal server error",
            error,
        })
    }
}

export const getCart = async(req, res) => {
    try {
        const {user} = req.body;
        if(!user){
            return res.status(200).send({ message: "Somthing Went Wrong"})
        }
        const cart = await cartModel.find({user}).populate("product").select('-user');
        res.status(200).send({
            success: true,
            message: "All Cart",
            cart,
            total: cart.length,
        })
    } catch (error) {
        res.status(404).send({
            success: false,
            message: "Internal server error",
            error,
        })
    }
}

export const deleteCart = async(req, res) => {
    try {
        const {id} = req.params;
        const cart = await cartModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Product has been removed"
        })
    } catch (error) {
        res.status(404).send({
            success: false,
            message: "Internal server error",
            error,
        })
    }
}

export const deleteManyCart = async(req, res) => {
    try {
        const {id} = req.params;
        await cartModel.deleteMany({user: id});
        res.status(200).send({
            success: true,
            message: "All Cart deleted",
        })
    } catch (error) {
        res.status(404).send({
            success: false,
            message: "Internal server error",
            error,
        })
    }
}