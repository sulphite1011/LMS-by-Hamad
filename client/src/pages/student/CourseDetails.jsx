import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';
import YouTube from 'react-youtube';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetails = () => {
  const { id } = useParams()
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const { 
    allCourses, 
    calculateRating, 
    calculateChapterTime, 
    calculateCourseDuration, 
    calculateNoOfLectures, 
    currency, 
    backendUrl, 
    userData, 
    getToken 
  } = useContext(AppContext)

  // Fetch course data from API
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle course enrollment
  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn('Login to Enroll');
      }
      if (isAlreadyEnrolled) {
        return toast.warn('Already Enrolled');
      }
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/purchase', 
        { courseId: courseData._id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        const { session_url } = data
        window.location.replace(session_url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return '';
    // Remove query parameters first
    const cleanUrl = url.split('?')[0];
    // Get the video ID
    return cleanUrl.split('/').pop();
  }

  // Initialize - fetch course data
  useEffect(() => {
    fetchCourseData();
  }, []);

  // Check if user is already enrolled
  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);

  // Toggle chapter sections open/closed
  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  return courseData ? (
    <>
      {/* Main Container - Made fully responsive */}
      <div className='flex flex-col lg:flex-row gap-6 lg:gap-10 relative px-4 md:px-8 lg:px-36 pt-6 md:pt-24 lg:pt-30'>
        
        {/* Background gradient */}
        <div className='absolute top-0 left-0 w-full h-64 lg:h-section-height -z-10 bg-gradient-to-b from-cyan-100/70'></div>

        {/* ========== LEFT COLUMN - Course Content ========== */}
        <div className='lg:flex-1 lg:max-w-2xl z-10 text-gray-500'>
          
          {/* Course Title */}
          <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800'>
            {courseData.courseTitle}
          </h1>
          
          {/* Course Description Preview */}
          <p 
            className='pt-4 md:text-base text-sm' 
            dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}
          ></p>

          {/* Ratings & Info */}
          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (
                <img 
                  key={i} 
                  src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} 
                  alt="star" 
                  className='w-3.5 h-3.5' 
                />
              ))}
            </div>
            <p className='text-blue-600'>
              ({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})
            </p>
            <p>
              {courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}
            </p>
          </div>
          
          {/* Educator Info */}
          <p className='text-sm'>
            Course by <span className='text-blue-600 underline'>{courseData.educator.name}</span>
          </p>

          {/* Course Structure */}
          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5'>
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className='border border-gray-300 bg-white mb-2 rounded-lg'>
                  {/* Chapter Header */}
                  <div 
                    className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' 
                    onClick={() => toggleSection(index)}
                  >
                    <div className='flex items-center gap-2'>
                      <img 
                        className={`w-4 h-4 transition-transform duration-300 ${openSection[index] ? 'rotate-180' : ''}`}
                        src={assets.down_arrow_icon} 
                        alt="toggle chapter" 
                      />
                      <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-default'>
                      {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  {/* Chapter Content (Collapsible) */}
                  <div className={`overflow-hidden transition-all duration-300 ${openSection[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className='flex items-start gap-2 py-1'>
                          <img src={assets.play_icon} alt="play" className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() => setPlayerData({
                                    videoId: extractYouTubeId(lecture.lectureUrl),
                                    lectureTitle: lecture.lectureTitle
                                  })}
                                  className='text-blue-500 cursor-pointer hover:text-blue-700'
                                >
                                  Preview
                                </p>
                              )}
                              <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Course Description */}
          <div className='py-10 lg:py-20 text-sm md:text-default'>
            <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
            <p 
              className='pt-3 rich-text' 
              dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
            ></p>
          </div>

        </div>

        {/* ========== RIGHT COLUMN - Thumbnail & Enrollment Card ========== */}
        {/* FIXED: Made fully responsive with proper thumbnail sizing */}
        <div className='w-full lg:w-96 lg:sticky lg:top-24 z-10'>
          <div className='w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'>
            
            {/* Thumbnail/Video Player - FIXED RESPONSIVENESS */}
            <div className='w-full aspect-video overflow-hidden bg-gray-100'>
              {playerData ? (
                <YouTube
                  videoId={playerData.videoId}
                  opts={{
                    playerVars: {
                      autoplay: 1
                    }
                  }}
                  iframeClassName='w-full h-full'
                  onError={(e) => {
                    console.error("YouTube player error:", e);
                    toast.error("Could not load preview video");
                    setPlayerData(null);
                  }}
                />
              ) : (
                <img 
                  src={courseData.courseThumbnail} 
                  alt={courseData.courseTitle}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.src = 'https://via.placeholder.com/800x450?text=Course+Thumbnail';
                    e.target.className = 'w-full h-full object-contain bg-gray-200 p-4';
                  }}
                />
              )}
            </div>
            
            {/* Enrollment Card Content */}
            <div className='p-5'>
              {/* Limited Time Offer */}
              <div className='flex items-center gap-2'>
                <img className='w-4' src={assets.time_left_clock_icon} alt="time left" />
                <p className='text-sm text-red-500'>
                  <span className='font-medium'>5 days</span> left at this price!
                </p>
              </div>
              
              {/* Pricing */}
              <div className='flex flex-wrap gap-3 items-center pt-2'>
                <p className='text-gray-800 text-2xl lg:text-3xl font-bold'>
                  {currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}
                </p>
                <p className='text-lg text-gray-500 line-through'>
                  {currency}{courseData.coursePrice}
                </p>
                <p className='text-lg text-gray-500'>{courseData.discount}% off</p>
              </div>

              {/* Course Stats */}
              <div className='flex items-center text-sm md:text-default gap-4 pt-4 text-gray-500'>
                <div className='flex items-center gap-1'>
                  <img src={assets.star} alt="rating" className='w-4 h-4' />
                  <p>{calculateRating(courseData)}</p>
                </div>

                <div className='h-4 w-px bg-gray-500/40'></div>

                <div className='flex items-center gap-1'>
                  <img src={assets.time_clock_icon} alt="duration" className='w-4 h-4' />
                  <p>{calculateCourseDuration(courseData)}</p>
                </div>
                
                <div className='h-4 w-px bg-gray-500/40'></div>

                <div className='flex items-center gap-1'>
                  <img src={assets.lesson_icon} alt="lessons" className='w-4 h-4' />
                  <p>{calculateNoOfLectures(courseData)} lessons</p>
                </div>
              </div>

              {/* Enroll Button */}
              <button 
                onClick={enrollCourse} 
                className='mt-6 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200'
              >
                {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
              </button>

              {/* Course Features */}
              <div className='pt-6'>
                <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the course?</p>
                <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500 space-y-1'>
                  <li>Lifetime access with free updates.</li>
                  <li>Step-by-step, hands-on project guidance.</li>
                  <li>Downloadable resources and source code.</li>
                  <li>Quizzes to test your knowledge.</li>
                  <li>Certificate of completion.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  ) : <Loading />
}

export default CourseDetails
