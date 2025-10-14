import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY
})

const prompt = `
Your task is to extract structured address components from unformatted Indian addresses and output them as a valid JSON object with the following properties:

{
  "streetName": string,       // S/O (son of)
  "addressLine1": string,     // Half of remaining address.
  "addressLine2": string      // Remainging half part of address.
}

Instructions:
- Always return valid JSON only, without explanations.
- If a field is missing in the input, leave it as an empty string ("").
- Avoid adding extra keys.
- Don't remove any words like P/O or S/O.

Example Input:
"S/O NARESH R/O RAMNAGAR NEAR GOVARDHAN PO-NAGPUR JAMNAGAR"

Example Output:
{
  "streetName": "S/O NARESH",
  "addressLine1": "R/O RAMNAGAR NEAR GOVARDHAN",
  "addressLine2": "PO-NAGPUR JAMNAGAR"
}

Now convert the following address into JSON:
`;

type StructuredAddress = {
  streetName: string,
  addressLine1: string,
  addressLine2: string
}

export async function extractAddress(address: string): Promise<StructuredAddress> {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt + address
  })
  if (!response.text) {
    return {
      streetName: "",
      addressLine1: "",
      addressLine2: ""
    }
  }
  const cleanedResponse = response.text.replace(/```json|```/g, '').trim();
  const structuredAddress = JSON.parse(cleanedResponse);
  return structuredAddress;
}
