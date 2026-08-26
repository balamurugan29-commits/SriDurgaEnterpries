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

			// Seed Initial Item Master Records
			if (itemMasterRepository.count() == 0) {
				createSampleItem(itemMasterRepository, 1, "W101", "Industrial Washer 10mm Standard Heavy Duty", new BigDecimal("100.00"), new BigDecimal("15.50"));
				createSampleItem(itemMasterRepository, 2, "W102", "Spring Lock Washer 12mm High Tensile", new BigDecimal("250.00"), new BigDecimal("22.00"));
				System.out.println(">>> Initialized 2 sample items in Item Master");
			}
		};
	}

	private void createSampleItem(ItemMasterRepository repo, Integer serialNo, String code, String desc, BigDecimal qty, BigDecimal rate) {
		ItemMaster item = new ItemMaster();
		item.setSerialNumber(serialNo);
		item.setItemCode(code);
		item.setDescription(desc);
		item.setQuantity(qty);
		item.setRate(rate);
		item.setAmount(qty.multiply(rate));
		repo.save(item);
	}
}
