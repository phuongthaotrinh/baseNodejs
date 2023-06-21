const mongoose  = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const mongoosePaginate = require('mongoose-paginate-v2');


const attributeSchema = mongoose.Schema({
    name: {type: String, require: true, unique: true, minLength: [4, 'Must be at least 6, got {VALUE}'] },
    desc: {type: String},
    status: { type: Boolean, default: true }, // 0 : dang hoạt dong | 1 : đang khóa
    isParent: {type: Boolean},
    value: {type: String, require: true, unique: true, minLength: [4, 'Must be at least 6, got {VALUE}'] },
    children:{type: Array}
  }, { timestamps: true });

attributeSchema.plugin(mongoosePaginate);
export default mongoose.model("Attribute", attributeSchema)

