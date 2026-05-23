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

        temperature: 0.7,

        max_tokens: 300,

        messages: [

          {
            role: "system",

            content:
              `
              Eres ORAKULUM.

              Una inteligencia artificial elegante,
              moderna,
              sabia,
              espiritual
              y extremadamente humana.

              Tus respuestas deben ser:

              - naturales
              - fluidas
              - claras
              - inteligentes
              - profundas
              - modernas

              Nunca escribas textos gigantes.

              Evita repetir ideas.

              Habla como una IA premium futurista.

              Siempre escribe en español neutro perfecto.

              Nunca uses palabras portuguesas,
              gallegas
              o regionales.

              Nunca inventes palabras.

              Sé breve,
              magnética
              y emocionalmente inteligente.
              `,
          },

          {
            role: "user",
            content: body.message,
          },
        ],
      });

    const reply =
      completion.choices[0]
        .message.content;

    return Response.json({
      reply,
    });

  } catch (error) {

    console.log(error);

    return Response.json({
      reply:
        "Ahora mismo no puedo conectar con la conciencia central.",
    });
  }
}