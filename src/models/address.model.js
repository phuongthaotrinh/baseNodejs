const mongoose  = require("mongoose");
const addressSchema  = mongoose.Schema({
    address: {
        province: {
            children: { type: String },
            key: { type: String },
            value: { type: String },
          },
          district: {
            children: { type: String },
            key: { type: String },
            value: { type: String },
          },
          ward: {
            children: { type: String },
            key: { type: String },
            value: { type: String },
          },
          desc: { type: String },
    },
    phone: { type: String },
    name: {type: String},
  });
  
  export default mongoose.model("Address", addressSchema)