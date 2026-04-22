import { useLocation, useNavigate } from "react-router-dom";
import { speak } from "../utils/speak";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result || null;

  if (!result) {
    return (
      <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif" }}>
        <h2>No result found</h2>
        <button onClick={() => navigate("/candidate-profile")}>Back to Candidate Profile</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Interview Result</h2>

      <p><b>Candidate:</b> {result.candidate_name || "Candidate"}</p>
      <p><b>Topic:</b> {(result.topic || "python").toUpperCase()}</p>
      <h3>{result.final_verdict}</h3>
      <p><b>Score:</b> {result.score_percentage}%</p>
      <p>{result.summary}</p>

      <hr />

      <h3>Detailed Feedback</h3>

      {result.detailed_feedback.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px"
          }}
        >
          <p><b>Question:</b> {item.question}</p>
          <p><b>Difficulty:</b> {item.difficulty || "medium"}</p>
          <p><b>Your Answer:</b> {item.your_answer}</p>
          <p><b>Reference Answer:</b> {item.correct_answer}</p>

          <p>
            <b>Verdict:</b>{" "}
            <span
              style={{
                color:
                  item.verdict === "excellent"
                    ? "green"
                    : item.verdict === "good"
                    ? "orange"
                    : "red"
              }}
            >
              {item.verdict}
            </span>
          </p>

          <p><b>Final Score:</b> {item.score}/10</p>
          <p><b>LLM Score:</b> {item.llm_score}/10</p>
          <p><b>Keyword Score:</b> {item.keyword_score}/10</p>
          <p><b>Feedback:</b> {item.feedback}</p>

          {item.missing_points?.length > 0 && (
            <p><b>Missing Points:</b> {item.missing_points.join(", ")}</p>
          )}

          <button
            onClick={() =>
              speak(
                `For the question: ${item.question}. ` +
                  `Your score is ${item.score} out of 10. ` +
                  `Feedback: ${item.feedback}`
              )
            }
          >
            Hear Feedback
          </button>
        </div>
      ))}

      <button onClick={() => navigate("/candidate-profile")}>Start New Interview</button>
    </div>
  );
}

export default Result;
