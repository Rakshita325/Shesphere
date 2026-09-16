import React from "react";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import ContinueLearningSection from "../components/dashboard/ContinueLearningSection";
import RecommendedVideos from "../components/dashboard/RecommendedVideos";
import RecommendedArticles from "../components/dashboard/RecommendedArticles";

const Dashboard = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcome Card Header */}
      <WelcomeCard />



      {/* 2. Recommended Videos Section (4-column compact grid) */}
      <RecommendedVideos />

      {/* 3. Recommended Articles Section (3-card paginated sets + Write Article button) */}
      <RecommendedArticles />

      {/* 4. Continue Learning Section (Single section combining progress + content-based recommendations) */}
      <ContinueLearningSection />
    </div>
  );
};

export default Dashboard;