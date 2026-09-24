import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { UserProvider } from "./context/UserContext";
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

import ProtectedRoute from "./components/ProtectedRoute";

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

import Marketplace from "./pages/Marketplace";
import SellProduct from "./pages/SellProduct";
import ProductDetails from "./pages/ProductDetails";
import MyProducts from "./pages/MyProducts";
import MyPurchases from "./pages/MyPurchases";

import VideoDetail from "./pages/VideoDetail";
import ArticleDetail from "./pages/ArticleDetail";
import WriteArticle from "./pages/WriteArticle";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <MarketplaceProvider>
            <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/testimonials" element={<Testimonials />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/interests" element={<InterestSelection />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:communityId" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/streaks" element={<Streaks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/edit-profile" element={<EditProfile />} />

              {/* Marketplace top-level routes wrapped in DashboardLayout */}
              <Route element={<DashboardLayout />}>
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/sell" element={<SellProduct />} />
                <Route path="/marketplace/my-products" element={<MyProducts />} />
                <Route path="/marketplace/my-purchases" element={<MyPurchases />} />
                <Route path="/marketplace/orders" element={<MyPurchases />} />
                <Route path="/marketplace/:id" element={<ProductDetails />} />
              </Route>

              {/* Dashboard routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="videos/:videoId" element={<VideoDetail />} />
                <Route path="articles/write" element={<WriteArticle />} />
                <Route path="articles/:articleId" element={<ArticleDetail />} />

                <Route path="games" element={<Games />} />
                <Route path="journal" element={<Journal />} />
                <Route path="community" element={<Community />} />
                <Route path="community/:communityId" element={<Community />} />
                <Route path="streaks" element={<Streaks />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="edit-profile" element={<EditProfile />} />

                {/* Marketplace subroutes */}
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/sell" element={<SellProduct />} />
                <Route path="marketplace/my-products" element={<MyProducts />} />
                <Route path="marketplace/my-purchases" element={<MyPurchases />} />
                <Route path="marketplace/orders" element={<MyPurchases />} />
                <Route path="marketplace/:id" element={<ProductDetails />} />
              </Route>
            </Route>
          </Routes>
        </Router>
          </MarketplaceProvider>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;