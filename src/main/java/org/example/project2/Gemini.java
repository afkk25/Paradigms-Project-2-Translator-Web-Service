package org.example.project2;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import io.github.cdimascio.dotenv.Dotenv;

public class Gemini {
    public String GenerateTranslation(String toTranslate) {
//        Dotenv dotenv = Dotenv.configure()
//                .directory("C:/Users/afafb/OneDrive/Desktop/CSC 3374/Project2/.env")
//                .load();
        Dotenv dotenv = Dotenv.load();
        String apiKey = dotenv.get("GOOGLE_API_KEY");

        Client client = Client.builder()
                .apiKey(apiKey)
                .build();

        String prompt = """
            You are a professional translator specializing in Moroccan Arabic Dialect (Darija).      
            Your task: Translate the input text into Darija.
            
            Rules:
            - Respond with ONLY the translated text, nothing else
            - No explanations, no notes, no alternatives
            - No introductory phrases like "Here is the translation:" or "Translation:"
            - Preserve the tone and meaning of the original
            - Use Arabic script
           
            Text to translate:
        """ + toTranslate;

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-2.5-flash",
                        prompt,
                        null);

        return response.text();
    }

}
