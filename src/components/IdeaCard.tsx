import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Idea } from '../types';
import { formatTimeAgo, copyToClipboard } from '../utils/helpers';
import '../styles/IdeaCard.css';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard = ({ idea }: IdeaCardProps) => {
  const { user } = useAuth();
  const { upvoteIdea, downvoteIdea, addComment } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  if (!user) return null;

  const hasUpvoted = idea.upvotes.includes(user.id);
  const hasDownvoted = idea.downvotes.includes(user.id);
  const score = idea.upvotes.length - idea.downvotes.length;

  const handleUpvote = () => {
    upvoteIdea(idea.id, user.id);
  };

  const handleDownvote = () => {
    downvoteIdea(idea.id, user.id);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(idea.id, {
        userId: user.id,
        userName: user.name,
        text: commentText,
      });
      setCommentText('');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/idea/${idea.id}`;
    const success = await copyToClipboard(shareUrl);
    if (success) {
      alert('Link copied to clipboard!');
    } else {
      alert('Failed to copy link');
    }
  };

  return (
    <div className="idea-card">
      <div className="idea-header">
        <div className="author-info">
          <div className="author-avatar">{idea.author.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="author-name">{idea.author.name}</p>
            <p className="idea-time">{formatTimeAgo(idea.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="idea-content">
        <h3 className="idea-title">{idea.title}</h3>
        <p className="idea-description">{idea.description}</p>
        {idea.tags && idea.tags.length > 0 && (
          <div className="idea-tags">
            {idea.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="idea-actions">
        <div className="vote-section">
          <button
            className={`vote-button upvote ${hasUpvoted ? 'active' : ''}`}
            onClick={handleUpvote}
          >
            ▲
          </button>
          <span className="vote-score">{score}</span>
          <button
            className={`vote-button downvote ${hasDownvoted ? 'active' : ''}`}
            onClick={handleDownvote}
          >
            ▼
          </button>
        </div>

        <button
          className="action-button"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {idea.comments.length} Comments
        </button>

        <button className="action-button" onClick={handleShare}>
          🔗 Share
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="add-comment">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button onClick={handleAddComment} className="comment-submit">
              Post
            </button>
          </div>
          <div className="comments-list">
            {idea.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-avatar">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div className="comment-content">
                  <p className="comment-author">{comment.userName}</p>
                  <p className="comment-text">{comment.text}</p>
                  <p className="comment-time">{formatTimeAgo(comment.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaCard;
