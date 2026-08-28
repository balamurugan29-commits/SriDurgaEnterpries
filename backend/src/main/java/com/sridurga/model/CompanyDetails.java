package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "company_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", length = 200)
    private String companyName = "";

    @Column(name = "address", length = 500)
    private String address = "";

    @Column(name = "phone", length = 50)
    private String phone = "";

    @Column(name = "email", length = 100)
    private String email = "";

    @Column(name = "gstin", length = 50)
    private String gstin = "";

    @Column(name = "pan", length = 50)
    private String pan = "";

    @Column(name = "state", length = 100)
    private String state = "";

    @Column(name = "epf_code", length = 50)
    private String epfCode = "";

    @Column(name = "esi_code", length = 50)
    private String esiCode = "";

    @Column(name = "bank_name", length = 150)
    private String bankName = "";

    @Column(name = "branch", length = 150)
    private String branch = "";

    @Column(name = "account_number", length = 50)
    private String accountNumber = "";

    @Column(name = "ifsc_code", length = 50)
    private String ifscCode = "";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
