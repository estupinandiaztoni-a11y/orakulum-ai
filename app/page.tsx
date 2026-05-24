"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.reply ||
          "No pude responder en este momento.",
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      speakText(assistantMessage.content);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ocurrió un error al conectar.",
        },
      ]);
    }

    setLoading(false);
  };

 const speakText = async (
  text: string
) => {

  try {

    const response =
      await fetch(
        "/api/voice",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            text,
          }),
        }
      );

    const blob =
      await response.blob();

    const url =
      URL.createObjectURL(
        blob
      );

    const audio =
      new Audio(url);

    audio.play();

  } catch (error) {

    console.log(error);
  }
const voices = speechSynthesis.getVoices();

const maleVoice =
  voices.find((voice) =>
    voice.name.includes("Google español")
  ) ||
  voices.find((voice) =>
    voice.lang.includes("es")
  );

if (maleVoice) {
  utterance.voice = maleVoice;
}

utterance.lang = "es-ES";
utterance.pitch = 0.85;
utterance.rate = 0.9;
utterance.volume = 1;

window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Tu navegador no soporta reconocimiento de voz."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "es-ES";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.start();

    recognitionRef.current = recognition;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[0][0].transcript;

      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      <aside className="w-[280px] border-r border-zinc-800 bg-zinc-950 p-5 flex flex-col">
        <button
          className="bg-white text-black font-bold rounded-2xl py-4 text-lg hover:scale-[1.02] transition"
          onClick={() => setMessages([])}
        >
          + Nuevo Chat
        </button>

        <div className="mt-6 flex-1 overflow-auto">
          {messages.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300">
              Conversación actual
            </div>
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col">
        <header className="border-b border-zinc-800 p-8 flex justify-center">
          <h1 className="text-6xl font-black tracking-[12px]">
            ORAKULUM
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-3xl p-8 text-[24px] leading-[42px] shadow-2xl ${
                  message.role === "user"
                    ? "bg-white text-black ml-auto max-w-[80%]"
                    : "bg-zinc-900 text-white max-w-[85%]"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="bg-zinc-900 rounded-3xl p-8 text-2xl animate-pulse">
                ORAKULUM está pensando...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="border-t border-zinc-800 p-8">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="space-y-5"
            >
              <textarea
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                placeholder="Escribe un mensaje..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-2xl outline-none resize-none min-h-[180px]"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <div className="flex gap-5">
                <button
                  type="button"
                  onClick={startListening}
                  className={`flex-1 rounded-2xl py-5 text-2xl font-bold transition ${
                    isListening
                      ? "bg-red-600"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  🎤 Hablar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-white text-black rounded-2xl py-5 text-2xl font-black hover:scale-[1.01] transition"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </footer>
      </section>
    </main>
  );
}