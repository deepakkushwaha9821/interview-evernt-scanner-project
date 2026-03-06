import axios from "axios";

const API = "https://deedrop1140-event-project.hf.space";

export async function startInterview() {

  const res = await axios.post(`${API}/interview/start`);

  return res.data;

}

export async function submitAnswer(sessionId, answer) {

  const res = await axios.post(`${API}/interview/answer`, {
    session_id: sessionId,
    answer: answer
  });

  return res.data;

}
