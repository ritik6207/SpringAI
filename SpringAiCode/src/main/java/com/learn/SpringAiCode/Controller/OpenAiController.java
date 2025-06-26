package com.learn.SpringAiCode.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class OpenAiController {

    private ChatClient chatClient;

//    public OpenAiController(OpenAiChatModel chatModel) {
//        this.chatClient = ChatClient.create(chatModel);
//    }

    // Constructor with ChatClient.Builder parameter,
    // when you want
    // to use a single chat model instead of specific OpenAiChatModel or other models
    // than use ChatClient.Builder
    public OpenAiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();

    }

    /**
     * Handle a GET request to the "/api/{message}" endpoint.
     *
     * @param message The message to be sent to the chat model.
     * @return A ResponseEntity with the response from the chat model.
     */
    @GetMapping("/{message}")
    public ResponseEntity<String> getAnswer(@PathVariable String message) {

        // Create a ChatResponse from the chat client based on the message
        ChatResponse chatResponse = chatClient
                .prompt(message)
                .call()
                .chatResponse();

        // Print the name of the model used by the chat client
        System.out.println(chatResponse.getMetadata().getModel());

        // Get the response from the chat model
        String response = chatResponse
                .getResult()
                .getOutput()
                .getText();

        // Return the response as a ResponseEntity
        return ResponseEntity.ok(response);
    }
}
