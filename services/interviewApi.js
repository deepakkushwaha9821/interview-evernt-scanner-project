import axios from "axios";
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/interview`;

export const startInterview = async ({ topic = "python", candidateName = "Candidate", maxQuestions = 5 } = {}) => {
  const res = await axios.post(`${API}/start`, {
    topic,
    candidate_name: candidateName,
    max_questions: maxQuestions,
  });
  return res.data;
};

export const submitAnswer = async (sessionId, answer, pairCode = null) => {
  const res = await axios.post(`${API}/answer`, {
    session_id: sessionId,
    answer,
    ...(pairCode ? { pair_code: pairCode } : {})
  });
  return res.data;
};

export const stopInterview = async (sessionId, pairCode = null) => {
  const res = await axios.post(`${API}/stop`, {
    session_id: sessionId,
    ...(pairCode ? { pair_code: pairCode } : {})
  });
  return res.data;
};