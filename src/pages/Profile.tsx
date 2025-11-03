import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import IdeaCard from '../components/IdeaCard';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const { ideas, users, followUser, unfollowUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');

  if (!user) return null;

  const userIdeas = ideas.filter((idea) => idea.author.id === user.id);
  
  const filteredUsers = users.filter(
    (u) =>
      u.id !== user.id &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isFollowing = (userId: string) => user.following.includes(userId);

  const handleFollow = (userId: string) => {
    if (isFollowing(userId)) {
      unfollowUser(user.id, userId);
    } else {
      followUser(user.id, userId);
    }
  };

  const handleSaveBio = () => {
    setIsEditing(false);
    // Update bio logic would go here
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <div className="profile-stats">
              <span>{user.followers.length} Followers</span>
              <span>{user.following.length} Following</span>
              <span>{userIdeas.length} Ideas</span>
            </div>
          </div>
        </div>
        <div className="profile-bio">
          {isEditing ? (
            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bio-input"
                placeholder="Write something about yourself..."
              />
              <button onClick={handleSaveBio} className="save-bio-button">
                Save
              </button>
            </div>
          ) : (
            <div>
              <p>{user.bio || 'No bio yet'}</p>
              <button onClick={() => setIsEditing(true)} className="edit-bio-button">
                Edit Bio
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Your Ideas</h3>
          <div className="ideas-list">
            {userIdeas.length === 0 ? (
              <p className="empty-message">You haven't posted any ideas yet</p>
            ) : (
              userIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Find Users</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="search-input"
          />
          <div className="users-list">
            {searchQuery && filteredUsers.length === 0 && (
              <p className="empty-message">No users found</p>
            )}
            {searchQuery &&
              filteredUsers.map((u) => (
                <div key={u.id} className="user-item">
                  <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <p className="user-name">{u.name}</p>
                    <p className="user-email">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id)}
                    className={`follow-button ${isFollowing(u.id) ? 'following' : ''}`}
                  >
                    {isFollowing(u.id) ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
