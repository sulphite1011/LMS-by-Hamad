import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

const MyCourses = () => {
  const { 
    currency, 
    backendUrl, 
    getToken, 
    isEducator, 
    educatorCourses,
    fetchEducatorCourses,
    deleteCourse,
    togglePublishCourse,
    calculateCourseEarnings,
    navigate
  } = useContext(AppContext);
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const result = await fetchEducatorCourses();
      if (result && Array.isArray(result)) {
        setCourses(result);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchCourses();
    }
  }, [isEducator]);

  const handleDeleteCourse = async (courseId, courseTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(prev => ({...prev, [courseId]: 'deleting'}));
    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        // Courses list is automatically refreshed in the context
      }
    } finally {
      setActionLoading(prev => ({...prev, [courseId]: false}));
    }
  };

  const handleTogglePublish = async (courseId, currentStatus, courseTitle, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({...prev, [courseId]: 'publishing'}));
    try {
      await togglePublishCourse(courseId, !currentStatus);
    } finally {
      setActionLoading(prev => ({...prev, [courseId]: false}));
    }
  };

  const handleEditCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/educator/edit-course/${courseId}`);
  };

  const handleViewCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/course/${courseId}`);
  };

  const handleManageCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/educator/manage-course/${courseId}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">Manage and track all your published courses</p>
        </div>

        {/* Add Course Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/educator/add-course')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create New Course
          </button>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Courses Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start creating your first course and share your knowledge with students worldwide.
            </p>
            <button
              onClick={() => navigate('/educator/add-course')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Course</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Earnings</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Students</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr 
                      key={course._id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/educator/manage-course/${course._id}`)}
                    >
                      {/* Course Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={course.courseThumbnail || 'https://via.placeholder.com/80x45'} 
                            alt={course.courseTitle}
                            className="w-20 h-12 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900 truncate max-w-xs">
                              {course.courseTitle}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Price */}
                      <td className="py-4 px-6">
                        <div className="text-gray-900">
                          <span className="font-medium">{currency}{course.coursePrice}</span>
                          {course.discount > 0 && (
                            <span className="text-sm text-green-600 ml-2">
                              ({course.discount}% off)
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Earnings */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {currency}{calculateCourseEarnings(course)}
                        </span>
                      </td>
                      
                      {/* Students */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="text-gray-700">{course.enrolledStudents?.length || 0}</span>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={(e) => handleViewCourse(course._id, e)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="View Course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={(e) => handleEditCourse(course._id, e)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Edit Course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                          
                          {/* Manage Button */}
                          <button
                            onClick={(e) => handleManageCourse(course._id, e)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Manage Course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                            </svg>
                          </button>
                          
                          {/* Publish/Unpublish Button */}
                          <button
                            onClick={(e) => handleTogglePublish(course._id, course.isPublished, course.courseTitle, e)}
                            disabled={actionLoading[course._id] === 'publishing'}
                            className={`p-2 rounded ${
                              course.isPublished 
                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            } ${actionLoading[course._id] === 'publishing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                          >
                            {actionLoading[course._id] === 'publishing' ? (
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : course.isPublished ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteCourse(course._id, course.courseTitle, e)}
                            disabled={actionLoading[course._id] === 'deleting'}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Course"
                          >
                            {actionLoading[course._id] === 'deleting' ? (
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {courses.map((course) => (
                <div 
                  key={course._id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/educator/manage-course/${course._id}`)}
                >
                  {/* Course Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={course.courseThumbnail || 'https://via.placeholder.com/80x45'} 
                      alt={course.courseTitle}
                      className="w-20 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {course.courseTitle}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          course.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center border-t border-gray-100 pt-4">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="font-medium text-gray-900">
                        {currency}{course.coursePrice}
                        {course.discount > 0 && (
                          <span className="text-xs text-green-600 ml-1">({course.discount}% off)</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Earnings</div>
                      <div className="font-medium text-gray-900">
                        {currency}{calculateCourseEarnings(course)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Students</div>
                      <div className="font-medium text-gray-900">
                        {course.enrolledStudents?.length || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleViewCourse(course._id, e)}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => handleEditCourse(course._id, e)}
                      className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleManageCourse(course._id, e)}
                      className="text-sm text-green-600 hover:text-green-800 px-3 py-1.5 hover:bg-green-50 rounded"
                    >
                      Manage
                    </button>
                    <button
                      onClick={(e) => handleTogglePublish(course._id, course.isPublished, course.courseTitle, e)}
                      disabled={actionLoading[course._id] === 'publishing'}
                      className={`text-sm px-3 py-1.5 rounded ${
                        course.isPublished 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      } ${actionLoading[course._id] === 'publishing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={(e) => handleDeleteCourse(course._id, course.courseTitle, e)}
                      disabled={actionLoading[course._id] === 'deleting'}
                      className="text-sm text-red-600 hover:text-red-800 px-3 py-1.5 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourses;