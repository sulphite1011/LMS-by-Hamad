// src/pages/educator/EditCourse.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import courseService from '../../services/courseService';
import Loading from '../../components/student/Loading';
import Footer from '../../components/student/Footer';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [formData, setFormData] = useState({
    courseTitle: '',
    courseDescription: '',
    coursePrice: 0,
    discount: 0,
    isPublished: true
  });

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
          setFormData({
            courseTitle: courseData.courseTitle || '',
            courseDescription: courseData.courseDescription || '',
            coursePrice: courseData.coursePrice || 0,
            discount: courseData.discount || 0,
            isPublished: courseData.isPublished || false
          });
          setThumbnailPreview(courseData.courseThumbnail || '');
          toast.success('Course loaded successfully');
        } else {
          toast.error(data.message || 'Failed to load course');
        }

      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message || 'Failed to load course'}`);

        if (error.response?.status === 404) {
          setTimeout(() => navigate('/educator/my-courses'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate, getToken]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseTitle.trim() || !formData.courseDescription.trim()) {
      toast.warning('Please fill in all required fields');
      return;
    }

    if (formData.coursePrice <= 0) {
      toast.warning('Course price must be greater than 0');
      return;
    }

    if (formData.discount < 0 || formData.discount > 100) {
      toast.warning('Discount must be between 0 and 100');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      const updateData = {
        ...formData,
        thumbnail: thumbnailFile
      };

      const result = await courseService.updateCourse(courseId, updateData, token);

      if (result.success) {
        toast.success('Course updated successfully');
        navigate(`/educator/manage-course/${courseId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
            <p className="text-gray-600">Update your course information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">Course Title *</label>
              <input
                type="text"
                value={formData.courseTitle}
                onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                className="w-full px-4 py-3.5 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">Course Description *</label>
              <textarea
                value={formData.courseDescription}
                onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
                placeholder="Describe your course in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-3">Course Price ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.coursePrice}
                  onChange={(e) => setFormData({ ...formData, coursePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3.5 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-3">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3.5 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-2">Enter percentage discount (0-100)</p>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">Course Thumbnail</label>
              <div className="space-y-4">
                {thumbnailPreview && (
                  <div className="relative max-w-md">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-64 object-cover rounded-xl border border-gray-300"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    Change Thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-600 text-sm">
                    Recommended: 1280x720px (16:9 ratio)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="publish"
              />
              <label htmlFor="publish" className="ml-3 text-lg font-medium text-gray-900">
                Publish course
              </label>
            </div>

            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/educator/manage-course/${courseId}`)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-4 rounded-xl text-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditCourse;
