"use client"

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import {
  useEffect,
  useRef,
  useState,
} from "react";
}"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaMicrophone,
  FaVolumeUp,
} from "react-icons/fa";

import { v4 as uuidv4 } from "uuid";

export default function Home() {

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [chats, setChats] =
    useState<any[]>([]);

  const [currentChatId,
    setCurrentChatId] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {

    const saved =
      localStorage.getItem(
        "orakulum-memory"
      );

    if (saved) {

      const parsed =
        JSON.parse(saved);

      setChats(parsed);

      if (parsed.length > 0) {

        setCurrentChatId(
          parsed[0].id
        );
      }

    } else {

      createNewChat();

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(
      "orakulum-memory",
      JSON.stringify(chats)
    );

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [chats]);

  function createNewChat() {

    const newChat = {

      id: uuidv4(),

      title: "Nuevo Chat",

      messages: [],
    };

    setChats((prev) => [
      newChat,
      ...prev,
    ]);

    setCurrentChatId(
      newChat.id
    );
  }

  const currentChat =
    chats.find(
      (chat) =>
        chat.id ===
        currentChatId
    );

  function speakText(
    text: string
  ) {

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

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

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

    recognition.start();
  }

  async function sendMessage() {

    if (
      !message.trim() ||
      !currentChat
    ) return;

    const userMessage = {

      role: "user",

      content: message,
    };

    const updatedChats =
      chats.map((chat) => {

        if (
          chat.id ===
          currentChatId
        ) {

          return {

            ...chat,

            title:
              message.slice(
                0,
                20
              ),

            messages: [
              ...chat.messages,
              userMessage,
            ],
          };
        }

        return chat;
      });

    setChats(updatedChats);

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

    let text = "";

    setChats((prev) =>
      prev.map((chat) => {

        if (
          chat.id ===
          currentChatId
        ) {

          return {

            ...chat,

            messages: [
              ...chat.messages,
              {
                role:
                  "assistant",

                content: "",
              },
            ],
          };
        }

        return chat;
      })
    );

    for (
      let i = 0;
      i < data.reply.length;
      i++
    ) {

      text +=
        data.reply[i];

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            8
          )
      );

      setChats((prev) =>
        prev.map((chat) => {

          if (
            chat.id ===
            currentChatId
          ) {

            const updated =
              [
                ...chat.messages,
              ];

            updated[
              updated.length - 1
            ] = {

              role:
                "assistant",

              content: text,
            };

            return {

              ...chat,

              messages:
                updated,
            };
          }

          return chat;
        })
      );
    }

    speakText(
      data.reply
    );

    setLoading(false);
  }

  return (

    <main className="bg-black text-white h-screen flex overflow-hidden">

      <aside className="w-80 bg-zinc-950 border-r border-zinc-900 flex flex-col">

        <div className="p-5 border-b border-zinc-900">

          <button
            onClick={
              createNewChat
            }
            className="w-full bg-white text-black py-4 rounded-2xl text-xl font-bold"
          >
            + Nuevo Chat
          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {chats.map(
            (chat) => (

              <button
                key={chat.id}
                onClick={() =>
                  setCurrentChatId(
                    chat.id
                  )
                }
                className={`w-full text-left p-4 rounded-2xl transition ${
                  currentChatId ===
                  chat.id
                    ? "bg-white text-black"
                    : "bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                {chat.title}
              </button>
            )
          )}

        </div>

      </aside>

      <section className="flex-1 flex flex-col">

        <div className="text-center py-6 border-b border-zinc-900">

          <h1 className="text-5xl font-black tracking-[10px]">
            ORAKULUM
          </h1>

        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">

          <div className="max-w-5xl mx-auto space-y-6">

            {currentChat?.messages.map(
              (
                msg: any,
                index: number
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
                    className={`max-w-3xl px-8 py-6 rounded-[30px] text-2xl leading-relaxed ${
                      msg.role ===
                      "user"
                        ? "bg-white text-black"
                        : "bg-zinc-900 border border-zinc-800"
                    }`}
                  >
                    {msg.content}
                  </div>

                </div>
              )
            )}

            {loading && (

              <div className="flex justify-start">

                <div className="bg-zinc-900 border border-zinc-800 px-8 py-6 rounded-[30px] animate-pulse">

                  ORAKULUM escribiendo...

                </div>

              </div>
            )}

            <div ref={bottomRef} />

          </div>

        </div>

        <div className="border-t border-zinc-900 p-6 bg-black">

          <div className="max-w-5xl mx-auto">

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="Habla con ORAKULUM..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[35px] p-6 text-2xl outline-none resize-none h-40"
            />

            <div className="grid grid-cols-2 gap-4 mt-4">

              <button
                onClick={
                  startListening
                }
                className={`py-5 rounded-[30px] text-2xl font-bold flex items-center justify-center gap-4 ${
                  listening
                    ? "bg-red-600"
                    : "bg-zinc-800"
                }`}
              >
                <FaMicrophone />

                {listening
                  ? "Escuchando..."
                  : "Hablar"}
              </button>

              <button
                onClick={() =>
                  speakText(
                    message
                  )
                }
                className={`py-5 rounded-[30px] text-2xl font-bold flex items-center justify-center gap-4 ${
                  speaking
                    ? "bg-green-600"
                    : "bg-zinc-800"
                }`}
              >
                <FaVolumeUp />

                {speaking
                  ? "Hablando..."
                  : "Leer"}
              </button>

            </div>

            <button
              onClick={
                sendMessage
              }
              className="mt-4 w-full bg-white text-black py-5 rounded-[30px] text-3xl font-black"
            >
              Enviar
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}