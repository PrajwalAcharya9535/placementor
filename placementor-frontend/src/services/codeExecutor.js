import axios from "axios";

export const runCode = async ({ code, language, questionId }) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/technical/run",
      {
        code,
        language,
        questionId,
      }
    );

    return res.data;
  } catch (err) {
    console.error(err);
    return { error: "Execution failed" };
  }
};