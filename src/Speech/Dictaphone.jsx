import { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";

const ChatbotApp = () => {
  const configuration = new Configuration({
    apiKey: "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",
  });

  const openai = new OpenAIApi(configuration);
  const [prompt, setPrompt] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Voice recognition started");
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        console.log("Voice input transcript:", transcript);
        setPrompt(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
      };

      recognition.onend = () => {
        console.log("Voice recognition ended");
      };

      setRecognition(recognition);
      setVoiceInputEnabled(true);
    } else {
      console.log("Speech recognition is not supported in this browser");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startVoiceInput = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.5,
        max_tokens: 4000,
      });
      console.log("response", result.data.choices[0].text);
      setApiResponse(result.data.choices[0].text);
    } catch (e) {
      console.log(e);
      setApiResponse("Something is going wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={prompt}
            placeholder="Please ask OpenAI"
            onChange={(e) => setPrompt(e.target.value)}
            disabled={voiceInputEnabled}
          />
          {voiceInputEnabled ? (
            <>
              <button onClick={startVoiceInput}>Start Voice Input</button>
              <button onClick={stopVoiceInput}>Stop Voice Input</button>
            </>
          ) : (
            <button disabled={loading || prompt.length === 0} type="submit">
              {loading ? "Generating..." : "Generate"}
            </button>
          )}
        </form>
      </div>
      {apiResponse && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <pre>
            <strong>API response:</strong>
            {apiResponse}
          </pre>
        </div>
      )}
    </>
  );
};

export default ChatbotApp;
