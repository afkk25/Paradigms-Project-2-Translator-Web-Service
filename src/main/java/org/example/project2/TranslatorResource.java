package org.example.project2;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

// http://localhost:8080/Project2-1.0-SNAPSHOT/api/translator
@Path("/translator")
public class TranslatorResource {
    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.TEXT_PLAIN)
    @RolesAllowed("user")
    public String translate(String input) {
        Gemini gemini = new Gemini();
        String translated = new String();

        translated = gemini.GenerateTranslation(input);
        return translated;
    }
}