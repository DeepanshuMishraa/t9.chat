import {
	GoogleGenAI,
	createPartFromUri,
	createUserContent,
} from "@google/genai";

export async function POST(req: Request) {
	try {
		const {
			fileUrl,
			prompt = "Describe what you see in this image in detail.",
			apiKey,
		} = await req.json();

		if (!fileUrl || !apiKey) {
			return new Response("File URL and API key are required", { status: 400 });
		}
		const response = await fetch(fileUrl);
		if (!response.ok) {
			return new Response("Failed to fetch image from URL", { status: 400 });
		}

		const blob = await response.blob();
		const file = new File([blob], "uploaded-image.png", { type: blob.type });

		const ai = new GoogleGenAI({ apiKey });
		const fileInput = await ai.files.upload({
			file: file,
			config: {
				mimeType: blob.type || "image/png",
			},
		});

		const analysisResponse = await ai.models.generateContent({
			model: "gemini-2.0-flash",
			contents: createUserContent([
				createPartFromUri(
					fileInput.uri as string,
					fileInput.mimeType as string,
				),
				prompt,
			]),
		});

		const analysisText = analysisResponse.text;

		return new Response(
			JSON.stringify({
				analysis: analysisText,
				success: true,
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Image understanding failed:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to analyze image",
				success: false,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
