import mongoose from "mongoose"

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required."]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true,"User is required."]
    },
    otpHash:{
        type:String,
        required:[true,"OTP hash is required."]
    }
},{
    timestamps:true
})

// OTP auto-deletes 5 minutes after creation (matches the email text)
otpSchema.index({createdAt:1},{expireAfterSeconds:300})

// speeds up the lookup in verifyEmail
otpSchema.index({email:1,otpHash:1})

const otpModel=mongoose.model("OTP",otpSchema);

export default otpModel;