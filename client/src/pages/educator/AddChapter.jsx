// src/pages/educator/AddChapter.jsx
import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import courseService from '../../services/courseService';

const AddChapter = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chapterTitle: '',
    chapterDescription: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.chapterTitle.trim()) {
      toast.warning('Chapter title is required');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const result = await courseService.addChapter(courseId, formData, token);
      
      if (result.success) {
        toast.success('Chapter added successfully');
        navigate(`/educator/manage-course/${courseId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/educator/manage-course/${courseId}`)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Manage Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Chapter</h1>
          <p className="text-gray-600">Add a new chapter to organize your course content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <label className="block text-lg font-medium text-gray-900 mb-3">Chapter Description</label>
            <textarea
              value={formData.chapterDescription}
              onChange={(e) => setFormData({...formData, chapterDescription: e.target.value})}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
              placeholder="Describe what this chapter covers..."
            />
          </div>

          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Chapter...' : 'Add Chapter'}
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
  );
};

export default AddChapter;