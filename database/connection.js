import mongoose from "mongoose";


function connectDB(){
    mongoose.set("strictQuery" , false)
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("Database connected successfully!!")
    }).catch((error)=>{
        console.log(`data base conncetion error ${error}`)
    })
}

 


export default connectDB;