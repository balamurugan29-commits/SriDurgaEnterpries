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
    private String companyName = "SRI DURGA ENTERPRISES";

    @Column(name = "address", length = 500)
    private String address = "No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602";

    @Column(name = "phone", length = 50)
    private String phone = "9842492946";

    @Column(name = "email", length = 100)
    private String email = "sridurgaenterprises@yahoo.com";

    @Column(name = "gstin", length = 50)
    private String gstin = "34ABDFS4476N1ZN";

    @Column(name = "pan", length = 50)
    private String pan = "ABDFS4476N";

    @Column(name = "state", length = 100)
    private String state = "Puducherry (34)";

    @Column(name = "epf_code", length = 50)
    private String epfCode = "PC 1758";

    @Column(name = "esi_code", length = 50)
    private String esiCode = "55000426770000602";

    @Column(name = "bank_name", length = 150)
    private String bankName = "Bank of India";

    @Column(name = "branch", length = 150)
    private String branch = "Karaikal";

    @Column(name = "account_number", length = 50)
    private String accountNumber = "811030100000006";

    @Column(name = "ifsc_code", length = 50)
    private String ifscCode = "BKID0008110";

    @Column(name = "contract_no", length = 100)
    private String contractNo = "9010038288";

    @Column(name = "contract_period", length = 150)
    private String contractPeriod = "01.05.2024 to 30.04.2027";

    @Column(name = "bg_no", length = 150)
    private String bgNo = "8110IPEBG240001  Validity Upto : 30.09.2027";

    @Column(name = "vendor_code", length = 50)
    private String vendorCode = "840305";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
