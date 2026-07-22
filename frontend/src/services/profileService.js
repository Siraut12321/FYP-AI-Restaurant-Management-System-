import api from '../api/api';

const profileService = {
  async getProfile() {
    const { data } = await api.get('/profile');
    return data.data;
  },

  async updateProfile({ name, phone, address, avatar }) {
    const formData = new FormData();
    if (name !== undefined) formData.append('name', name);
    if (phone !== undefined) formData.append('phone', phone);
    if (address !== undefined) formData.append('address', address);
    if (avatar) formData.append('avatar', avatar);

    const { data } = await api.patch('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};

export default profileService;
