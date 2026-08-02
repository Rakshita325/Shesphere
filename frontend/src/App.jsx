import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { UserProvider } from "./context/UserContext";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import InterestSelection from "./pages/InterestSelection";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Community from "./pages/Community";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Streaks from "./pages/Streaks";
import Settings from "./pages/Settings";
import Testimonials from "./components/Testimonials";
import EditProfile from "./pages/EditProfile";


function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/interests" element={<InterestSelection />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/streaks" element={<Streaks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="games" element={<Games />} />
            <Route path="journal" element={<Journal />} />
            <Route path="community" element={<Community />} />
            <Route path="streaks" element={<Streaks />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="edit-profile" element={<EditProfile />} />




          </Route>
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/edit-profile" element={<EditProfile />} />


        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;