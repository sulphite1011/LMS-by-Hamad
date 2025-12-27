import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js'
import Course from '../models/Course.js'

const courseRouter = express.Router()

courseRouter.get('/all', getAllCourse)
courseRouter.get('/:id', getCourseId)

// Public course analytics (read-only)
courseRouter.get('/:id/analytics/public', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id).select([
      'courseTitle',
      'enrolledStudents',
      'courseRatings',
      'createdAt'
    ]);

    if (!course) {
      return res.json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    const analytics = {
      totalStudents: course.enrolledStudents.length,
      averageRating: course.courseRatings.length > 0
        ? course.courseRatings.reduce((sum, rating) => sum + rating.rating, 0) / course.courseRatings.length
        : 0,
      totalRatings: course.courseRatings.length,
      publishedDate: course.createdAt
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default courseRouter; 