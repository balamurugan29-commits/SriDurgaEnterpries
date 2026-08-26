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
        String inv = ledger.getInvoiceNo() != null ? ledger.getInvoiceNo().trim() : "";
        String dealer = ledger.getDealerStoreName() != null ? ledger.getDealerStoreName().trim() : "";

        // Check duplicate only if invoiceNo is NOT a dash / placeholder / empty and dealer is provided
        if (!inv.isEmpty() && !inv.equals("-") && !inv.equalsIgnoreCase("N/A") && !dealer.isEmpty()) {
            boolean exists = purchaseLedgerRepository.existsByDealerStoreNameIgnoreCaseAndInvoiceNoIgnoreCase(dealer, inv);
            if (exists) {
                return ResponseEntity.badRequest().body("Duplicate entry: A bill with Invoice No. '" + inv + "' already exists for dealer '" + dealer + "'!");
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
        List<PurchaseLedger> toSave = new java.util.ArrayList<>();
        java.util.Set<String> seenInBatch = new java.util.HashSet<>();

        for (int i = 0; i < ledgers.size(); i++) {
            PurchaseLedger l = ledgers.get(i);
            String inv = l.getInvoiceNo() != null ? l.getInvoiceNo().trim() : "";
            String dealer = l.getDealerStoreName() != null ? l.getDealerStoreName().trim() : "";

            if (!inv.isEmpty() && !inv.equals("-") && !inv.equalsIgnoreCase("N/A") && !dealer.isEmpty()) {
                String key = dealer.toUpperCase() + "___" + inv.toUpperCase();
                if (seenInBatch.contains(key) || purchaseLedgerRepository.existsByDealerStoreNameIgnoreCaseAndInvoiceNoIgnoreCase(dealer, inv)) {
                    continue; // Skip duplicate for same dealer
                }
                seenInBatch.add(key);
            }

            if (l.getSerialNumber() == null) {
                l.setSerialNumber((int) (currentCount + toSave.size() + 1));
            }
            l.computeBalance();
            toSave.add(l);
        }
        return purchaseLedgerRepository.saveAll(toSave);
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
