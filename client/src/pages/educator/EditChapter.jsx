// src/pages/educator/EditChapter.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import courseService from '../../services/courseService';
import Loading from '../../components/student/Loading';
import Footer from '../../components/student/Footer';

const EditChapter = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);

  const [formData, setFormData] = useState({
    chapterTitle: ''
  });

  useEffect(() => {
    const fetchChapter = async () => {
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
          
          if (courseData.courseContent && Array.isArray(courseData.courseContent)) {
            const foundChapter = courseData.courseContent.find(
              chap => chap._id === chapterId || chap.chapterId === chapterId
            );
            
            if (foundChapter) {
              setChapter(foundChapter);
              setFormData({
                chapterTitle: foundChapter.chapterTitle || ''
              });
            } else {
              toast.error('Chapter not found');
              setTimeout(() => navigate(`/educator/manage-course/${courseId}`), 2000);
            }
          } else {
            toast.error('Course content not found');
            setTimeout(() => navigate(`/educator/manage-course/${courseId}`), 2000);
          }
        } else {
          toast.error(data.message || 'Failed to load course');
          setTimeout(() => navigate('/educator/my-courses'), 2000);
        }
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message || 'Failed to load chapter'}`);
        setTimeout(() => navigate(`/educator/manage-course/${courseId}`), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [courseId, chapterId, navigate, getToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.chapterTitle.trim()) {
      toast.warning('Chapter title is required');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      
      // Call the update chapter API
      const result = await courseService.updateChapter(
        courseId, 
        chapterId, 
        formData, 
        token
      );
      
      if (result.success) {
        toast.success('Chapter updated successfully');
        navigate(`/educator/manage-course/${courseId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update chapter');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!chapter) return <div className="text-center py-20">Chapter not found</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Chapter</h1>
            <p className="text-gray-600">Update chapter details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3">Chapter Title *</label>
              <input
                type="text"
                value={formData.chapterTitle}
                onChange={(e) => setFormData({...formData, chapterTitle: e.target.value})}
                className="w-full px-4 py-3.5 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chapter title"
                required
              />
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
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

export default EditChapter;