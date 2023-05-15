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

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      console.log("Voice input transcript:", finalTranscript);
      setPrompt(finalTranscript);
    };

    recognition.onend = () => {
      if (!speechRecognitionStopped) {
        console.log("Recognition ended. Restarting...");
        startVoiceInput();
      }
    };
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
      };

      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        // temperature: 0.5,
        max_tokens: 4000,
      });
      const choices = result.data.choices;
      if (choices && choices.length > 0) {
        const firstResponse = choices[0].text;
        console.log("response", firstResponse);
        setApiResponse(firstResponse);
        speakText(firstResponse);
      } else {
        setApiResponse("No response generated. Please try again.");
      }
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
          <textarea
            type="text"
            value={prompt}
            placeholder="Please ask to openai"
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <button disabled={loading || prompt.length === 0} type="submit">
            {loading ? "Generating..." : "Generate"}
          </button>
          <button onClick={startVoiceInput}>Start Voice Input</button>
          <button onClick={stopVoiceInput}>Stop Voice Input</button>
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
