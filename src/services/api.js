const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const apiService = {
  /**
   * Checks if the backend server is reachable.
   */
  async checkHealth() {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (!response.ok) throw new Error('Health check request failed');
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  /**
   * Connects a new GitHub repository to the application.
   */
  async uploadRepository(githubUrl) {
    try {
      const response = await fetch(`${BASE_URL}/repo/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: githubUrl }),
      });
      if (!response.ok) throw new Error('Repository upload failed');
      return await response.json();
    } catch (error) {
      console.error('Repository upload error:', error);
      throw error;
    }
  },

  /**
   * Sends a user question to the repository context brain.
   */
  async chatWithRepository(repoId, question, sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_id: repoId,
          question: question,
          session_id: sessionId
        }),
      });
      if (!response.ok) throw new Error('Chat request failed');
      return await response.json();
    } catch (error) {
      console.error('Chat routing error:', error);
      throw error;
    }
  },

  /**
   * Uploads a local multipart ZIP file archive.
   */
  async uploadZipRepository(fileObject) {
    try {
      // Use FormData to package the binary file bytes correctly for FastAPI's UploadFile receiver
      const formData = new FormData();
      formData.append('file', fileObject);

      const response = await fetch(`${BASE_URL}/repo/upload-zip`, {
        method: 'POST',
        body: formData, // Do NOT specify headers; browser automatically sets the correct boundary token
      });
      if (!response.ok) throw new Error('ZIP archive upload failed');
      return await response.json();
    } catch (error) {
      console.error('ZIP upload error:', error);
      throw error;
    }
  },
};