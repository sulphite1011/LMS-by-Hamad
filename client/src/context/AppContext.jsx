import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from '@clerk/clerk-react'
export const AppContext = createContext();
import axios from 'axios';
import { toast } from 'react-toastify'


export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [educatorCourses, setEducatorCourses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState({
    courses: true,
    user: true,
    dashboard: true
  });

  const { getToken } = useAuth();
  const { user } = useUser();

  // Function to calculate average rating of course
  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0
    course.courseRatings.forEach(rating => {
      totalRating += rating.rating
    })
    return Math.floor(totalRating / course.courseRatings.length)
  }

  // Function to Calculate Course Chapter Time
  const calculateChapterTime = (chapter) => {
    if (!chapter.chapterContent) return "0 min";
    let time = 0
    chapter.chapterContent.forEach((lecture) => time += lecture.lectureDuration)
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  // Function to Calculate Course Duration
  const calculateCourseDuration = (course) => {
    if (!course.courseContent) return "0 min";
    let time = 0
    course.courseContent.forEach((chapter) => 
      chapter.chapterContent.forEach(
        (lecture) => time += lecture.lectureDuration
      )
    )
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  // Function calculate to No of Lectures in the course
  const calculateNoOfLectures = (course) => {
    if (!course.courseContent) return 0;
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  }

  // fetch all courses
  const fetchAllCourses = async () => {
    try {
      setLoading(prev => ({...prev, courses: true}));
      const { data } = await axios.get(backendUrl + '/api/course/all');
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Server error"
      );
    } finally {
      setLoading(prev => ({...prev, courses: false}));
    }
  };

  // Fetch UserData
  const fetchUserData = async () => {
    try {
      setLoading(prev => ({...prev, user: true}));
      if (!user) return;
      
      // Check if user is educator
      if (user.publicMetadata?.role === 'educator') {
        setIsEducator(true);
      }
      
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(prev => ({...prev, user: false}));
    }
  };

  // Fetch User enrolled courses 
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse())
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Fetch Educator Courses
  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setEducatorCourses(data.courses);
        return data.courses;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      toast.error(error.message);
      return [];
    }
  };

  // Fetch Educator Dashboard Data
  const fetchEducatorDashboard = async () => {
    try {
      setLoading(prev => ({...prev, dashboard: true}));
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(prev => ({...prev, dashboard: false}));
    }
  };

  // Update educator role
  const updateToEducator = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setIsEducator(true);
        toast.success(data.message);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  // CRUD Operations for Courses
  const addCourse = async (courseData, thumbnailFile) => {
    try {
      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', thumbnailFile);

      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success(data.message);
        // Refresh courses list
        await fetchEducatorCourses();
        return { success: true, course: data.course };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to add course');
      return { success: false, message: error.message };
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete(backendUrl + `/api/educator/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message);
        // Refresh courses list
        await fetchEducatorCourses();
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete course');
      return { success: false, message: error.message };
    }
  };

  const togglePublishCourse = async (courseId, isPublished) => {
    try {
      const token = await getToken();
      const { data } = await axios.patch(backendUrl + `/api/educator/course/${courseId}/publish`, 
        { isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        // Refresh courses list
        await fetchEducatorCourses();
        return { success: true, course: data.course };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update course');
      return { success: false, message: error.message };
    }
  };

  // Get single course for editing
  const getCourseForEditing = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + `/api/educator/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        return { success: true, course: data.course };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  // Update course
  const updateCourse = async (courseId, courseData, thumbnailFile) => {
    try {
      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      if (thumbnailFile) {
        formData.append('image', thumbnailFile);
      }

      const token = await getToken();
      const { data } = await axios.put(backendUrl + `/api/educator/course/${courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success(data.message);
        // Refresh courses list
        await fetchEducatorCourses();
        return { success: true, course: data.course };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update course');
      return { success: false, message: error.message };
    }
  };

  // Get enrolled students
  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/enrolled-students', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        return { success: true, students: data.enrolledStudents };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  // Get course analytics
  const fetchCourseAnalytics = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + `/api/educator/course/${courseId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        return { success: true, analytics: data.analytics };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  // Calculate course earnings
  const calculateCourseEarnings = (course) => {
    if (!course || !course.enrolledStudents || !course.coursePrice) return 0;
    const actualPrice = course.coursePrice - (course.discount * course.coursePrice / 100);
    return (course.enrolledStudents.length * actualPrice).toFixed(2);
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  useEffect(() => {
    if (isEducator && user) {
      fetchEducatorCourses();
      fetchEducatorDashboard();
    }
  }, [isEducator, user]);

  const value = {
    currency, 
    allCourses, 
    navigate, 
    calculateRating, 
    isEducator, 
    setIsEducator, 
    calculateChapterTime, 
    calculateCourseDuration, 
    calculateNoOfLectures, 
    enrolledCourses, 
    fetchUserEnrolledCourses, 
    backendUrl, 
    userData, 
    setUserData, 
    getToken, 
    fetchAllCourses,
    educatorCourses,
    dashboardData,
    updateToEducator,
    addCourse,
    deleteCourse,
    togglePublishCourse,
    getCourseForEditing,
    updateCourse,
    fetchEducatorCourses,
    fetchEducatorDashboard,
    fetchEnrolledStudents,
    fetchCourseAnalytics,
    calculateCourseEarnings,
    loading
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};