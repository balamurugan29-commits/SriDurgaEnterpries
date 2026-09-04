package com.sridurga;

import com.sridurga.model.CustomerMaster;
import com.sridurga.model.EmployeeMaster;
import com.sridurga.model.EmployeeSalary;
import com.sridurga.model.EmployeeAdvance;
import com.sridurga.model.User;
import com.sridurga.repository.CustomerMasterRepository;
import com.sridurga.repository.EmployeeMasterRepository;
import com.sridurga.repository.EmployeeSalaryRepository;
import com.sridurga.repository.EmployeeAdvanceRepository;
import com.sridurga.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@SpringBootApplication
public class SriDurgaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SriDurgaApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(
			UserRepository userRepository,
			CustomerMasterRepository customerMasterRepository,
			EmployeeMasterRepository employeeMasterRepository,
			EmployeeSalaryRepository salaryRepository,
			EmployeeAdvanceRepository advanceRepository,
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
				staff.setPermissions("dashboard,master,customer-master,employee-master,attendance,challan,challan-list,proforma-invoice,proforma-invoice-history,gate-pass,gate-pass-list,job-card,job-card-history,work-completion,work-completion-history");
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

			// 4. Preserve Sample Employee Master Profiles if empty
			if (employeeMasterRepository.count() == 0) {
				EmployeeMaster emp1 = new EmployeeMaster();
				emp1.setSerialNumber(1);
				emp1.setEmployeeNumber("SDE-001");
				emp1.setEmployeeName("R. Balamurugan");
				emp1.setDesignation("Managing Director / Senior Engineer");
				emp1.setDob("1985-05-15");
				emp1.setPhone("9842492946");
				emp1.setEmail("sridurgaenterpriseskkl@gmail.com");
				emp1.setAddress("No. 12, Main Road, Thirumalairajan Pattinam, Karaikal - 609606");
				emp1.setEpfNumber("PC1758/0012480");
				emp1.setEsiNumber("55000426770000602");
				emp1.setBankName("State Bank of India");
				emp1.setBranchName("Karaikal Main");
				emp1.setAccountNumber("30124587965");
				emp1.setIfscCode("SBIN0000854");
				emp1.setJoiningDate("2015-04-01");
				emp1.setStatus("Active");
				emp1.setBloodGroup("O+");
				employeeMasterRepository.save(emp1);

				EmployeeMaster emp2 = new EmployeeMaster();
				emp2.setSerialNumber(2);
				emp2.setEmployeeNumber("SDE-002");
				emp2.setEmployeeName("Ezhil Amuthan");
				emp2.setDesignation("Senior Motor Winder & Technician");
				emp2.setDob("1990-08-20");
				emp2.setPhone("9842012345");
				emp2.setEmail("ezhil@sridurga.com");
				emp2.setAddress("45, Kamarajar Salai, Karaikal - 609602");
				emp2.setEpfNumber("PC1758/0012495");
				emp2.setEsiNumber("55000426770000615");
				emp2.setBankName("Indian Overseas Bank");
				emp2.setBranchName("Karaikal Town");
				emp2.setAccountNumber("028101000045678");
				emp2.setIfscCode("IOBA0000281");
				emp2.setJoiningDate("2018-06-15");
				emp2.setStatus("Active");
				emp2.setBloodGroup("B+");
				employeeMasterRepository.save(emp2);

				System.out.println(">>> Seeded initial Employee Master records");
			}

			// 5. Seed Advance & August 2026 Salary matching screenshot if empty
			if (salaryRepository.count() == 0) {
				EmployeeMaster ezhil = employeeMasterRepository.findByEmployeeNameIgnoreCase("Ezhil Amuthan")
						.orElseGet(() -> {
							List<EmployeeMaster> all = employeeMasterRepository.findAll();
							return all.isEmpty() ? null : all.get(0);
						});

				if (ezhil != null) {
					// Seed Advance
					if (advanceRepository.count() == 0) {
						EmployeeAdvance adv = new EmployeeAdvance();
						adv.setEmployeeId(ezhil.getId());
						adv.setEmployeeName(ezhil.getEmployeeName());
						adv.setEmployeeNumber(ezhil.getEmployeeNumber());
						adv.setAdvanceDate(LocalDate.of(2026, 7, 10));
						adv.setAmount(142000.0);
						adv.setTransactionType("LOAN_GIVEN");
						adv.setBalanceAfter(142000.0);
						adv.setDescription("Personal Advance Loan");
						advanceRepository.save(adv);
					}

					// Seed August - 2026 Salary (Exact match with screenshot)
					EmployeeSalary sal = new EmployeeSalary();
					sal.setEmployeeId(ezhil.getId());
					sal.setEmployeeName(ezhil.getEmployeeName());
					sal.setEmployeeNumber(ezhil.getEmployeeNumber());
					sal.setDesignation(ezhil.getDesignation());
					sal.setSalaryMonth("August - 2026");
					sal.setMonth("August");
					sal.setYear(2026);
					sal.setTotalWorkingDays(26.0);
					sal.setPresentDays(22.0);
					sal.setAbsentDays(4.0);
					sal.setLeaveDays(4.0);
					sal.setTotalWages(23500.00);
					sal.setLeaveWage(3615.38);
					sal.setIncentive(0.00);
					sal.setEpfAndEsi(1205.13);
					sal.setLop(3615.38);
					sal.setAdvDeducted(1000.00);
					sal.setNetCredit(21295.00);
					sal.setCurrentAdvance(0.00);
					sal.setBalanceAdvance(141000.00);
					sal.setPaymentStatus("PAID");
					sal.setPaymentDate("2026-09-01");
					sal.setPaymentMode("Bank Transfer");
					sal.setBankName(ezhil.getBankName());
					sal.setAccountNumber(ezhil.getAccountNumber());
					sal.setIfscCode(ezhil.getIfscCode());
					sal.setEpfNumber(ezhil.getEpfNumber());
					sal.setEsiNumber(ezhil.getEsiNumber());
					salaryRepository.save(sal);

					System.out.println(">>> Seeded sample August 2026 Salary record for: " + ezhil.getEmployeeName());
				}
			}
		};
	}
}
