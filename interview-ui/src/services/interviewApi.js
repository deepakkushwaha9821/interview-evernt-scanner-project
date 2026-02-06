import axios from "axios";

const API = "http://localhost:8000/interview";

export const startInterview = async () => {
  const res = await axios.post(`${API}/start`);
  return res.data;
};

export const submitAnswer = async (sessionId, answer) => {
  const res = await axios.post(`${API}/answer`, {
    session_id: sessionId,
    answer
  });
  return res.data;
};