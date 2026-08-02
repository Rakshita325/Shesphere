import WelcomeCard from "../components/dashboard/WelcomeCard";
import RecommendedVideos from "../components/dashboard/RecommendedVideos";
import RecommendedArticles from "../components/dashboard/RecommendedArticles";
import CommunityFeed from "../components/dashboard/CommunityFeed";


const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <WelcomeCard />
      <RecommendedVideos />
      <RecommendedArticles />
      <CommunityFeed />
    </div>
  );
};

export default Dashboard;