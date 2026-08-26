package com.sridurga;

import com.sridurga.model.ItemMaster;
import com.sridurga.model.User;
import com.sridurga.repository.ItemMasterRepository;
import com.sridurga.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class SriDurgaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SriDurgaApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository, ItemMasterRepository itemMasterRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Seed Default User (User ID: admin / Password: password123)
			if (userRepository.findByUserId("admin").isEmpty()) {
				User admin = new User();
				admin.setUserId("admin");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setFullName("Sri Durga Administrator");
				admin.setRole("ADMIN");
				userRepository.save(admin);
				System.out.println(">>> Initialized default user: admin / admin123");
			}

		};
	}
}
