package com.learn.SpringAiCode.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class OpenAiController {

    private ChatClient chatClient;

    @Autowired
    private EmbeddingModel embeddingModel;

    public OpenAiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();

    }

    @GetMapping("/{message}")
    public ResponseEntity<String> getAnswer(@PathVariable String message) {

        ChatResponse chatResponse = chatClient
                .prompt(message)
                .call()
                .chatResponse();


        System.out.println(chatResponse.getMetadata().getModel());

        // Get the response from the chat model
        String response = chatResponse
                .getResult()
                .getOutput()
                .getText();

        // Return the response as a ResponseEntity
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recommend")
    public String recommend(@RequestParam String type,
                            @RequestParam String year,
                            @RequestParam String lang){

        String template = """
                             I want to watch a {type} movie tonight with good rating,
                             looking for movies around this year {year}.
                             The language im looking for is {lang}.
                             Suggest one specific and tell me the cast and length of movie.
                             
                             response format should be
                             1. Movie name
                             2. Basic plot
                             3. cast
                             4. length
                             5. IMDB rating
                          """;

        PromptTemplate promptTemplate = new PromptTemplate(template);
        Prompt prompt = promptTemplate.create(Map.of("type", type, "year", year, "lang", lang));

        String response = chatClient
                .prompt(prompt)
                .call()
                .content();

        return response;
    }

    @PostMapping("/embedding")
    public float[] embedding(@RequestParam String text) {
       return embeddingModel.embed(text);
    }
}
