import Course from '../models/Course.js'

export const verifyCourseOwnership = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const educator = req.auth.userId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const course = await Course.findOne({ 
      _id: courseId, 
      educator 
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this course'
      });
    }

    // Attach course to request for use in controllers
    req.course = course;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}