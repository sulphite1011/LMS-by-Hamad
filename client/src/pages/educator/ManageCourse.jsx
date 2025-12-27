// src/pages/educator/ManageCourse.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import courseService from '../../services/courseService';
import Loading from '../../components/student/Loading';

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        if (!token) {
          toast.error('Authentication required. Please login.');
          navigate('/login');
          return;
        }

        const data = await courseService.getCourseById(courseId, token);

        if (data.success) {
          const courseData = data.course || data.courseData || data.data || data;
          setCourse(courseData);
        } else {
          toast.error(data.message || 'Failed to load course');
          navigate('/educator/my-courses');
        }
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message || 'Failed to load course'}`);
        navigate('/educator/my-courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
    // In ManageCourse.jsx, add this after fetching course data:
    console.log('Course data:', course);
    console.log('Course ID:', courseId);

   
  }, [courseId, navigate, getToken]);

  // Replace the Edit link/button with this function
  // In ManageCourse.jsx, update the handleEditChapter function:
  const handleEditChapter = async (chapterId, chapterTitle) => {
    const newTitle = prompt('Enter new chapter title:', chapterTitle);

    if (newTitle && newTitle.trim() && newTitle !== chapterTitle) {
      try {
        const token = await getToken();

        // Debug: Log what IDs we're using
        console.log('Updating chapter with:', {
          courseId,
          chapterId,
          chapterTitle: newTitle
        });

        const result = await courseService.updateChapter(
          courseId,
          chapterId,
          { chapterTitle: newTitle },
          token
        );

        if (result.success) {
          toast.success('Chapter updated successfully');
          // Refresh course data
          const data = await courseService.getCourseById(courseId, token);
          if (data.success) {
            setCourse(data.course || data.courseData || data.data || data);
          }
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Update chapter error:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to update chapter');
      }
    }
  };

  // Add this function for editing lectures too
  const handleEditLecture = async (chapterId, lectureId, currentTitle) => {
    const newTitle = prompt('Enter new lecture title:', currentTitle);

    if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
      try {
        const token = await getToken();
        const result = await courseService.updateLecture(
          courseId,
          chapterId,
          lectureId,
          { lectureTitle: newTitle },
          token
        );

        if (result.success) {
          toast.success('Lecture updated successfully');
          // Refresh course data
          const data = await courseService.getCourseById(courseId, token);
          if (data.success) {
            setCourse(data.course || data.courseData || data.data || data);
          }
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to update lecture');
      }
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter? This will also delete all lectures in this chapter.')) {
      return;
    }

    try {
      const token = await getToken();
      const result = await courseService.deleteChapter(courseId, chapterId, token);

      if (result.success) {
        toast.success('Chapter deleted successfully');
        // Refresh course data
        const data = await courseService.getCourseById(courseId, token);
        if (data.success) {
          setCourse(data.course || data.courseData || data.data || data);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete chapter');
    }
  };

  const handleDeleteLecture = async (chapterId, lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) {
      return;
    }

    try {
      const token = await getToken();
      const result = await courseService.deleteLecture(courseId, chapterId, lectureId, token);

      if (result.success) {
        toast.success('Lecture deleted successfully');
        // Refresh course data
        const data = await courseService.getCourseById(courseId, token);
        if (data.success) {
          setCourse(data.course || data.courseData || data.data || data);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete lecture');
    }
  };

  // Add this function for adding lectures with prompt
  const handleAddLecture = async (chapterId) => {
    const lectureTitle = prompt('Enter lecture title:');
    if (!lectureTitle || !lectureTitle.trim()) return;

    const lectureDuration = prompt('Enter lecture duration (minutes):');
    if (!lectureDuration || isNaN(lectureDuration)) {
      toast.error('Please enter a valid duration');
      return;
    }

    const lectureUrl = prompt('Enter video URL (YouTube or direct link):');
    if (!lectureUrl || !lectureUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    const isPreviewFree = confirm('Is this a free preview lecture? (OK for Yes, Cancel for No)');

    try {
      const token = await getToken();
      const result = await courseService.addLecture(
        courseId,
        chapterId,
        {
          lectureTitle,
          lectureDuration: parseInt(lectureDuration),
          lectureUrl,
          isPreviewFree
        },
        token
      );

      if (result.success) {
        toast.success('Lecture added successfully');
        // Refresh course data
        const data = await courseService.getCourseById(courseId, token);
        if (data.success) {
          setCourse(data.course || data.courseData || data.data || data);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add lecture');
    }
  };

  if (loading) return <Loading />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Course</h1>
              <p className="text-gray-600 mt-1">{course.courseTitle}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/educator/edit-course/${courseId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Edit Course
              </Link>
              <Link
                to="/educator/my-courses"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Back to Courses
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Course Content
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Enrolled Students
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                <Link
                  to={`/educator/add-chapter/${courseId}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                >
                  + Add Chapter
                </Link>
              </div>
            </div>

            {/* Chapters List */}
            <div className="divide-y divide-gray-200">
              {course.courseContent && course.courseContent.length > 0 ? (
                course.courseContent.map((chapter, chapterIndex) => (
                  <div key={chapter._id || chapterIndex} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Chapter {chapterIndex + 1}: {chapter.chapterTitle}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{chapter.chapterDescription}</p>
                      </div>
                      <div className="flex gap-2">
                        {/* Changed from Link to button */}

                        <button
                          onClick={() => handleEditChapter(chapter.chapterId, chapter.chapterTitle)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.chapterId)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium"
                        >
                          Delete
                        </button>
                        {/* Changed from Link to button */}
                        <button
                          onClick={() => handleAddLecture(chapter.chapterId)} // Use chapter.chapterId
                          className="text-green-600 hover:text-green-800 px-3 py-1 text-sm font-medium"
                        >
                          + Add Lecture
                        </button>
                      </div>
                    </div>

                    {/* Lectures in this chapter */}
                    {chapter.chapterContent && chapter.chapterContent.length > 0 ? (
                      <div className="ml-6 border-l border-gray-200 pl-6 space-y-4">
                        {chapter.chapterContent.map((lecture, lectureIndex) => (
                          <div key={lecture._id || lectureIndex} className="flex items-center justify-between py-3">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-6">{lectureIndex + 1}.</span>
                                <h4 className="text-gray-800">{lecture.lectureTitle}</h4>
                                {lecture.isPreviewFree && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 ml-9">
                                <span className="text-sm text-gray-500">
                                  Duration: {lecture.lectureDuration} min
                                </span>
                                <span className="text-sm text-gray-500">
                                  Order: {lecture.lectureOrder}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {/* Added Edit button for lectures */}
                              <button
                                onClick={() => handleEditLecture(
                                  chapter.chapterId, // Use chapter.chapterId (nanoid)
                                  lecture.lectureId, // Use lecture.lectureId (nanoid)
                                  lecture.lectureTitle
                                )}
                                className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLecture(
                                  chapter.chapterId, // Use chapter.chapterId (nanoid)
                                  lecture.lectureId  // Use lecture.lectureId (nanoid)
                                )}
                                className="text-red-600 hover:text-red-800 px-3 py-1 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-6 border-l border-gray-200 pl-6 py-4">
                        <p className="text-gray-500 text-sm">No lectures added yet.</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters added yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first chapter to organize your course content.</p>
                  <Link
                    to={`/educator/add-chapter/${courseId}`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add First Chapter
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Enrolled Students</h3>
            <p className="text-gray-600 mb-6">
              This feature is coming soon. You'll be able to view all students enrolled in your course.
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Course Analytics</h3>
            <p className="text-gray-600 mb-6">
              This feature is coming soon. You'll be able to view detailed analytics about your course performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourse;