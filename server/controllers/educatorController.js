import { clerkClient } from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js'
import { Purchase } from '../models/Purchase.js'
import User from '../models/User.js'
import { nanoid } from 'nanoid'; 
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
// Add New Course - FIXED VERSION
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body
    const imageFile = req.file
    const educatorId = req.auth.userId

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Thumbnail Not Attached' })
    }

    // Upload image first
    const imageUpload = await cloudinary.uploader.upload(imageFile.path)
    
    // Parse course data and add thumbnail URL
    const parsedCourseData = JSON.parse(courseData)
    parsedCourseData.educator = educatorId
    parsedCourseData.courseThumbnail = imageUpload.secure_url
    
    // Create course with thumbnail
    const newCourse = await Course.create(parsedCourseData)

    res.status(201).json({ 
      success: true, 
      message: 'Course Added Successfully',
      course: newCourse 
    })
  } catch (error) {
    console.error('Add course error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}


// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



// Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => { 
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator  });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
        
        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true, 
            dashboardData: {
                totalEarnings, 
                enrolledStudentsData, 
                totalCourses
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);
      
        const purchases = await Purchase.find({  
            courseId: { $in: courseIds },  
            status: 'completed'  
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// <------------------------------------------------------------------------------------------------------------------>

// Get Single Course (for editing)
export const getSingleCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educator = req.auth.userId;

    const course = await Course.findOne({ 
      _id: courseId, 
      educator 
    });

    if (!course) {
      return res.json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// Update Course
// Update Course - FIXED VERSION
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseData } = req.body;
    const imageFile = req.file;
    const educator = req.auth.userId;

    // Check if course exists and belongs to educator
    const existingCourse = await Course.findOne({ 
      _id: courseId, 
      educator 
    });

    if (!existingCourse) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    // Parse course data
    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid course data format' 
      });
    }

    // Update thumbnail if new image uploaded
    if (imageFile) {
      try {
        // Upload new image
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail = imageUpload.secure_url;
        
        // Delete old image from Cloudinary if it exists
        if (existingCourse.courseThumbnail) {
          try {
            // Extract public ID from Cloudinary URL
            const urlParts = existingCourse.courseThumbnail.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            
            // Construct the full public ID with folder path
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex > 0) {
              const version = urlParts[uploadIndex + 1];
              const folderPath = urlParts.slice(uploadIndex + 2, -1).join('/');
              const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;
              
              await cloudinary.uploader.destroy(fullPublicId);
              console.log('Deleted old image:', fullPublicId);
            }
          } catch (deleteError) {
            console.log('Warning: Could not delete old image:', deleteError.message);
            // Continue even if deletion fails
          }
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload new thumbnail' 
        });
      }
    }

    // Update fields
    existingCourse.courseTitle = parsedCourseData.courseTitle || existingCourse.courseTitle;
    existingCourse.courseDescription = parsedCourseData.courseDescription || existingCourse.courseDescription;
    existingCourse.coursePrice = parsedCourseData.coursePrice !== undefined ? parsedCourseData.coursePrice : existingCourse.coursePrice;
    existingCourse.discount = parsedCourseData.discount !== undefined ? parsedCourseData.discount : existingCourse.discount;
    existingCourse.isPublished = parsedCourseData.isPublished !== undefined 
      ? parsedCourseData.isPublished 
      : existingCourse.isPublished;
    
    // Update thumbnail URL if new one was uploaded
    if (parsedCourseData.courseThumbnail) {
      existingCourse.courseThumbnail = parsedCourseData.courseThumbnail;
    }
    
    // Update course content if provided
    if (parsedCourseData.courseContent) {
      existingCourse.courseContent = parsedCourseData.courseContent;
    }

    await existingCourse.save();

    res.json({ 
      success: true, 
      message: 'Course updated successfully',
      course: existingCourse 
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educator = req.auth.userId;

    // Check if course exists and belongs to educator
    const course = await Course.findOne({ 
      _id: courseId, 
      educator 
    });

    if (!course) {
      return res.json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    // Check if there are enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.json({ 
        success: false, 
        message: 'Cannot delete course with enrolled students. Archive it instead.' 
      });
    }

    // Delete thumbnail from Cloudinary if exists
    if (course.courseThumbnail) {
      try {
        const imageId = course.courseThumbnail.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imageId);
      } catch (err) {
        console.log('Error deleting image:', err.message);
      }
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    res.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// Archive/Unpublish Course
export const toggleCoursePublish = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educator = req.auth.userId;
    const { isPublished } = req.body;

    if (isPublished === undefined) {
      return res.json({ 
        success: false, 
        message: 'isPublished field is required' 
      });
    }

    const course = await Course.findOne({ 
      _id: courseId, 
      educator 
    });

    if (!course) {
      return res.json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    course.isPublished = isPublished;
    await course.save();

    res.json({ 
      success: true, 
      message: isPublished ? 'Course published' : 'Course unpublished',
      course 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// Get Course Analytics (for specific course)
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educator = req.auth.userId;

    const course = await Course.findOne({ 
      _id: courseId, 
      educator 
    }).populate('enrolledStudents', 'name email imageUrl');

    if (!course) {
      return res.json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    // Get purchase data for this course
    const purchases = await Purchase.find({
      courseId: courseId,
      status: 'completed'
    });

    // Calculate total earnings for this course
    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    // Get student progress data
    const studentProgress = [];
    for (const student of course.enrolledStudents) {
      const progress = await CourseProgress.findOne({
        userId: student._id,
        courseId: courseId
      });
      
      studentProgress.push({
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          imageUrl: student.imageUrl
        },
        progress: progress ? {
          completedLectures: progress.lectureCompleted.length,
          totalLectures: course.courseContent.reduce((total, chapter) => 
            total + chapter.chapterContent.length, 0),
          completionPercentage: progress.lectureCompleted.length / 
            course.courseContent.reduce((total, chapter) => 
              total + chapter.chapterContent.length, 0) * 100
        } : null
      });
    }

    // Calculate average rating
    const averageRating = course.courseRatings.length > 0
      ? course.courseRatings.reduce((sum, rating) => sum + rating.rating, 0) / course.courseRatings.length
      : 0;

    res.json({
      success: true,
      analytics: {
        course: {
          title: course.courseTitle,
          totalStudents: course.enrolledStudents.length,
          averageRating: averageRating.toFixed(1),
          totalEarnings,
          isPublished: course.isPublished,
          createdAt: course.createdAt
        },
        studentProgress,
        recentPurchases: purchases.slice(0, 10).map(purchase => ({
          amount: purchase.amount,
          date: purchase.createdAt,
          status: purchase.status
        }))
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// Add Chapter to Course
export const addChapter = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterTitle } = req.body;
    const educator = req.auth.userId;

    if (!chapterTitle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chapter title is required' 
      });
    }

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    const newChapter = {
      chapterId: nanoid(),
      chapterOrder: course.courseContent.length + 1,
      chapterTitle: chapterTitle,
      chapterContent: []
    };

    course.courseContent.push(newChapter);
    await course.save();

    res.json({ 
      success: true, 
      message: 'Chapter added successfully',
      chapter: newChapter,
      course 
    });
  } catch (error) {
    console.error('Add chapter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update Chapter
export const updateChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { chapterTitle } = req.body;
    const educator = req.auth.userId;

    if (!chapterTitle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chapter title is required' 
      });
    }

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chapter not found' 
      });
    }

    chapter.chapterTitle = chapterTitle;
    await course.save();

    res.json({ 
      success: true, 
      message: 'Chapter updated successfully',
      chapter,
      course 
    });
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Chapter
export const deleteChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const educator = req.auth.userId;

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    const chapterIndex = course.courseContent.findIndex(ch => ch.chapterId === chapterId);
    if (chapterIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chapter not found' 
      });
    }

    // Remove the chapter
    course.courseContent.splice(chapterIndex, 1);
    
    // Reorder remaining chapters
    course.courseContent.forEach((chapter, index) => {
      chapter.chapterOrder = index + 1;
    });

    await course.save();

    res.json({ 
      success: true, 
      message: 'Chapter deleted successfully',
      course 
    });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Lecture to Chapter
export const addLecture = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { 
      lectureTitle, 
      lectureDuration, 
      lectureUrl, 
      isPreviewFree 
    } = req.body;
    const educator = req.auth.userId;

    // Validate required fields
    if (!lectureTitle || !lectureDuration || !lectureUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'All lecture fields are required' 
      });
    }

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chapter not found' 
      });
    }

    const newLecture = {
      lectureId: nanoid(),
      lectureTitle,
      lectureDuration: Number(lectureDuration),
      lectureUrl,
      isPreviewFree: isPreviewFree || false,
      lectureOrder: chapter.chapterContent.length + 1
    };

    chapter.chapterContent.push(newLecture);
    await course.save();

    res.json({ 
      success: true, 
      message: 'Lecture added successfully',
      lecture: newLecture,
      course 
    });
  } catch (error) {
    console.error('Add lecture error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Lecture
export const updateLecture = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId } = req.params;
    const { 
      lectureTitle, 
      lectureDuration, 
      lectureUrl, 
      isPreviewFree 
    } = req.body;
    const educator = req.auth.userId;

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chapter not found' 
      });
    }

    const lecture = chapter.chapterContent.find(lec => lec.lectureId === lectureId);
    if (!lecture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lecture not found' 
      });
    }

    // Update fields if provided
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (lectureDuration) lecture.lectureDuration = Number(lectureDuration);
    if (lectureUrl) lecture.lectureUrl = lectureUrl;
    if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree;

    await course.save();

    res.json({ 
      success: true, 
      message: 'Lecture updated successfully',
      lecture,
      course 
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Delete Lecture
export const deleteLecture = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId } = req.params;
    const educator = req.auth.userId;

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or unauthorized' 
      });
    }

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chapter not found' 
      });
    }

    const lectureIndex = chapter.chapterContent.findIndex(lec => lec.lectureId === lectureId);
    if (lectureIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lecture not found' 
      });
    }

    // Remove the lecture
    chapter.chapterContent.splice(lectureIndex, 1);
    
    // Reorder remaining lectures
    chapter.chapterContent.forEach((lecture, index) => {
      lecture.lectureOrder = index + 1;
    });

    await course.save();

    res.json({ 
      success: true, 
      message: 'Lecture deleted successfully',
      course 
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// <------------------------------------------------------------------------------------------------------------------>













