package com.learn.SpringAiCode.Controller;

import org.springframework.ai.chat.client.ChatClient;
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

    // constructor to inject the model
    public OpenAiController(OpenAiChatModel chatModel) {
        // create a new chat client with the model
        this.chatClient = ChatClient.create(chatModel);
    }

    // get mapping
    @GetMapping("/{message}")
    public ResponseEntity<String> getAnswer(@PathVariable String message) {
        // create a prompt from the message
        String response = chatClient
                .prompt(message)
                // make the call
                .call()
                // get the response content
                .content();
        // return the response
        return ResponseEntity.ok(response);
    }
}
