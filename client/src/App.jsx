import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollments from './pages/student/MyEnrollments'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'

import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/DashBoard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import Navbar from './components/student/Navbar'
import EditCourse from './pages/educator/EditCourse'
import EditLecture from './pages/educator/EditLecture'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import AddChapter from './pages/educator/AddChapter'
import ManageCourse from './pages/educator/ManageCourse'
import EditChapter from './pages/educator/EditChapter'

import "quill/dist/quill.snow.css";
import { ToastContainer } from 'react-toastify';

const App = () => {
  const isEducatorRoute = useMatch('/educator/*');

  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer />
      {!isEducatorRoute && <Navbar />}
      <Routes>
        {/* Student Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/course-list' element={<CoursesList />} />
        <Route path='/course-list/:input' element={<CoursesList />} />
        <Route path='/course/:id' element={<CourseDetails />} />
        <Route path='/my-enrollments' element={<MyEnrollments />} />
        <Route path='/player/:courseId' element={<Player />} />
        <Route path='/loading/:path' element={<Loading />} />

        {/* Educator Routes */}
        <Route path='/educator' element={<Educator />}>
          {/* Index route shows Dashboard when path is exactly /educator */}
          <Route index element={<Dashboard />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='edit-course/:courseId' element={<EditCourse />} />
          <Route path='edit-lecture/:courseId/:chapterId/:lectureId' element={<EditLecture />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
          <Route path='add-chapter/:courseId' element={<AddChapter />} />
          <Route path='manage-course/:courseId' element={<ManageCourse />} />
          <Route path='edit-chapter/:courseId/:chapterId' element={<EditChapter />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App


// app completed by video now its up to me