// // Middleware ( Protect Educator Routes )
// export const protectEducator = async (req, res, next) => {  
//   try {  
//     const userId = req.auth.userId;
    
//     if (!userId) {
//       return res.status(401).json({
//         success: false, 
//         message: 'Unauthorized: No user ID' 
//       });
//     }
    
//     console.log("protectEducator checking user:", userId);
//     const response = await clerkClient.users.getUser(userId);
    
//     console.log("User metadata:", response.publicMetadata);
    
//     if (response.publicMetadata.role !== 'educator') {  
//       return res.status(403).json({
//         success: false, 
//         message: 'Unauthorized Access: Not an educator' 
//       });
//     }  
    
//     next();  // ✅ This should be here
//   } catch (error) {  
//     console.error("protectEducator error:", error);
//     res.status(500).json({
//       success: false, 
//       message: error.message 
//     });  
//   }
// }






import express from 'express'
import {addCourse, updateRoleToEducator} from '../controllers/educatorController.js'
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router()


//add educator role 
educatorRouter.get('/update-role' , updateRoleToEducator);
educatorRouter.post('/add-course' , upload.single('image') , protectEducator , addCourse);


export default educatorRouter