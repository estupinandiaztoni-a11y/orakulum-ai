import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  const { message } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",

    stream: true,

    messages: [
      {
        role: "system",
        content:
          "Eres ORAKULUM, una inteligencia artificial futurista, elegante y cinematográfica.",
      },

      {
        role: "user",
        content: message,
      },
    ],
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {

      for await (const chunk of completion) {

        const text =
          chunk.choices[0]?.delta?.content || "";

        controller.enqueue(
          encoder.encode(text)
        );
      }

      controller.close();
    },
  });

  return new Response(stream);
}