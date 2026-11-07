import addressModel from "../models/addressModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

//*************  CREATE   *************//
export const createOrder = async(req, res) => {
    try {

        let {product, addressid, userid, name, mobile, pincode, house, landmark, city, state,paymentMethod} = req.body;
        const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        mobile = Number(mobile);
        pincode = Number(pincode);
        // console.log(product, addressid, userid, name, mobile, pincode, house, landmark, city, state);

        if(addressid && userid){
            console.log("Existing user")
            for (let i = 0; i < product.length; i++) {
                const getProduct = await productModel.findById(product[i]).select("price");
                console.log(getProduct);
                const totalAmount = Number((product[i]?.quantity || 1) *getProduct?.price);
                console.log(totalAmount);
                await orderModel.create({product:getProduct?._id, user:userid, address:addressid, price: getProduct?.price ,totalAmount, quantity: product[i]?.quantity || 1 ,paymentMethod: "COD", estimatedDelivery ,});
            }
                res.status(201).send({
                    success: true,
                    message: "congratulations Order Conform",
                })
        }else{
            console.log("Creat user")
            let user = [];
            let address = [];
            if(!userid){
                user = await userModel.create({name, mobile});
            };
            if(addressid && name && mobile && pincode){
                address =await addressModel.findByIdAndUpdate(addressid, {name, mobile, pincode, house, landmark, city, state, user: userid || user?._id},{new:true});
            }else{
                address = await addressModel.create({name, mobile, pincode, house, landmark, city, state, user: userid || user?._id});
            }

            for (let i = 0; i < product.length; i++) {
                const getProduct = await productModel.findById(product[i]).select("price");
                const totalAmount = Number(product[i]?.quantity*getProduct?.price);
                await orderModel.create({product:product[i]?._id, user: userid || user?._id, address:address._id, price: getProduct?.price ,totalAmount, quantity: product[i]?.quantity || 1 ,paymentMethod: "COD", estimatedDelivery ,});
            }
            const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET );
            console.log(address);
            res.status(201).send({
                 ...(!userid && {user: {_id: user._id,name: user.name,mobile: user.mobile,},}),
                 address,
                 token,
                 success: true,
                 message: "congratulations Order Conform",
             })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error,
          });
    }
}

//*************  CREATE   *************//
export const createOneOrder = async(req, res) => {
    try {
        const {addressid, userid, name, mobile, pincode, house, landmark, city, state,paymentMethod, productid} = req.body;
        const quantity = req.body.quantity || 1;
        console.log(addressid, userid, name, mobile, pincode, house, landmark, city, state,paymentMethod, productid,quantity);
        const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const product = await productModel.findById(productid).select("price");
        const totalAmount = product.price*quantity;
        console.log(totalAmount);

        if(addressid && userid){
            const order = await orderModel.create({product: productid, quantity, price:product.price ,totalAmount, user: userid ,address: addressid, estimatedDelivery, paymentMethod,});
            const token = JWT.sign({ _id: userid }, process.env.JWT_SECRET );
            res.status(201).send({
                token,
                order,
                success: true,
                message: "congratulations Order Conform",
            })
        }else{
            let user = [];
            let address = [];
            if(!userid){
                user = await userModel({name, mobile}).save();
                console.log("creating user");
            };
            if(addressid && name ){
                console.log("Updating address");
                address =await addressModel.findByIdAndUpdate(addressid, {name, mobile, pincode, house, landmark, city, state, user: userid || user?._id},{new:true});
            }else{
                console.log("Creating Address")
                address = await addressModel.create({user: userid || user?._id, name, mobile, pincode, house, landmark, city, state,});
            }



            // const user = await userModel.create({name, mobile});
            // const address = await addressModel.create({name, mobile, pincode, house, landmark, city, state, user: user?._id});
            const order = await orderModel.create({product: productid, quantity, price:product.price ,totalAmount, user: userid || user._id ,address: address._id, estimatedDelivery, paymentMethod,});
            const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET );
             res.status(201).send({
                ...(!userid && {user: {_id: user._id,name: user.name,mobile: user.mobile,},}),
                 address,
                 token,
                 order,
                 success: true,
                 message: "congratulations Order Conform",
             })
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error,
          });
    }
}

//*************  GET   *************//
export const getAllOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const totalOrders = await orderModel.countDocuments({});

        const orders = await orderModel.find({})
            .populate("address")
            .populate("product", "_id title images brand")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).send({
            success: true,
            message: "All Orders",
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit,
                hasNextPage: page < Math.ceil(totalOrders / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            success: false,
            message: "Error While Getting Orders",
            error
        });
    }
};

//*************  GET user All Orders   *************//
export const userAllOrders = async(req, res)=>{
    try {
        const {id} = req.body
        if(!id){
            return res.status(404).send("plese enter user id")
        }
        const orders = await orderModel.find({user: id}).populate("product", "title _id slug images").populate("address").sort({ createdAt: -1});
        console.log(orders);
        res.status(200).send({
            success: true,
            message: "User All Order",
            totalOrders: orders.length,
            orders,
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error,
          });
    }
}

//*************  Update   *************//
export const updateStaus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;
        const update = await orderModel.findByIdAndUpdate(id,{ $set: { status } },{returnDocument: "after",runValidators: true,})
        console.log(update);
            res.status(200).send({
            success: true,
            message: "Order Status Updated",
            update,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error,
          });
    }
}