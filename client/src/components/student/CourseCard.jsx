import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets.js';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);
  
  // Add safe checks for null/undefined values
  const educatorName = course?.educator?.name || 'Unknown Educator';
  const rating = calculateRating(course) || 0;
  const courseRatingsLength = course?.courseRatings?.length || 0;
  const courseTitle = course?.courseTitle || 'Untitled Course';
  const courseThumbnail = course?.courseThumbnail || 'https://via.placeholder.com/300x200?text=No+Image';
  const coursePrice = course?.coursePrice || 0;
  const discount = course?.discount || 0;
  const courseId = course?._id || '';

  // Calculate discounted price safely
  const discountedPrice = coursePrice - (discount * coursePrice / 100);
  
  return (
    <Link to={'/course/' + courseId} onClick={() => scrollTo(0, 0)}
      className='border border-gray-300/50 pb-6 overflow-hidden rounded-lg'>
      
      {/* Add error handling for image */}
      <img 
        className='w-full h-48 object-cover' 
        src={courseThumbnail} 
        alt={courseTitle}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
        }}
      />
      
      <div className='p-3 text-left'>
        <h3 className='text-base font-semibold truncate'>{courseTitle}</h3>
        <p className='text-gray-500 truncate'>{educatorName}</p>
        
        <div className='flex items-center space-x-2'>
          <p>{rating.toFixed(1)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <img 
                key={i} 
                src={i < Math.floor(rating) ? assets.star : assets.star_blank} 
                alt="star" 
                className='w-3.5 h-3.5' 
              />
            ))}
          </div>
          <p className='text-gray-500'>({courseRatingsLength})</p>
        </div>
        
        <p className='text-base font-semibold text-gray-800'>
          {currency}{discountedPrice.toFixed(2)}
        </p>
        
        {/* Show original price if there's a discount */}
        {discount > 0 && coursePrice > 0 && (
          <p className='text-sm text-gray-500 line-through'>
            {currency}{coursePrice.toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  )
}

export default CourseCard

