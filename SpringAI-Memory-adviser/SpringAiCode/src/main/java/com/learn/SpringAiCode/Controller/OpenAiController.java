package com.learn.SpringAiCode.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class OpenAiController {

    private ChatClient chatClient;

    ChatMemory chatMemory = MessageWindowChatMemory.builder().build();

    public OpenAiController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultAdvisors(MessageChatMemoryAdvisor
                        .builder(chatMemory)
                        .build())
                .build();
    }

    @GetMapping("/{message}")
    public ResponseEntity<String> getAnswer(@PathVariable String message) {

        ChatResponse chatResponse = chatClient
                .prompt(message)
                .call()
                .chatResponse();


        // Get the response from the chat model
        String response = chatResponse
                .getResult()
                .getOutput()
                .getText();

        // Return the response as a ResponseEntity
        return ResponseEntity.ok(response);
    }
}
