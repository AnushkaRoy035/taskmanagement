package com.tasknest.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.tasknest.entity")
@EnableJpaRepositories("com.tasknest.repository")
@ComponentScan(basePackages = "com.tasknest")
public class TasknestApplication {

	public static void main(String[] args) {
		SpringApplication.run(TasknestApplication.class, args);
	}

}
