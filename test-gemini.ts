import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGemini() {
  console.log('Checking Gemini API key...');

  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY NOT FOUND');
    return;
  }

  console.log('✅ GEMINI_API_KEY FOUND');

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Reply with exactly: GEMINI WORKING',
    });

    console.log('✅ GEMINI API WORKING');
    console.log('Response:', response.text);
  } catch (error) {
    console.log('❌ GEMINI API FAILED');
    console.error(error);
  }
}

testGemini();