import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const checkAbuseWithAI = async (text) => {
  try {

    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    return response.results[0];

  } catch (error) {

    // 🔥 If rate limit
    if (error.status === 429) {
      console.log("⚠️ Rate limit exceeded - skipping AI check");
      return { flagged: false, skipped: true };
    }

    console.log("AI moderation error:", error.message);
    return { flagged: false };
  }
};

// export const checkAbuseWithAI = async (text) => {
//   try {

//     return response.results[0]; // { flagged: true/false }

//   } catch (error) {
//     console.log("AI moderation error:", error.message);

//     // 🔥 AI fail ho to safe allow karo
//     return { flagged: false };

