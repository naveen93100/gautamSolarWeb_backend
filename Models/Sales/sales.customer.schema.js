const {Schema, default: mongoose,model}=require("mongoose");

const salesCustomerSchema=new Schema({

    salesPersonId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Sales'
    },
    fullName:{
        type:String,
        // required:true,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
    },
    phone:{
        type:String,
        trim:true,
        required:true
    }, 
    address:{
        type:String,
        required:true
    },
    companyName:{
        type:String,
        required:true
    },
    gstin:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true});

salesCustomerSchema.index({salesPersonId:1,phone:1},{unique:true});

const SalesCustomer=model('SalesCustomer',salesCustomerSchema);
module.exports=SalesCustomer