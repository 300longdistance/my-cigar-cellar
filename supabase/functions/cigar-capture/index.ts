import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

type CigarCaptureResult = {
  brand: string;
  name: string;
  size: string;
  wrapper: string;
  origin: string;
  strength: string;
  notes: string;
  confidence: number;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeResult(value: Partial<CigarCaptureResult>): CigarCaptureResult {
  return {
    brand: typeof value.brand === "string" ? value.brand : "",
    name: typeof value.name === "string" ? value.name : "",
    size: typeof value.size === "string" ? value.size : "",
    wrapper: typeof value.wrapper === "string" ? value.wrapper : "",
    origin: typeof value.origin === "string" ? value.origin : "",
    strength: typeof value.strength === "string" ? value.strength : "",
    notes: typeof value.notes === "string" ? value.notes : "",
    confidence:
      typeof value.confidence === "number"
        ? Math.max(0, Math.min(1, value.confidence))
        : 0,
  };
}

Deno.serve(async (req) => {
  try {
    if (!OPENAI_API_KEY) {
      return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    const body = await req.json();
    const image = body.image;

    if (!image || typeof image !== "string") {
      return jsonResponse({ error: "Missing image" }, 400);
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are a cigar identification assistant. Extract premium cigar information from cigar bands, cigar boxes, labels, packaging, and visible cigar text. Prefer real cigar product names over generic descriptions. If the image shows a cigar band, treat the band as the primary source. If the image shows a box, use box text and branding. If multiple cigars appear, identify the dominant/front cigar. Use empty strings when uncertain. Do not invent exact details when not visible or reasonably inferable.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Identify this cigar and return the best possible structured details. For name, use the cigar line or blend name, not just the brand. For size, use vitola when visible or reasonably identifiable. For strength, use Mild, Mild-Medium, Medium, Medium-Full, or Full when reasonably inferable. Return only the requested JSON fields.",
              },
              {
                type: "input_image",
                image_url: image,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "cigar_capture_result",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                brand: { type: "string" },
                name: { type: "string" },
                size: { type: "string" },
                wrapper: { type: "string" },
                origin: { type: "string" },
                strength: { type: "string" },
                notes: { type: "string" },
                confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                },
              },
              required: [
                "brand",
                "name",
                "size",
                "wrapper",
                "origin",
                "strength",
                "notes",
                "confidence",
              ],
            },
          },
        },
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();

      return jsonResponse(
        {
          error: "OpenAI request failed",
          details: errorText,
        },
        500
      );
    }

    const openAiData = await openAiResponse.json();
    const outputText =
      openAiData?.output?.[0]?.content?.find(
        (item: { type?: string }) => item.type === "output_text"
      )?.text ?? "{}";

    const parsed = JSON.parse(outputText);

    return jsonResponse(normalizeResult(parsed));
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error: "AI cigar extraction failed",
      },
      500
    );
  }
});