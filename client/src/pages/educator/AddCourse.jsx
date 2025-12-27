import React, { useContext, useEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import Quill from 'quill'
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { backendUrl, getToken } = useContext(AppContext);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // ADDED: Loading state

  const handleChapter = (action, chapterId) => {
    if (action == 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: nanoid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action == 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action == 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
            lectureId: nanoid()
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      
      // Prevent multiple submissions
      if (isSubmitting) {
        toast.warn('Please wait, course is being added...');
        return;
      }
      
      setIsSubmitting(true); // Set loading state

      if (!image) {
        toast.error('Thumbnail Not Selected');
        setIsSubmitting(false);
        return;
      }

      if (chapters.length === 0) {
        toast.error('Please add at least one chapter');
        setIsSubmitting(false);
        return;
      }

      // Validate all chapters have lectures
      for (const chapter of chapters) {
        if (chapter.chapterContent.length === 0) {
          toast.error(`Chapter "${chapter.chapterTitle}" has no lectures`);
          setIsSubmitting(false);
          return;
        }
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
        isPublished: true
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);

      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/educator/add-course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success('Course added successfully!');
        // Reset form
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        if (quillRef.current) {
          quillRef.current.root.innerHTML = '';
        }
        
        // Shorter, reasonable wait for feedback
        setTimeout(() => {
          navigate('/educator/my-courses');
        }, 1500);
      } else {
        toast.error(data.message);
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error('Error adding course:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add course');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Initiates Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input 
            onChange={e => setCourseTitle(e.target.value)} 
            value={courseTitle} 
            type="text" 
            placeholder='Type here' 
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' 
            required 
            disabled={isSubmitting} // Disable during submission
          />
        </div>
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div 
            ref={editorRef} 
            className={isSubmitting ? 'opacity-50' : ''} // Dim during submission
          ></div>
        </div>

        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input 
              onChange={e => setCoursePrice(e.target.value)} 
              value={coursePrice} 
              type="number" 
              placeholder='0' 
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' 
              required 
              disabled={isSubmitting}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <p>Discount %</p>
            <input 
              onChange={e => setDiscount(e.target.value)} 
              value={discount} 
              type="number" 
              placeholder='0' 
              min={0} 
              max={100} 
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' 
              required 
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className='flex md:flex-row flex-col items-center gap-3'>
          <p>Course Thumbnail</p>
          <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
            <img 
              src={assets.file_upload_icon} 
              alt="" 
              className={`p-3 rounded ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 cursor-pointer'}`}
            />
            <input 
              type="file" 
              id='thumbnailImage' 
              onChange={e => setImage(e.target.files[0])} 
              accept="image/*" 
              hidden 
              disabled={isSubmitting}
            />
            <img className='max-h-10' src={image ? URL.createObjectURL(image) : ''} alt="" />
          </label>
        </div>

        {/* Adding Chapters & Lectures */}
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className={`bg-white border rounded-lg mb-4 ${isSubmitting ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center p-4 border-b">
                <div className='flex items-center'>
                  <img 
                    onClick={() => !isSubmitting && handleChapter('toggle', chapter.chapterId)} 
                    src={assets.dropdown_icon} 
                    width={14} 
                    alt="" 
                    className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"} ${isSubmitting ? 'cursor-not-allowed' : ''}`} 
                  />
                  <span className="font-semibold">{chapterIndex + 1} {chapter.chapterTitle}</span>
                </div>
                <span className='text-gray-500'>{chapter.chapterContent.length} Lectures</span>
                <img 
                  onClick={() => !isSubmitting && handleChapter('remove', chapter.chapterId)} 
                  src={assets.cross_icon} 
                  alt="" 
                  className={`cursor-pointer ${isSubmitting ? 'cursor-not-allowed' : ''}`} 
                />
              </div>
              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="flex justify-between items-center mb-2">
                      <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins - <a href={lecture.lectureUrl} target="_blank" className="text-blue-500">Link</a> - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
                      <img 
                        src={assets.cross_icon} 
                        alt="" 
                        className={`cursor-pointer ${isSubmitting ? 'cursor-not-allowed' : ''}`} 
                        onClick={() => !isSubmitting && handleLecture('remove', chapter.chapterId, lectureIndex)} 
                      />
                    </div>
                  ))}
                  <div 
                    className={`inline-flex p-2 rounded cursor-pointer mt-2 ${isSubmitting ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'}`}
                    onClick={() => !isSubmitting && handleLecture('add', chapter.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
          <div 
            className={`flex justify-center items-center p-2 rounded-lg cursor-pointer ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-100'}`}
            onClick={() => !isSubmitting && handleChapter('add')}
          >
            + Add Chapter
          </div>
        </div>

        {showPopup && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
            <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
              <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>

              <div className="mb-2">
                <p>Lecture Title</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-2">
                <p>Duration (minutes)</p>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-2">
                <p>Lecture URL</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2 my-4">
                <p>Is Preview Free?</p>
                <input
                  type="checkbox" 
                  className='mt-1 scale-125'
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  className={`flex-1 px-4 py-2 rounded ${isSubmitting ? 'bg-gray-400' : 'bg-blue-400 hover:bg-blue-500'} text-white`} 
                  onClick={addLecture}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                  onClick={() => setShowPopup(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
              <img 
                onClick={() => !isSubmitting && setShowPopup(false)} 
                src={assets.cross_icon} 
                className='absolute top-4 right-4 w-4 cursor-pointer' 
                alt="" 
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className={`w-max py-2.5 px-8 rounded my-4 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} text-white`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : (
            'ADD'
          )}
        </button>
      </form>
    </div>
  )
}

export default AddCourse