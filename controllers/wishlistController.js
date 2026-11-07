import wishlistModel from "../models/wishlistModel.js";

export const createwishlist = async (req, res) => {
    try {
        const {user, product} = req.body;
        const exist = await wishlistModel.find({product, user});
        if(exist.length > 0){
            return res.status(200).send({ message:"Product exist In Wishlist"})
        }else{
            await new wishlistModel({ user, product}).save();
            res.status(200).send({
                success: true,
                message: "Added To WishList",
        })
        }
        
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const userwishlist = async (req, res) => {
    try {
        const {id} = req.params;
        const wishList = await wishlistModel.find({user: id}).populate('product').select("-user").sort({ createdAt: -1});
        res.status(200).send({
            success: true,
            message: "all Wishlist",
            wishList,
            total: wishList.length,
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const userwishlistRemove = async (req, res) => {
    try {
        const { id } = req.params
        const deleteProduct = await wishlistModel.findByIdAndDelete(id)
        res.status(200).send({
            success:true,
            message: "Product Remove Successfully",
            deleteProduct,
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message: "Internal server error",
            error,
        })
    }
}
