import { config } from '../config';

const API_URL = config.apiUrl;

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(authToken: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      token: authToken,
    });
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: { token: string; password: string }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(token: string) {
    return this.request('/auth/me', {
      method: 'GET',
      token,
    });
  }

  // Idea endpoints
  async getIdeas(page = 1, limit = 20) {
    return this.request(`/ideas?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async getIdeaById(id: string) {
    return this.request(`/ideas/${id}`, {
      method: 'GET',
    });
  }

  async getUserIdeas(userId: string, page = 1, limit = 20) {
    return this.request(`/ideas/user/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async createIdea(
    data: { title: string; description: string; tags?: string[] },
    token: string
  ) {
    return this.request('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async updateIdea(
    id: string,
    data: { title?: string; description?: string; tags?: string[] },
    token: string
  ) {
    return this.request(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async deleteIdea(id: string, token: string) {
    return this.request(`/ideas/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async upvoteIdea(id: string, token: string) {
    return this.request(`/ideas/${id}/upvote`, {
      method: 'POST',
      token,
    });
  }

  async downvoteIdea(id: string, token: string) {
    return this.request(`/ideas/${id}/downvote`, {
      method: 'POST',
      token,
    });
  }

  // Comment endpoints
  async getComments(ideaId: string, page = 1, limit = 50) {
    return this.request(`/comments/idea/${ideaId}?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async createComment(ideaId: string, text: string, token: string) {
    return this.request(`/comments/idea/${ideaId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      token,
    });
  }

  async updateComment(id: string, text: string, token: string) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
      token,
    });
  }

  async deleteComment(id: string, token: string) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // User endpoints
  async searchUsers(query: string) {
    return this.request(`/users/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }

  async getUserProfile(id: string) {
    return this.request(`/users/${id}`, {
      method: 'GET',
    });
  }

  async getFollowers(id: string) {
    return this.request(`/users/${id}/followers`, {
      method: 'GET',
    });
  }

  async getFollowing(id: string) {
    return this.request(`/users/${id}/following`, {
      method: 'GET',
    });
  }

  async updateUserProfile(
    data: { name?: string; bio?: string; avatar?: string },
    token: string
  ) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async followUser(id: string, token: string) {
    return this.request(`/users/${id}/follow`, {
      method: 'POST',
      token,
    });
  }

  async unfollowUser(id: string, token: string) {
    return this.request(`/users/${id}/unfollow`, {
      method: 'POST',
      token,
    });
  }
}

export const apiService = new ApiService();
