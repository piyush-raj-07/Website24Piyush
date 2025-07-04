import React, { useEffect,useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Blogs from "./components/blogs/Blogs.js";
//import BlogDetails from "./components/BlogDetails";
import TeamPage from "./components/Teampage";
import Activities from "./components/Activity/Activities";
import Navbar from "./components/Navbar";
import Loader from "./components/status_pages/Loader";
import NotFound from "./components/status_pages/NotFound";

import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import EmailVerificationPage from "./components/EmailVerificationPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import {
  RedirectAuthenticatedUser,
  RequireUnverifiedUser,
  ProtectedRoute,
} from "./utils/routeProtection";
import ProfilePage from "./components/ProfilePage";
import AdminPanel from "./components/AdminPanel";
import WriteBlog from "./components/WriteBlog";
import MyBlog from "./components/MyBlogs";
import EditBlog from "./components/EditBlog";
import ProjectTable from "./components/BTP/Project.js";
import Gallery from "./components/Gallery/Gallery.js";
import QuizPage from "./components/quiz/QuizPage";
import People from "./components/Peoples/People";
import ProfilePage2 from "./components/Peoples/PeopleProf.js";
import Intern from "./components/blogs/intern_blogs.js";
// import Study from "./components/Study.js";


function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const { isCheckingAuth, CheckAuth } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    CheckAuth();
  }, [CheckAuth]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-black flex justify-center items-center ">
        <Loader />
      </div>
    );
  }

  
  return (
    <Router>
      
      <div className="app" >
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }}></div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          {/* <Route path="/Study" element={<Study />} /> */}
          <Route path="/team" element={<TeamPage />} />
          <Route path="/Activities" element={<Activities />} />
          <Route path="/Blogs" element={<Blogs />} />
          <Route path="/Blogs/:id" element={<Intern />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/writeBlog" element={<WriteBlog />} />
          <Route path="/myblog" element={<MyBlog />} />
          <Route path="/edit/:id" element={<EditBlog />} />
          <Route path="/profile/:id" element={<ProfilePage2 />} />
          <Route path="/Gallery" element={<Gallery />} />
          <Route
            path="/btp"
            element={
              <ProtectedRoute>
                <ProjectTable />
              </ProtectedRoute>
            }
          />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/People" element={<People />} />

          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignupPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/verify-email"
            element={
              <RequireUnverifiedUser>
                <EmailVerificationPage />
              </RequireUnverifiedUser>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
        </Routes>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;
