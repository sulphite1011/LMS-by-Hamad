import { clerkClient } from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js'

// update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId
  
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'educator',
      },
    })

    res.json({ success: true, message: 'You can publish a course now' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Add New Course
export const addCourse = async (req, res) => {
  try {
    console.log("addCourse called");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Auth user:", req.auth);

    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth?.userId;

    // Check if user is authenticated
    if (!educatorId) {
      console.log("No educatorId found");
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No user ID found' 
      });
    }

    if (!courseData) {
      console.log("No courseData provided");
      return res.status(400).json({ 
        success: false, 
        message: 'Course data is required' 
      });
    }

    if (!imageFile) {
      console.log("No image file provided");
      return res.status(400).json({ 
        success: false, 
        message: 'Thumbnail Not Attached' 
      });
    }

    console.log("Parsing course data...");
    const parsedCourseData = JSON.parse(courseData); // Remove 'await'
    parsedCourseData.educator = educatorId;

    console.log("Creating course in database...");
    const newCourse = await Course.create(parsedCourseData);

    console.log("Uploading image to Cloudinary...");
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    
    console.log("Cloudinary response:", imageUpload);
    
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    console.log("Course created successfully");
    res.status(201).json({ 
      success: true, 
      message: 'Course Added',
      course: newCourse 
    });
    
  } catch (error) {
    console.error("Error in addCourse:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      error: error.toString() 
    });
  }
}

// // Add New Course
// export const addCourse = async (req, res) => {
//   try {
//     const { courseData } = req.body
//     const imageFile = req.file
//     const educatorId = req.auth.userId

//     if (!imageFile) {
//       return res.json({ success: false, message: 'Thumbnail Not Attached' })
//     }

//     const parsedCourseData = await JSON.parse(courseData)
//     parsedCourseData.educator = educatorId
//     const newCourse = await Course.create(parsedCourseData)
//     const imageUpload = await cloudinary.uploader.upload(imageFile.path)

//     newCourse.courseThumbnail = imageUpload.secure_url
//     await newCourse.save()

//     res.json({ success: true, message: 'Course Added' })
//   } catch (error) {
//     return res.json({ success: false, message: error.messege })
//   }
// }