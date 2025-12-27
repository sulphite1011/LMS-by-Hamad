import express from 'express'
import {
  addCourse, 
  educatorDashboardData, 
  getEducatorCourses, 
  getEnrolledStudentsData, 
  updateRoleToEducator,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublish,
  getCourseAnalytics,
  // MAKE SURE THESE ARE IMPORTED
  addChapter,
  deleteChapter,
  updateChapter,
  addLecture,
  updateLecture,
  deleteLecture
} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

// Existing routes
educatorRouter.get('/update-role' , updateRoleToEducator);
educatorRouter.post('/add-course' , upload.single('image') , protectEducator , addCourse);
educatorRouter.get('/courses' , protectEducator , getEducatorCourses);
educatorRouter.get('/dashboard' , protectEducator , educatorDashboardData);
educatorRouter.get('/enrolled-students' , protectEducator , getEnrolledStudentsData);

// Course CRUD routes
educatorRouter.get('/course/:courseId', protectEducator, getSingleCourse)
educatorRouter.put('/course/:courseId', upload.single('image'), protectEducator, updateCourse)
educatorRouter.delete('/course/:courseId', protectEducator, deleteCourse)
educatorRouter.patch('/course/:courseId/publish', protectEducator, toggleCoursePublish)
educatorRouter.get('/course/:courseId/analytics', protectEducator, getCourseAnalytics)

// ✅ ADD THESE ROUTES FOR CHAPTER AND LECTURE MANAGEMENT
educatorRouter.post('/course/:courseId/chapters', protectEducator, addChapter)
educatorRouter.put('/course/:courseId/chapters/:chapterId', protectEducator, updateChapter)
educatorRouter.delete('/course/:courseId/chapters/:chapterId', protectEducator, deleteChapter)

educatorRouter.post('/course/:courseId/chapters/:chapterId/lectures', protectEducator, addLecture)
educatorRouter.put('/course/:courseId/chapters/:chapterId/lectures/:lectureId', protectEducator, updateLecture)
educatorRouter.delete('/course/:courseId/chapters/:chapterId/lectures/:lectureId', protectEducator, deleteLecture)

export default educatorRouter