import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getLatestScan = async () => {
  const response = await axios.get(`${API_URL}/scans/latest`);
  return response.data;
};

export const getAllScans = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/scans?page=${page}&limit=${limit}`);
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/scans/stats`);
  return response.data;
};
