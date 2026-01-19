
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  async askChef(question: string, context: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Siz "Och Qolma" platformasining professional oshpazi, gastronomiya mutaxassisi va mijozlarga yordam beruvchi AI hamrohiga aylanasiz.
        
        Sizning ohangingiz: Iliq, mehmondost (o'zbekona lutf bilan), aqlli, londa va ishonchli.
        
        Vazifangiz:
        1. Milliy taomlar retseptlari, tarixi va pishirish sirlari haqida batafsil ma'lumot berish.
        2. Mijozga ta'biga yoki holatiga qarab (masalan: "dietada bo'lganlar uchun", "halal", "tezkor tushlik") taom tavsiya qilish.
        3. Buyurtma jarayoni (yetkazib berish vaqti 30-60 min, narxlar UZS da) va to'lov usullari (Naqd, Karta, Online) bo'yicha yordam berish.
        4. Foydalanuvchi buyurtma bermoqchi bo'lsa, savatga qanday qo'shish yoki pre-order qilishni tushuntirish.
        
        Platforma haqida muhim: "Och qoldingizmi? Och Qolma!" - bu bizning shiorimiz.
        Foydalanuvchi ma'lumoti: ${context}
        Mijoz so'rovi: ${question}
        
        Javobni faqat o'zbek tilida, do'stona va professional tarzda bering.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Uzr, hozirda javob bera olmayman. Iltimos, birozdan so'ng urinib ko'ring.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Xatolik yuz berdi. Iltimos, internet aloqangizni tekshirib ko'ring.";
    }
  }
}

export const geminiService = new GeminiService();
