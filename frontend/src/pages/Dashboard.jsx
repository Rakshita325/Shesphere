import WelcomeCard from "../components/dashboard/WelcomeCard";
import ContinueLearning from "../components/dashboard/ContinueLearning";
import RecommendedVideos from "../components/dashboard/RecommendedVideos";
import RecommendedArticles from "../components/dashboard/RecommendedArticles";
import DailyChallenge from "../components/dashboard/DailyChallenge";
import CommunityUpload from "../components/dashboard/CommunityUpload";
import CommunityFeed from "../components/dashboard/CommunityFeed";
import AchievementBadges from "../components/dashboard/AchievementBadges";
import LearningProgress from "../components/dashboard/LearningProgress";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <WelcomeCard />
      <ContinueLearning />
      <RecommendedVideos />
      <RecommendedArticles />
      <DailyChallenge />
      <CommunityUpload />
      <CommunityFeed />
      <AchievementBadges />
      <LearningProgress />
    </div>
  );
};

export default Dashboard;