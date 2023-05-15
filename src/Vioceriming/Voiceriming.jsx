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
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

    const speechSynth = window.speechSynthesis;
    if (speechSynth) {
      setSpeechSynthesis(speechSynth);
    } else {
      console.log("Speech synthesis is not supported in this browser");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startVoiceInput = () => {
    if (recognition && recognition.readyState !== "listening") {
      recognition.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const speakText = (text) => {
    if (speechSynthesis && !isSpeaking) {
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false);
        setApiResponse(""); // Clear the response after speaking
      };

      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      const apiResponseText = result.data.choices[0].text;
      console.log("response", apiResponseText);
      setApiResponse(apiResponseText);
      speakText(apiResponseText);
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
            onChange={(e) => {
              console.log(e.target.value + "%%%%");
              setPrompt(e.target.value);
            }}
            // disabled={voiceInputEnabled}
          />
          {console.log(prompt + "#####")}
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
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
