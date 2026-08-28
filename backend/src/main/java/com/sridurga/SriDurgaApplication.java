package com.sridurga;

import com.sridurga.model.CustomerMaster;
import com.sridurga.model.User;
import com.sridurga.repository.CustomerMasterRepository;
import com.sridurga.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SriDurgaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SriDurgaApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(
			UserRepository userRepository,
			CustomerMasterRepository customerMasterRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Seed Master Admin User (admin / admin123)
			if (userRepository.findByUserId("admin").isEmpty()) {
				User admin = new User();
				admin.setUserId("admin");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setFullName("Sri Durga Administrator");
				admin.setRole("ADMIN");
				admin.setPermissions("all");
				userRepository.save(admin);
				System.out.println(">>> Initialized default user: admin / admin123");
			}

			// 2. Seed Default Staff User (staff / staff123)
			if (userRepository.findByUserId("staff").isEmpty()) {
				User staff = new User();
				staff.setUserId("staff");
				staff.setPassword(passwordEncoder.encode("staff123"));
				staff.setFullName("Billing & Dispatch Staff");
				staff.setRole("STAFF");
				staff.setPermissions("dashboard,master,customer-master,challan,challan-list,proforma-invoice,proforma-invoice-history,gate-pass,gate-pass-list,job-card,job-card-history,work-completion,work-completion-history");
				userRepository.save(staff);
				System.out.println(">>> Initialized default user: staff / staff123");
			}

			// 3. Preserve Client Office Master Profile (Ocean Sparkle Ltd with GSTIN, PAN, etc.)
			if (customerMasterRepository.count() == 0) {
				CustomerMaster cust = new CustomerMaster();
				cust.setSerialNumber(1);
				cust.setCustomerName("M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd.");
				cust.setGstin("34AAACO2519H1ZR");
				cust.setPan("AAACO2519H");
				cust.setStateCode("PUDUCHERRY (34)");
				cust.setPhone("9842492946");
				cust.setAddress("Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606.");
				customerMasterRepository.save(cust);
				System.out.println(">>> Preserved Client Office Profile: M/s, Ocean Sparkle Ltd");
			}
		};
	}
}
