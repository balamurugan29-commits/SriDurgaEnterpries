package com.sridurga.controller;

import com.sridurga.model.SalesLedger;
import com.sridurga.repository.SalesLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sales-ledger")
@CrossOrigin(origins = "*")
public class SalesLedgerController {

    @Autowired
    private SalesLedgerRepository salesLedgerRepository;

    @GetMapping
    public List<SalesLedger> getAllSalesLedgers() {
        return salesLedgerRepository.findAllByOrderByInvoiceDateDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesLedger> getSalesLedgerById(@PathVariable Long id) {
        Optional<SalesLedger> item = salesLedgerRepository.findById(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public SalesLedger createSalesLedger(@RequestBody SalesLedger ledger) {
        if (ledger.getSerialNumber() == null) {
            long count = salesLedgerRepository.count();
            ledger.setSerialNumber((int) (count + 1));
        }
        return salesLedgerRepository.save(ledger);
    }

    @PostMapping("/batch")
    public List<SalesLedger> createBatchSalesLedgers(@RequestBody List<SalesLedger> ledgers) {
        return salesLedgerRepository.saveAll(ledgers);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesLedger> updateSalesLedger(@PathVariable Long id, @RequestBody SalesLedger ledgerDetails) {
        Optional<SalesLedger> opt = salesLedgerRepository.findById(id);
        if (opt.isPresent()) {
            SalesLedger ledger = opt.get();
            ledger.setInvoiceNo(ledgerDetails.getInvoiceNo());
            ledger.setInvoiceDate(ledgerDetails.getInvoiceDate());
            ledger.setBilledToRemarks(ledgerDetails.getBilledToRemarks());
            ledger.setTaxableAmount(ledgerDetails.getTaxableAmount());
            ledger.setIgst(ledgerDetails.getIgst());
            ledger.setSgst(ledgerDetails.getSgst());
            ledger.setUgst(ledgerDetails.getUgst());
            ledger.setTaxAmount(ledgerDetails.getTaxAmount());
            ledger.setTotalAmount(ledgerDetails.getTotalAmount());
            ledger.setItTds(ledgerDetails.getItTds());
            ledger.setGstTds(ledgerDetails.getGstTds());
            ledger.setPassedAmount(ledgerDetails.getPassedAmount());
            ledger.setPassedDate(ledgerDetails.getPassedDate());
            ledger.setModeOfPayment(ledgerDetails.getModeOfPayment());
            if (ledgerDetails.getSerialNumber() != null) {
                ledger.setSerialNumber(ledgerDetails.getSerialNumber());
            }
            return ResponseEntity.ok(salesLedgerRepository.save(ledger));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSalesLedger(@PathVariable Long id) {
        if (salesLedgerRepository.existsById(id)) {
            salesLedgerRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
