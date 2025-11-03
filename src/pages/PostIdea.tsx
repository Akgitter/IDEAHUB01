import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { ROUTES } from '../constants';
import '../styles/PostIdea.css';

const PostIdea = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const { user } = useAuth();
  const { addIdea } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !title || !description) {
      return;
    }

    addIdea({
      title,
      description,
      author: user,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });

    navigate(ROUTES.FEED);
  };

  return (
    <div className="post-idea-container">
      <div className="post-idea-card">
        <h2>Share Your Idea</h2>
        <form onSubmit={handleSubmit} className="post-idea-form">
          <div className="form-group">
            <label htmlFor="title">Idea Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title for your startup idea"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail..."
              className="form-textarea"
              rows={8}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., AI, FinTech, EdTech"
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate(ROUTES.FEED)} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Post Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostIdea;
