package com.sridurga;

import com.sridurga.model.CustomerMaster;
import com.sridurga.model.ItemMaster;
import com.sridurga.model.User;
import com.sridurga.repository.CustomerMasterRepository;
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
	public CommandLineRunner initData(
			UserRepository userRepository,
			ItemMasterRepository itemMasterRepository,
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

			// 3. Seed Reference Rate Contract Items (Only on fresh empty database)
			if (itemMasterRepository.count() == 0) {
				ItemMaster item1 = new ItemMaster();
				item1.setSerialNumber(1);
				item1.setItemCode("70.3");
				item1.setDescription("Supply of RCCB 4P, 63A, 100mA Sensitivity");
				item1.setQuantity(new BigDecimal("4"));
				item1.setUnit("No");
				item1.setRate(new BigDecimal("4500.00"));
				item1.setServiceCharge(BigDecimal.ZERO);
				item1.setFolderName("General");
				item1.calculateAmount();
				itemMasterRepository.save(item1);

				ItemMaster item2 = new ItemMaster();
				item2.setSerialNumber(2);
				item2.setItemCode("122");
				item2.setDescription("S&I of 50mm, 3Mtr GI Earth pipe including chamber");
				item2.setQuantity(new BigDecimal("3"));
				item2.setUnit("No");
				item2.setRate(new BigDecimal("6200.00"));
				item2.setServiceCharge(BigDecimal.ZERO);
				item2.setFolderName("General");
				item2.calculateAmount();
				itemMasterRepository.save(item2);

				ItemMaster item3 = new ItemMaster();
				item3.setSerialNumber(3);
				item3.setItemCode("24.7");
				item3.setDescription("Supply of 3P Power Contactor - 70A");
				item3.setQuantity(new BigDecimal("1"));
				item3.setUnit("No");
				item3.setRate(new BigDecimal("8900.00"));
				item3.setServiceCharge(BigDecimal.ZERO);
				item3.setFolderName("General");
				item3.calculateAmount();
				itemMasterRepository.save(item3);

				System.out.println(">>> Initialized starter Rate Contract item catalog.");
			}

			// 4. Seed Primary Client Template (Only on fresh empty database)
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

				System.out.println(">>> Initialized primary customer profile template.");
			}
		};
	}
}
