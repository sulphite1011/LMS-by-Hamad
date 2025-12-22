import mongoose from "mongoose";
 
//connect to mongodb 
const connectDB = async ()=>{
mongoose.connection.on('connected' , ()=> console.log('DataBase Connected'))

await mongoose.connect(`${process.env.MONGODB_URI}/lms474`)
};

export default connectDB