package com.sridurga.controller;

import com.sridurga.model.CompanyDetails;
import com.sridurga.service.CompanyDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company-details")
@CrossOrigin(origins = "*")
public class CompanyDetailsController {

    @Autowired
    private CompanyDetailsService service;

    @GetMapping
    public ResponseEntity<CompanyDetails> getCompanyDetails() {
        return ResponseEntity.ok(service.getCompanyDetails());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<CompanyDetails> saveCompanyDetails(@RequestBody CompanyDetails details) {
        return ResponseEntity.ok(service.saveCompanyDetails(details));
    }

    @PutMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<CompanyDetails> updateCompanyDetails(@RequestBody CompanyDetails details) {
        return ResponseEntity.ok(service.saveCompanyDetails(details));
    }
}
