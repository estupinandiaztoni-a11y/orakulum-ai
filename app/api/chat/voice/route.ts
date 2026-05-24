import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const mp3 =
      await openai.audio.speech.create({

        model: "tts-1",

        voice: "onyx",

        input: body.text,
      });

    const buffer =
      Buffer.from(
        await mp3.arrayBuffer()
      );

    return new Response(
      buffer,
      {
        headers: {
          "Content-Type":
            "audio/mpeg",
        },
      }
    );

  } catch (error) {

    console.log(error);

    return Response.json({
      error:
        "Error generando voz",
    });
  }
}