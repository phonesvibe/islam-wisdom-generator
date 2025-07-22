
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedContent, ActiveView } from '../types';

// Schemas define the expected JSON structure for the Gemini API responses.
const quranSchema = {
  type: Type.OBJECT,
  properties: {
    verse_arabic: { type: Type.STRING, description: "The full Quranic verse in Arabic script." },
    verse_english: { type: Type.STRING, description: "The English translation of the verse." },
    verse_urdu: { type: Type.STRING, description: "The Urdu translation of the verse." }
  },
  required: ["verse_arabic", "verse_english", "verse_urdu"]
};

const hadithSchema = {
  type: Type.OBJECT,
  properties: {
    text_english: { type: Type.STRING, description: "The text of the Hadith in English." },
    text_urdu: { type: Type.STRING, description: "The text of the Hadith in Urdu." },
    narrator: { type: Type.STRING, description: "The primary narrator of the Hadith." },
    source: { type: Type.STRING, description: "The collection and number of the Hadith, e.g., 'Sahih al-Bukhari 5645'." }
  },
  required: ["text_english", "text_urdu", "narrator", "source"]
};

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, engaging title for the story." },
        story: { type: Type.STRING, description: "A short, inspirational story about a prophet or their companions, around 150-200 words." }
    },
    required: ["title", "story"]
};

const buildSchema = (view: ActiveView) => {
    const properties: { [key: string]: any } = {};
    const required: string[] = [];

    if (view === 'home' || view === 'quran') {
        properties.quran = { type: Type.ARRAY, description: "A list of 3-5 relevant Quranic verses.", items: quranSchema };
        if (view === 'quran') required.push('quran');
    }
    if (view === 'home' || view === 'hadith') {
        properties.hadith = { type: Type.ARRAY, description: "A list of 2-3 relevant Hadith.", items: hadithSchema };
        if (view === 'hadith') required.push('hadith');
    }
    if (view === 'stories') {
        properties.stories = { type: Type.ARRAY, description: "A list of 2-3 short, inspirational stories.", items: storySchema };
        required.push('stories');
    }
     if (view === 'home') {
        required.push('quran', 'hadith');
    }

    return {
        type: Type.OBJECT,
        properties,
        required
    };
}

const systemInstruction = `You are an expert Islamic scholar. Your purpose is to provide authentic and relevant Islamic teachings in a structured JSON format. You will be given a topic and a 'view' that determines the required output format.
- If the view is 'quran', find Quranic verses related to the topic.
- If the view is 'hadith', find Hadith related to the topic.
- If the view is 'stories', find inspirational stories related to the topic.
- If the view is 'home', find both Quranic verses and Hadith related to the topic.
- Always provide content that is directly related to the user's topic. For example, if the topic is "the story of Prophet Musa" and the view is 'stories', provide the story, not verses about him.
- Ensure all required fields in the JSON schema are filled. For Quran, include Arabic, English, and Urdu translations. For Hadith, include English and Urdu translations.`;

// Vercel Serverless Function handler
export default async function handler(request: Request) {
    // Handle CORS preflight requests for local development
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API Key not configured on the server.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const { topic, view } = (await request.json()) as { topic: string, view: ActiveView };

        if (!topic || !view) {
            return new Response(JSON.stringify({ error: 'Missing "topic" or "view" in request body.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const responseSchema = buildSchema(view);
        const contents = `Find Islamic content about: "${topic}".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.6,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Received an empty response from the API.");
        }

        const parsedData: GeneratedContent = JSON.parse(jsonText);
        
        return new Response(JSON.stringify(parsedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        console.error("Error in /api/generate:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}
