import React from 'react'
import Hero from '../../components/student/Hero.jsx'
import Companies from '../../components/student/Companies.jsx'
import CoursesSection from '../../components/student/CourcesSection.jsx'
import TestimonialSection from '../../components/student/TestimonialSection.jsx'
import CallToAction from '../../components/student/CallToAction.jsx'
import Footer from '../../components/student/Footer.jsx'
const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
    <Hero/>
    <Companies/>
    <CoursesSection/> 
    <TestimonialSection />
    <CallToAction/>
    <Footer/>
    </div>
  )
}

export default Home