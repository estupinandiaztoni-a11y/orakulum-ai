import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content:
              "Eres ORAKULUM, una inteligencia artificial espiritual, poderosa y sabia.",
          },
          {
            role: "user",
            content: body.message,
          },
        ],
      });

    const reply =
      completion.choices[0].message.content;

    return Response.json({
      reply,
    });

  } catch (error) {

    console.log(error);

    return Response.json({
      reply:
        "Error conectando con OpenAI",
    });
  }
}