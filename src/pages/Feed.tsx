import { useApp } from '../contexts/AppContext';
import IdeaCard from '../components/IdeaCard';
import '../styles/Feed.css';

const Feed = () => {
  const { ideas } = useApp();

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h2>Live Feed</h2>
        <p>Discover innovative startup ideas from the DTU community</p>
      </div>
      <div className="feed-content">
        {ideas.length === 0 ? (
          <div className="empty-state">
            <h3>No ideas yet</h3>
            <p>Be the first to share your startup idea!</p>
          </div>
        ) : (
          ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  );
};

export default Feed;
