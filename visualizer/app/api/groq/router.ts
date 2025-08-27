import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY, // server-side safe
    });

    const chatCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: "medium",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      notes: chatCompletion.choices[0]?.message?.content || "",
    });
  } catch (err) {
    console.error("Groq API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Groq response" },
      { status: 500 }
    );
  }
}