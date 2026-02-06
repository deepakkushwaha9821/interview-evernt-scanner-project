import { speak } from "../utils/speak";

function Result({ result }) {
  if (!result) return null;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Interview Result</h2>

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
          <p><b>Your Answer:</b> {item.your_answer}</p>

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

          <p><b>Feedback:</b> {item.feedback}</p>

          {/* ✅ MODEL GENERATED CORRECT ANSWER */}
          <p>
            <b>Correct Answer:</b> {item.correct_answer}
          </p>

          {/* ✅ MODEL GENERATED EXPLANATION */}
          {item.model_feedback && (
            <p>
              <b>AI Explanation:</b> {item.model_feedback}
            </p>
          )}

          <button
            onClick={() =>
              speak(
                `For the question: ${item.question}. 
                 The correct answer is: ${item.correct_answer}. 
                 ${item.model_feedback || ""}`
              )
            }
          >
            🔊 Hear Explanation
          </button>
        </div>
      ))}
    </div>
  );
}

export default Result;