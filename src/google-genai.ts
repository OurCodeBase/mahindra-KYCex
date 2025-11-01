import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY
})

const prompt = `
You are an intelligent data parser. Your task is to extract structured address components from unstructured text.

Extract and return the data in the following JSON structure:
{
  "streetName": "",
  "addressLine1": "",
  "addressLine2": ""
}

### Rules:
1. "streetName" -> Extract parts starting with or containing words like "S/O", "D/O", "W/O", or "C/O" (e.g., "S/O RAHUL KUMAR").
2. "addressLine1" -> Extract parts starting with or containing "VILL", "VILLAGE", "HOUSE NO", "H.NO", "HO", "R/O", or "MOHALLA".
3. "addressLine2" -> Extract parts containing "NEAR", "ROAD", "POST", "BEHIND", or any remaining location descriptors like city, town, or landmark names.
4. Maintain original casing and punctuation.
5. If there is no addressLine1 then put addressLine2 in addressLine1.
6. Return **only** the JSON structure - no explanations, comments, or extra text.

### Example Input:
S/O RAHUL KUMAR HOUSE NO-483, MOHALLA-MAKABRA NEAR CHATRI WALA KUAN NAJIBABAD BIJNOR

### Example Output:
{
  "streetName": "S/O RAHUL KUMAR",
  "addressLine1": "HOUSE NO-483, MOHALLA-MAKABRA",
  "addressLine2": "NEAR CHATRI WALA KUAN NAJIBABAD BIJNOR"
}

Now, parse the following input accordingly:
`;

type Address = {
  streetName: string,
  addressLine1: string,
  addressLine2: string
}

export async function extractAddress(address: string): Promise<Address> {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt + address
  })
  if (!response.text) throw new Error("There's no response from gemini!");
  const body = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(body);
}
