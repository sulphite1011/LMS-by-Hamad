import axios from "axios";

// Vite environment variable
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const courseService = {
  // Get all educator courses
  async getEducatorCourses(token) {
    const response = await axios.get(`${API_URL}/api/educator/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get single course for editing
  async getCourseById(courseId, token = null) {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const response = await axios.get(
      `${API_URL}/api/educator/course/${courseId}`,
      config
    );
    return response.data;
  },

  // Add new course
  async addCourse(courseData, token) {
    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData));
    if (courseData.thumbnail) {
      formData.append("image", courseData.thumbnail);
    }

    const response = await axios.post(
      `${API_URL}/api/educator/add-course`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Update course
  async updateCourse(courseId, courseData, token) {
    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData));
    if (courseData.thumbnail) {
      formData.append("image", courseData.thumbnail);
    }

    const response = await axios.put(
      `${API_URL}/api/educator/course/${courseId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete course
  async deleteCourse(courseId, token) {
    const response = await axios.delete(
      `${API_URL}/api/educator/course/${courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  // Toggle publish status
  async togglePublish(courseId, isPublished, token) {
    const response = await axios.patch(
      `${API_URL}/api/educator/course/${courseId}/publish`,
      { isPublished },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Add chapter
  async addChapter(courseId, chapterData, token) {
    const response = await axios.post(
      `${API_URL}/api/educator/course/${courseId}/chapters`,
      chapterData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Update chapter ✅ FIXED


  // Delete chapter
  async deleteChapter(courseId, chapterId, token) {
    const response = await axios.delete(
      `${API_URL}/api/educator/course/${courseId}/chapters/${chapterId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Add lecture
  async addLecture(courseId, chapterId, lectureData, token) {
    const response = await axios.post(
      `${API_URL}/api/educator/course/${courseId}/chapters/${chapterId}/lectures`,
      lectureData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Update lecture
  async updateLecture(courseId, chapterId, lectureId, lectureData, token) {
    const response = await axios.put(
      `${API_URL}/api/educator/course/${courseId}/chapters/${chapterId}/lectures/${lectureId}`,
      lectureData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete lecture
  async deleteLecture(courseId, chapterId, lectureId, token) {
    const response = await axios.delete(
      `${API_URL}/api/educator/course/${courseId}/chapters/${chapterId}/lectures/${lectureId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get course analytics
  async getCourseAnalytics(courseId, token) {
    const response = await axios.get(
      `${API_URL}/api/educator/course/${courseId}/analytics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get educator dashboard
  async getEducatorDashboard(token) {
    const response = await axios.get(
      `${API_URL}/api/educator/dashboard`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get enrolled students
  async getEnrolledStudents(token) {
    const response = await axios.get(
      `${API_URL}/api/educator/enrolled-students`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
  async updateChapter(courseId, chapterId, chapterData, token) {
    const response = await axios.put(
      `${API_URL}/api/educator/course/${courseId}/chapters/${chapterId}`,
      chapterData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default courseService;
