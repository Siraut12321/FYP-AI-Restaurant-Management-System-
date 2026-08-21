import api from '../api/api';

const conversationService = {
  async list() {
    const { data } = await api.get('/conversations');
    return data.data.conversations;
  },

  async get(id) {
    const { data } = await api.get(`/conversations/${id}`);
    return data.data.conversation;
  },

  async create(sessionId, title = 'New Conversation') {
    const { data } = await api.post('/conversations', { sessionId, title });
    return data.data.conversation;
  },

  async update(id, payload) {
    const { data } = await api.put(`/conversations/${id}`, payload);
    return data.data.conversation;
  },

  async delete(id) {
    await api.delete(`/conversations/${id}`);
  },
};

export default conversationService;
