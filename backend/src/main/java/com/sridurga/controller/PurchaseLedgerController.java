package com.sridurga.controller;

import com.sridurga.model.PurchaseLedger;
import com.sridurga.repository.PurchaseLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchase-ledger")
@CrossOrigin(origins = "*")
public class PurchaseLedgerController {

    @Autowired
    private PurchaseLedgerRepository purchaseLedgerRepository;

    @GetMapping
    public List<PurchaseLedger> getAllPurchaseLedgers() {
        return purchaseLedgerRepository.findAllByOrderByInvoiceDateDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseLedger> getPurchaseLedgerById(@PathVariable Long id) {
        Optional<PurchaseLedger> item = purchaseLedgerRepository.findById(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPurchaseLedger(@RequestBody PurchaseLedger ledger) {
        String dealer = ledger.getDealerStoreName() != null ? ledger.getDealerStoreName().trim() : "";
        if (dealer.isEmpty() && ledger.getSupplierRemarks() != null && !ledger.getSupplierRemarks().trim().isEmpty()) {
            dealer = ledger.getSupplierRemarks().trim();
            ledger.setDealerStoreName(dealer);
        } else if (dealer.isEmpty()) {
            dealer = "Dealer Store";
            ledger.setDealerStoreName(dealer);
        }

        String inv = ledger.getInvoiceNo() != null ? ledger.getInvoiceNo().trim() : "";
        if (inv.isEmpty()) {
            inv = "-";
            ledger.setInvoiceNo(inv);
        }

        if (ledger.getInvoiceDate() == null) {
            ledger.setInvoiceDate(java.time.LocalDate.now());
        }

        // Check duplicate only if invoiceNo is NOT a dash / placeholder / empty, dealer is provided, and invoiceDate matches
        if (!inv.isEmpty() && !inv.equals("-") && !inv.equalsIgnoreCase("N/A")) {
            boolean exists = purchaseLedgerRepository.existsByDealerStoreNameIgnoreCaseAndInvoiceNoIgnoreCaseAndInvoiceDate(dealer, inv, ledger.getInvoiceDate());
            if (exists) {
                return ResponseEntity.badRequest().body("Duplicate entry: A bill with Invoice No. '" + inv + "' dated " + ledger.getInvoiceDate() + " already exists for dealer '" + dealer + "'!");
            }
        }
        if (ledger.getSerialNumber() == null) {
            long count = purchaseLedgerRepository.count();
            ledger.setSerialNumber((int) (count + 1));
        }
        ledger.computeBalance();
        return ResponseEntity.ok(purchaseLedgerRepository.save(ledger));
    }

    @PostMapping("/bulk")
    public List<PurchaseLedger> bulkCreatePurchaseLedgers(@RequestBody List<PurchaseLedger> ledgers) {
        long currentCount = purchaseLedgerRepository.count();
        List<PurchaseLedger> savedList = new java.util.ArrayList<>();
        java.util.Set<String> seenInBatch = new java.util.HashSet<>();

        for (int i = 0; i < ledgers.size(); i++) {
            PurchaseLedger l = ledgers.get(i);
            String dealer = l.getDealerStoreName() != null ? l.getDealerStoreName().trim() : "";
            if (dealer.isEmpty() && l.getSupplierRemarks() != null && !l.getSupplierRemarks().trim().isEmpty()) {
                dealer = l.getSupplierRemarks().trim();
                l.setDealerStoreName(dealer);
            } else if (dealer.isEmpty()) {
                dealer = "Dealer Store";
                l.setDealerStoreName(dealer);
            }

            String inv = l.getInvoiceNo() != null ? l.getInvoiceNo().trim() : "";
            if (inv.isEmpty()) {
                inv = "-";
                l.setInvoiceNo(inv);
            }

            if (l.getInvoiceDate() == null) {
                l.setInvoiceDate(java.time.LocalDate.now());
            }

            if (!inv.equals("-") && !inv.equalsIgnoreCase("N/A")) {
                String dateKey = l.getInvoiceDate() != null ? l.getInvoiceDate().toString() : "";
                String key = dealer.toUpperCase() + "___" + inv.toUpperCase() + "___" + dateKey;
                if (seenInBatch.contains(key) || purchaseLedgerRepository.existsByDealerStoreNameIgnoreCaseAndInvoiceNoIgnoreCaseAndInvoiceDate(dealer, inv, l.getInvoiceDate())) {
                    continue; // Skip duplicate only for same dealer + same invoice + same date
                }
                seenInBatch.add(key);
            }

            if (l.getSerialNumber() == null) {
                l.setSerialNumber((int) (currentCount + savedList.size() + 1));
            }
            l.computeBalance();

            try {
                PurchaseLedger saved = purchaseLedgerRepository.save(l);
                savedList.add(saved);
            } catch (Exception ex) {
                // Log and continue saving rest of batch
                System.err.println("Could not save purchase bill: " + inv + " for dealer: " + dealer + ". Reason: " + ex.getMessage());
            }
        }
        return savedList;
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseLedger> updatePurchaseLedger(@PathVariable Long id, @RequestBody PurchaseLedger ledgerDetails) {
        Optional<PurchaseLedger> opt = purchaseLedgerRepository.findById(id);
        if (opt.isPresent()) {
            PurchaseLedger ledger = opt.get();
            ledger.setDealerStoreName(ledgerDetails.getDealerStoreName());
            ledger.setInvoiceNo(ledgerDetails.getInvoiceNo());
            ledger.setInvoiceDate(ledgerDetails.getInvoiceDate());
            ledger.setTaxableAmount(ledgerDetails.getTaxableAmount());
            ledger.setTaxAmount(ledgerDetails.getTaxAmount());
            ledger.setTotalAmount(ledgerDetails.getTotalAmount());
            ledger.setPaidAmount(ledgerDetails.getPaidAmount());
            ledger.setPaymentDate(ledgerDetails.getPaymentDate());
            ledger.setModeOfPayment(ledgerDetails.getModeOfPayment());
            ledger.setRemarks(ledgerDetails.getRemarks());
            if (ledgerDetails.getSerialNumber() != null) {
                ledger.setSerialNumber(ledgerDetails.getSerialNumber());
            }
            ledger.computeBalance();
            return ResponseEntity.ok(purchaseLedgerRepository.save(ledger));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePurchaseLedger(@PathVariable Long id) {
        if (purchaseLedgerRepository.existsById(id)) {
            purchaseLedgerRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
