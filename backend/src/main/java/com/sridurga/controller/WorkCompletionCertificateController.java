package com.sridurga.controller;

import com.sridurga.model.WorkCompletionCertificate;
import com.sridurga.service.WorkCompletionCertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-completion-certificates")
@CrossOrigin(origins = "*")
public class WorkCompletionCertificateController {

    @Autowired
    private WorkCompletionCertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<WorkCompletionCertificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkCompletionCertificate> getCertificateById(@PathVariable Long id) {
        return certificateService.getCertificateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextCertificateNo() {
        String nextNo = certificateService.generateNextCertificateNo();
        return ResponseEntity.ok(Map.of("nextCertificateNo", nextNo, "certificateNo", nextNo));
    }

    @PostMapping
    public ResponseEntity<WorkCompletionCertificate> createCertificate(@RequestBody WorkCompletionCertificate certificate) {
        return ResponseEntity.ok(certificateService.createCertificate(certificate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkCompletionCertificate> updateCertificate(@PathVariable Long id, @RequestBody WorkCompletionCertificate certificate) {
        return ResponseEntity.ok(certificateService.updateCertificate(id, certificate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.ok(Map.of("message", "Work Completion Certificate deleted successfully"));
    }
}
