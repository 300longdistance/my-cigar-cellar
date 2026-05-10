import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENAI_API_KEY",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await req.json();
    const image = body.image;

    if (!image) {
      return new Response(
        JSON.stringify({
          error: "Missing image",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "You extract cigar information from cigar band and box images. Return only valid JSON with these fields: brand, name, size, wrapper, origin, strength, notes, confidence. Use empty strings when uncertain. confidence must be a number from 0 to 1.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    "Identify the cigar from this image. Extract the best possible cigar details.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();

      return new Response(
        JSON.stringify({
          error: "OpenAI request failed",
          details: errorText,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openAiData = await openAiResponse.json();

    const content = openAiData?.choices?.[0]?.message?.content ?? "{}";

    return new Response(content, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "AI cigar extraction failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});