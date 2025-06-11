
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AISolutionRequest } from '../types';
import { AI_MODEL_NAME } from '../constants';

// Access API_KEY using process.env as per guidelines
// Vite replaces process.env.API_KEY with the value from the build environment (e.g., .env file)
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This warning will appear if the API_KEY was not found in the build environment
  console.warn("API_KEY environment variable not set or not passed correctly through Vite. Gemini API calls will fail. Ensure API_KEY is available in your .env file or system environment during build.");
}

// GoogleGenAI instance will be created lazily inside getAiHelp
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
  }
  return null;
}

//function cleanJsonString(jsonStr: string): string {
//  let cleaned = jsonStr.trim();
//  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
//  const match = cleaned.match(fenceRegex);
//  if (match && match[2]) {
//    cleaned = match[2].trim();
//  }
//  return cleaned;
//}

export async function getAiHelp(request: AISolutionRequest): Promise<string> {
  const currentAiInstance = getAiInstance();

  if (!currentAiInstance) { 
    // This means API_KEY was not available
    return "ข้อผิดพลาด: ไม่ได้ตั้งค่า API Key สำหรับ Gemini อย่างถูกต้อง หรือ API Key ไม่ถูกต้อง";
  }
  
  const { problemNumbers, target, operators, playerEquation, isCorrectAttempt } = request;

  let prompt = `คุณคือผู้ช่วยสอนคณิตศาสตร์ที่เป็นมิตรสำหรับเกม "180 IQ : เกมส์คนอัจฉริยะ"\n`;
  prompt += `โจทย์คือ: ใช้ตัวเลข [${problemNumbers.join(', ')}] เพื่อสร้างสมการให้ได้ผลลัพธ์เท่ากับ ${target}.\n`;
  prompt += `อนุญาตให้ใช้เครื่องหมายทางคณิตศาสตร์เหล่านี้: ${operators.join(', ')} (โดย ^ คือยกกำลัง, √ คือรากที่สอง, ! คือแฟกทอเรียล).\n`;
  prompt += `พยายามใช้ตัวเลขที่ให้มาทุกตัวในสมการถ้าเป็นไปได้ และใช้แต่ละตัวเพียงครั้งเดียวตามจำนวนที่มีในโจทย์.\n\n`;

  if (isCorrectAttempt && playerEquation) {
    prompt += `ผู้เล่นตอบถูกด้วยสมการนี้: ${playerEquation}\n`;
    prompt += `กรุณาแสดงวิธีคิดแบบอื่น อีก 1 วิธี ที่แตกต่างออกไปเพื่อแก้โจทย์นี้ โดยใช้ตัวเลขและเครื่องหมายที่กำหนด อธิบายขั้นตอนถ้าเป็นไปได้\n`;
  } else if (playerEquation) {
    prompt += `ผู้เล่นพยายามตอบด้วยสมการนี้: ${playerEquation} แต่มันผิดหรือไม่สมบูรณ์.\n`;
    prompt += `กรุณาแสดงวิธีคิดที่ถูกต้อง 1 วิธีเพื่อแก้โจทย์นี้ อธิบายขั้นตอนให้ชัดเจน\n`;
  } else { // Skipped question
    prompt += `ผู้เล่นข้ามข้อนี้ไป กรุณาแสดงวิธีคิดที่ถูกต้อง 1 วิธีเพื่อแก้โจทย์นี้ อธิบายขั้นตอนให้ชัดเจน\n`;
  }
  prompt += `คำตอบของคุณควรเป็นสมการและคำอธิบายสั้นๆ (ถ้ามี).\n`;

  try {
    const response: GenerateContentResponse = await currentAiInstance.models.generateContent({
      model: AI_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text || "ไม่สามารถรับข้อมูลจาก AI ได้";
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
        // If the error is about the API key still (e.g., invalid format after all checks),
        // it will be caught here.
        if (error.message.toLowerCase().includes("api key")) {
             return `เกิดข้อผิดพลาดเกี่ยวกับ API Key: ${error.message}. กรุณาตรวจสอบ API Key ของคุณ`;
        }
        return `เกิดข้อผิดพลาดในการสื่อสารกับ AI: ${error.message}`;
    }
    return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการสื่อสารกับ AI";
  }
}
