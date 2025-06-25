package com.learn.SpringAiCode;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringAiCodeApplication {

	public static void main(String[] args) {
		// Load the .env file into system environment variables before Spring initializes
		Dotenv dotenv = Dotenv.load();
		dotenv.entries().forEach(entry ->
					System.setProperty(entry.getKey(), entry.getValue())
				);
		SpringApplication.run(SpringAiCodeApplication.class, args);
	}

}
