package com.example.sportter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.sportter")
public class SportterApplication {

	public static void main(String[] args) {
		SpringApplication.run(SportterApplication.class, args);
	}

}
