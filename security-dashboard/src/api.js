cat > (src / api.js) << "EOF";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://devsecops-security-api.onrender.com/api";

export const getLatestScan = async () => {
  const response = await axios.get(`${API_URL}/scans/latest`);
  return response.data;
};

export const getAllScans = async (page = 1, limit = 10) => {
  const response = await axios.get(
    `${API_URL}/scans?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/scans/stats`);
  return response.data;
};
EOF;
