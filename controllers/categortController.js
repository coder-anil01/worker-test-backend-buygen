import categoryModel from "../models/categoryModel.js"


//*************  CREATE   *************//
export const createCategoryController = async (req, res)=>{
    try {
        const {name} =req.body;
        if(!name){
            return res.status(401).send({ message: "Field is required"});
        }
        const exestingCategory = await categoryModel.findOne({name});
        if(exestingCategory){
            return res.status(200).send({
                success:false,
                message: "Category Alredy Exisits"
            })
        }
        const category = await new categoryModel(req.body).save();
        res.status(201).send({
            success:true,
            message: "Category Created Successfully",
            category,
        })
    } catch (error) {
        res.status(404).send({
            success: false,
            message: "Internal server error",
            error,
        })
    }
}

//*************  GET   *************//
export const getCategoryController = async(req, res) => {
    try {
        const categories = await categoryModel.find({})
        res.status(200).send({
            success:true,
            message: "All Category",
            categories,
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message: "Internal server error",
            error,
        })
    }
}

//*************  Update   *************//
export const updateCategoryController = async (req, res) => {
    try {
        const {id} = req.params
        const {name, image} = req.body
        
        const exestingCategory = await categoryModel.findOne({name})
        if(exestingCategory){
            return res.status(200).send({
                success:false,
                message: "Category Alredy Exisits"
            })
        }
        const updateCategory = await categoryModel.findByIdAndUpdate(id, {name, image}, {new: true})
        res.status(200).send({
            success: true,
            message: "Category Updated Successfully",
            updateCategory,
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message: "Internal server error",
            error,
        })
    }
}

//*************  Delete   *************//
export const deleteCategory = async(req, res) => {
    try {
        const {id} = req.params
        const category = await categoryModel.findByIdAndDelete(id)
        if( category == null){
            return res.status(404).send({error: "category not found"})
        }
        res.status(200).send({
            success: true,
            message: "Category Deleted Successfully",
            total: category.length,
            category,
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error,
        })
    }
}