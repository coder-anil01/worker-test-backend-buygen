import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
    
    // Slug url-friendly name hota hai
        slug: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
          maxlength: 100,
        },
    
        description: {
          type: String,
          trim: true,
          maxlength: 500,
          default: "",
        },
    
        image: {
          type: String,
          trim: true,
          default: "",
        },
    
        imagePublicId: {
          type: String,
          trim: true,
          default: "",
        },
    
        parent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          default: null,
        },
    
        status: {
          type: String,
          enum: ["Active", "Inactive"],
          default: "Active",
        },
        offer: {
          type: String,
        },
    
        featured: {
          type: Boolean,
          default: false,
        },
    
        // sortOrder: {
        //   type: Number,
        //   default: 0,
        // },
    
        // seo: {
        //   title: {
        //     type: String,
        //     trim: true,
        //     maxlength: 50,
        //     default: "",
        //   },
      
        //   description: {
        //     type: String,
        //     trim: true,
        //     maxlength: 160,
        //     default: "",
        //   },
      
        //       keywords: {
        //         type: [String],
        //         default: [],
        //       },
        //     },

          },

          {
            timestamps: true,
          }
        );

export default mongoose.model('category', categorySchema);