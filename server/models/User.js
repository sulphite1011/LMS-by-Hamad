import mongoose, { Schema } from 'mongoose'

const userSchemia = new mongoose.Schemia(
  {
_id       : { type : String  , required : true},
name       : { type : String  , required : true},
email       : { type : String  , required : true},
imageUrl      : { type : String  , required : true},
enrolledCourses :[
  {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'course'
  }
]

} ,{timestamps : true});

const User = mongoose.model('User' , userSchemia);
export default User