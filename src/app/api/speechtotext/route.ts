import OpenAI from "openai";

export const runtime = "edge";  // Provide optimal infrastructure for API route (https://edge-runtime.vercel.app/)
//route.ts Route Handlers
//POST localhost:3000/api/speechtotext

export async function POST(req: Request){
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const token = formData.get("token") as string;
    const lang = formData.get("lang") as string;

    if ((!token || token === "null") && !process.env.OPENAI_API_KEY) {
        return Response.json({
            error: "No API key provided.",
        });    
    }

    const openai = new OpenAI({
        apiKey: token || process.env.OPENAI_API_KEY,        //token = other Users API-KEY || process.env.OPENAI_API_KEY = .env.local(//To get environment variables: able to access anywhere)
    });

    const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
        language: lang || undefined,
    });    

    return Response.json(transcription);
}
