package com.sridurga.controller;

import com.sridurga.dto.ProformaInvoiceRequest;
import com.sridurga.model.ProformaInvoice;
import com.sridurga.service.ProformaInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proforma-invoices")
@CrossOrigin(origins = "*")
public class ProformaInvoiceController {

    @Autowired
    private ProformaInvoiceService proformaInvoiceService;

    @GetMapping
    public ResponseEntity<List<ProformaInvoice>> getAllProformas() {
        return ResponseEntity.ok(proformaInvoiceService.getAllProformas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProformaById(@PathVariable Long id) {
        return proformaInvoiceService.getProformaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/generate-next-number")
    public ResponseEntity<Map<String, String>> generateNextNumber() {
        String nextNumber = proformaInvoiceService.generateNextProformaNumber();
        return ResponseEntity.ok(Collections.singletonMap("proformaNumber", nextNumber));
    }

    @PostMapping
    public ResponseEntity<?> createProforma(@RequestBody ProformaInvoiceRequest request) {
        try {
            ProformaInvoice created = proformaInvoiceService.createProforma(request);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("message", "Failed to create Proforma Invoice: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProforma(@PathVariable Long id, @RequestBody ProformaInvoiceRequest request) {
        try {
            ProformaInvoice updated = proformaInvoiceService.updateProforma(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("message", "Failed to update Proforma Invoice: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProforma(@PathVariable Long id) {
        try {
            proformaInvoiceService.deleteProforma(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Proforma Invoice deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("message", "Failed to delete Proforma Invoice: " + e.getMessage()));
        }
    }
}
