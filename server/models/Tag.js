import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, lowercase: true, maxlength: 40, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 60, unique: true },
}, { timestamps: true });


const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
