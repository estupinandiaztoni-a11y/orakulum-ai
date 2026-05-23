"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaMicrophone,
  FaVolumeUp,
} from "react-icons/fa";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  function speakText(text: string) {

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang = "es-ES";

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    speechSynthesis.speak(
      utterance
    );
  }

  function startListening() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert(
        "Tu navegador no soporta voz"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "es-ES";

    recognition.onresult = (
      event: any
    ) => {

      const transcript =
        event.results[0][0]
          .transcript;

      setMessage(
        transcript
      );
    };

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }

  async function sendMessage() {

    if (!message.trim()) return;

    const userMessage = {

      role: "user",

      content: message,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    const currentMessage =
      message;

    setMessage("");

    setLoading(true);

    const res = await fetch(
      "/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          message:
            currentMessage,
        }),
      }
    );

    const data =
      await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.reply,
      },
    ]);

    speakText(data.reply);

    setLoading(false);
  }

  return (

    <main className="bg-[#090909] text-white h-screen flex overflow-hidden">

      <aside className="w-[260px] border-r border-zinc-900 bg-black/40 backdrop-blur-xl p-5 flex flex-col">

        <button
          className="bg-white text-black rounded-2xl py-4 text-sm font-semibold hover:opacity-90 transition"
        >
          + Nuevo Chat
        </button>

        <div className="mt-6 space-y-3">

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 hover:bg-zinc-800 transition cursor-pointer">
            Conversación actual
          </div>

        </div>

      </aside>

      <section className="flex-1 flex flex-col">

        <header className="h-[90px] border-b border-zinc-900 flex items-center justify-center">

          <h1 className="text-3xl font-semibold tracking-[10px] text-zinc-100">
            ORAKULUM
          </h1>

        </header>

        <div className="flex-1 overflow-y-auto">

          <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

            {messages.map(
              (
                msg,
                index
              ) => (

                <div
                  key={index}
                  className={`flex ${
                    msg.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[75%] px-6 py-5 rounded-[28px] text-[15px] leading-8 shadow-2xl ${
                      msg.role ===
                      "user"
                        ? "bg-white text-black"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200"
                    }`}
                  >
                    {msg.content}
                  </div>

                </div>
              )
            )}

            {loading && (

              <div className="text-zinc-500 text-sm animate-pulse">
                ORAKULUM escribiendo...
              </div>
            )}

            <div ref={bottomRef} />

          </div>

        </div>

        <footer className="border-t border-zinc-900 bg-[#090909]">

          <div className="max-w-4xl mx-auto p-6">

            <div className="bg-zinc-950 border border-zinc-800 rounded-[35px] p-4 shadow-2xl">

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {

                    e.preventDefault();

                    sendMessage();
                  }
                }}
                placeholder="Escribe un mensaje..."
                className="w-full bg-transparent text-zinc-200 outline-none resize-none h-24 text-[16px] placeholder:text-zinc-500"
              />

              <div className="flex items-center justify-between mt-4">

                <div className="flex gap-3">

                  <button
                    onClick={
                      startListening
                    }
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                      listening
                        ? "bg-red-600"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <FaMicrophone />
                  </button>

                  <button
                    onClick={() =>
                      speakText(
                        message
                      )
                    }
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                      speaking
                        ? "bg-green-600"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <FaVolumeUp />
                  </button>

                </div>

                <button
                  onClick={
                    sendMessage
                  }
                  className="bg-white text-black px-8 py-3 rounded-2xl text-sm font-semibold hover:opacity-90 transition"
                >
                  Enviar
                </button>

              </div>

            </div>

          </div>

        </footer>

      </section>

    </main>
  );
}