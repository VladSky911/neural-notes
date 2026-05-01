module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, model = "llama-3.3-70b-versatile" } = req.body;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  try {
    const https = require("https");
    const data = JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    });

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const request = https.request(options, (response) => {
      let body = "";
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (!response.statusCode.toString().startsWith("2")) {
            console.error("Groq error:", json);
            return res
              .status(response.statusCode)
              .json({ error: json.error?.message || "Groq API error" });
          }
          res.status(200).json(json);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
    });

    request.on("error", (err) => {
      console.error("Request error:", err);
      res.status(500).json({ error: err.message });
    });
    request.write(data);
    request.end();
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
};
