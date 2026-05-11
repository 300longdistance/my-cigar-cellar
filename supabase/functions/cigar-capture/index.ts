import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";

  return value.trim().replace(/\s+/g, " ");
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number") return 0;

  return Math.max(0, Math.min(1, value));
}

function normalizeResult(value: Partial<CigarCaptureResult>): CigarCaptureResult {
  return {
    brand: normalizeText(value.brand),
    name: normalizeText(value.name),
    size: normalizeText(value.size),
    wrapper: normalizeText(value.wrapper),
    origin: normalizeText(value.origin),
    strength: normalizeText(value.strength),
    notes: normalizeText(value.notes),
    confidence: normalizeConfidence(value.confidence),
  };
}

function extractOutputText(openAiData: any) {
  if (typeof openAiData?.output_text === "string") {
    return openAiData.output_text;
  }

  const output = Array.isArray(openAiData?.output) ? openAiData.output : [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];

    for (const contentItem of content) {
      if (
        contentItem?.type === "output_text" &&
        typeof contentItem?.text === "string"
      ) {
        return contentItem.text;
      }
    }
  }

  return "{}";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!OPENAI_API_KEY) {
      return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    const body = await req.json();
    const image = body?.image;

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
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are a cigar identification assistant. Extract premium cigar information from cigar bands, boxes, labels, packaging, and visible text. Use only what is visible or reasonably inferable. Do not invent exact product details. If uncertain, use empty strings. Return only valid JSON matching the schema.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Identify this cigar. For brand, use the manufacturer or visible brand. For name, use the line, blend, or cigar name, not only the brand. For size, use vitola when visible or reasonably identifiable. For wrapper, origin, and strength, fill only if visible or reasonably inferable. Strength must be one of Mild, Mild-Medium, Medium, Medium-Full, Full, or empty. Add brief notes describing visible text and uncertainty.",
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

      console.error("OpenAI request failed:", errorText);

      return jsonResponse(
        {
          error: "OpenAI request failed",
          details: errorText,
        },
        500
      );
    }

    const openAiData = await openAiResponse.json();
    const outputText = extractOutputText(openAiData);

    let parsed: Partial<CigarCaptureResult> = {};

    try {
      parsed = JSON.parse(outputText);
    } catch (error) {
      console.error("Failed to parse OpenAI JSON:", outputText, error);

      return jsonResponse(
        {
          error: "Failed to parse AI response",
          raw: outputText,
        },
        500
      );
    }

    return jsonResponse(normalizeResult(parsed));
  } catch (error) {
    console.error("AI cigar extraction failed:", error);

    return jsonResponse(
      {
        error: "AI cigar extraction failed",
      },
      500
    );
  }
});