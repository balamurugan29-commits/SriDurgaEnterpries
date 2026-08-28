package com.sridurga.service;

import com.sridurga.dto.DatabaseBackupDTO;
import com.sridurga.model.*;
import com.sridurga.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class DatabaseBackupService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private CompanyDetailsRepository companyDetailsRepository;

    @Autowired
    private CustomerMasterRepository customerMasterRepository;

    @Autowired
    private ItemMasterRepository itemMasterRepository;

    @Autowired
    private DeliveryChallanRepository deliveryChallanRepository;

    @Autowired
    private ProformaInvoiceRepository proformaInvoiceRepository;

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private GatePassRepository gatePassRepository;

    @Autowired
    private WorkCompletionCertificateRepository workCompletionCertificateRepository;

    @Autowired
    private SalesLedgerRepository salesLedgerRepository;

    @Autowired
    private PurchaseLedgerRepository purchaseLedgerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public DatabaseBackupDTO exportDatabaseBackup() {
        log.info("Starting complete database backup export...");

        List<CompanyDetails> companyDetails = companyDetailsRepository.findAll();
        List<CustomerMaster> customers = customerMasterRepository.findAll();
        List<ItemMaster> items = itemMasterRepository.findAll();
        List<DeliveryChallan> deliveryChallans = deliveryChallanRepository.findAll();
        List<ProformaInvoice> proformaInvoices = proformaInvoiceRepository.findAll();
        List<JobCard> jobCards = jobCardRepository.findAll();
        List<GatePass> gatePasses = gatePassRepository.findAll();
        List<WorkCompletionCertificate> certificates = workCompletionCertificateRepository.findAll();
        List<SalesLedger> salesLedger = salesLedgerRepository.findAll();
        List<PurchaseLedger> purchaseLedger = purchaseLedgerRepository.findAll();
        List<User> users = userRepository.findAll();

        Map<String, Integer> counts = new HashMap<>();
        counts.put("companyDetails", companyDetails.size());
        counts.put("customers", customers.size());
        counts.put("items", items.size());
        counts.put("deliveryChallans", deliveryChallans.size());
        counts.put("proformaInvoices", proformaInvoices.size());
        counts.put("jobCards", jobCards.size());
        counts.put("gatePasses", gatePasses.size());
        counts.put("workCompletionCertificates", certificates.size());
        counts.put("salesLedger", salesLedger.size());
        counts.put("purchaseLedger", purchaseLedger.size());
        counts.put("users", users.size());

        DatabaseBackupDTO backup = DatabaseBackupDTO.builder()
                .app("Sri Durga Enterprises ERP & Billing System")
                .version("1.0.0")
                .exportTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .databaseEngine("H2 / SQL Engine")
                .counts(counts)
                .companyDetails(companyDetails)
                .customers(customers)
                .items(items)
                .deliveryChallans(deliveryChallans)
                .proformaInvoices(proformaInvoices)
                .jobCards(jobCards)
                .gatePasses(gatePasses)
                .workCompletionCertificates(certificates)
                .salesLedger(salesLedger)
                .purchaseLedger(purchaseLedger)
                .users(users)
                .build();

        log.info("Database backup export completed successfully with {} total modules.", counts.size());
        return backup;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> restoreDatabaseBackup(DatabaseBackupDTO backup) {
        log.info("Starting complete database restore from uploaded backup...");

        if (backup == null) {
            throw new IllegalArgumentException("Invalid backup file: Backup data is completely empty.");
        }

        // 1. Clean out existing data in safe foreign key cascade order (child tables first)
        try {
            entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY FALSE").executeUpdate();
        } catch (Exception ignored) {}

        try {
            entityManager.createNativeQuery("DELETE FROM challan_items").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM proforma_items").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM gate_pass_items").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM work_completion_items").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM delivery_challan").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM proforma_invoice").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM gate_pass").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM work_completion_certificates").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM job_card").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM sales_ledger").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM purchase_ledger").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM item_master").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM customer_master").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM company_details").executeUpdate();
            entityManager.flush();
        } finally {
            try {
                entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY TRUE").executeUpdate();
            } catch (Exception ignored) {}
        }

        // 2. Restore Company Details
        int compCount = 0;
        if (backup.getCompanyDetails() != null && !backup.getCompanyDetails().isEmpty()) {
            for (CompanyDetails cd : backup.getCompanyDetails()) {
                cd.setId(null);
                companyDetailsRepository.save(cd);
                compCount++;
            }
        }

        // 3. Restore Customers
        int custCount = 0;
        if (backup.getCustomers() != null && !backup.getCustomers().isEmpty()) {
            for (CustomerMaster cust : backup.getCustomers()) {
                cust.setId(null);
                customerMasterRepository.save(cust);
                custCount++;
            }
        }

        // 4. Restore Items
        int itemCount = 0;
        if (backup.getItems() != null && !backup.getItems().isEmpty()) {
            for (ItemMaster item : backup.getItems()) {
                item.setId(null);
                itemMasterRepository.save(item);
                itemCount++;
            }
        }

        // 5. Restore Delivery Challans / Tax Invoices (with Cascade Items)
        int challanCount = 0;
        if (backup.getDeliveryChallans() != null && !backup.getDeliveryChallans().isEmpty()) {
            for (DeliveryChallan challan : backup.getDeliveryChallans()) {
                challan.setId(null);
                if (challan.getItems() != null) {
                    for (ChallanItem item : challan.getItems()) {
                        item.setId(null);
                        item.setDeliveryChallan(challan);
                    }
                }
                deliveryChallanRepository.save(challan);
                challanCount++;
            }
        }

        // 6. Restore Proforma Invoices (with Cascade Items)
        int proformaCount = 0;
        if (backup.getProformaInvoices() != null && !backup.getProformaInvoices().isEmpty()) {
            for (ProformaInvoice proforma : backup.getProformaInvoices()) {
                proforma.setId(null);
                if (proforma.getItems() != null) {
                    for (ProformaItem item : proforma.getItems()) {
                        item.setId(null);
                        item.setProformaInvoice(proforma);
                    }
                }
                proformaInvoiceRepository.save(proforma);
                proformaCount++;
            }
        }

        // 7. Restore Job Cards
        int jobCardCount = 0;
        if (backup.getJobCards() != null && !backup.getJobCards().isEmpty()) {
            for (JobCard jc : backup.getJobCards()) {
                jc.setId(null);
                jobCardRepository.save(jc);
                jobCardCount++;
            }
        }

        // 8. Restore Gate Passes (with Cascade Items)
        int gatePassCount = 0;
        if (backup.getGatePasses() != null && !backup.getGatePasses().isEmpty()) {
            for (GatePass gp : backup.getGatePasses()) {
                gp.setId(null);
                if (gp.getItems() != null) {
                    for (GatePassItem item : gp.getItems()) {
                        item.setId(null);
                        item.setGatePass(gp);
                    }
                }
                gatePassRepository.save(gp);
                gatePassCount++;
            }
        }

        // 9. Restore Work Completion Certificates (with Cascade Items)
        int certCount = 0;
        if (backup.getWorkCompletionCertificates() != null && !backup.getWorkCompletionCertificates().isEmpty()) {
            for (WorkCompletionCertificate cert : backup.getWorkCompletionCertificates()) {
                cert.setId(null);
                if (cert.getItems() != null) {
                    for (WorkCompletionItem item : cert.getItems()) {
                        item.setId(null);
                        item.setCertificate(cert);
                    }
                }
                workCompletionCertificateRepository.save(cert);
                certCount++;
            }
        }

        // 10. Restore Sales Ledgers
        int salesCount = 0;
        if (backup.getSalesLedger() != null && !backup.getSalesLedger().isEmpty()) {
            for (SalesLedger sl : backup.getSalesLedger()) {
                sl.setId(null);
                salesLedgerRepository.save(sl);
                salesCount++;
            }
        }

        // 11. Restore Purchase Ledgers
        int purchaseCount = 0;
        if (backup.getPurchaseLedger() != null && !backup.getPurchaseLedger().isEmpty()) {
            for (PurchaseLedger pl : backup.getPurchaseLedger()) {
                pl.setId(null);
                purchaseLedgerRepository.save(pl);
                purchaseCount++;
            }
        }

        // 12. Restore Users (or ensure default admin exists)
        int userCount = 0;
        if (backup.getUsers() != null && !backup.getUsers().isEmpty()) {
            try {
                userRepository.deleteAllInBatch();
            } catch (Exception e) {
                entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
            }
            for (User u : backup.getUsers()) {
                u.setId(null);
                userRepository.save(u);
                userCount++;
            }
        } else if (userRepository.count() == 0) {
            // Re-seed default admin and staff if users table was empty
            User admin = new User();
            admin.setUserId("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Sri Durga Administrator");
            admin.setRole("ADMIN");
            admin.setPermissions("all");
            userRepository.save(admin);

            User staff = new User();
            staff.setUserId("staff");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setFullName("Office Staff");
            staff.setRole("STAFF");
            staff.setPermissions("invoice,card,pass,audit");
            userRepository.save(staff);
            userCount = 2;
        }

        entityManager.flush();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Total database restored successfully!");

        Map<String, Integer> restoredCounts = new HashMap<>();
        restoredCounts.put("companyDetails", compCount);
        restoredCounts.put("customers", custCount);
        restoredCounts.put("items", itemCount);
        restoredCounts.put("deliveryChallans", challanCount);
        restoredCounts.put("proformaInvoices", proformaCount);
        restoredCounts.put("jobCards", jobCardCount);
        restoredCounts.put("gatePasses", gatePassCount);
        restoredCounts.put("workCompletionCertificates", certCount);
        restoredCounts.put("salesLedger", salesCount);
        restoredCounts.put("purchaseLedger", purchaseCount);
        restoredCounts.put("users", userCount);

        result.put("counts", restoredCounts);
        log.info("Database restore finished with counts: {}", restoredCounts);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDatabaseSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("companyDetails", companyDetailsRepository.count());
        summary.put("customers", customerMasterRepository.count());
        summary.put("items", itemMasterRepository.count());
        summary.put("deliveryChallans", deliveryChallanRepository.count());
        summary.put("proformaInvoices", proformaInvoiceRepository.count());
        summary.put("jobCards", jobCardRepository.count());
        summary.put("gatePasses", gatePassRepository.count());
        summary.put("workCompletionCertificates", workCompletionCertificateRepository.count());
        summary.put("salesLedger", salesLedgerRepository.count());
        summary.put("purchaseLedger", purchaseLedgerRepository.count());
        summary.put("users", userRepository.count());
        return summary;
    }
}
