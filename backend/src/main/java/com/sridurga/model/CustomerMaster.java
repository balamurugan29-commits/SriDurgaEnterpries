package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false)
    private Integer serialNumber;

    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "gstin", length = 50)
    private String gstin;

    @Column(name = "pan", length = 50)
    private String pan;

    @Column(name = "state_code", length = 50)
    private String stateCode;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "po_number", length = 100)
    private String poNumber;

    @Column(name = "po_date", length = 50)
    private String poDate;

    @Column(name = "vendor_code", length = 50)
    private String vendorCode;

    @Column(name = "sac_code", length = 50)
    private String sacCode;

    @Column(name = "contract_no", length = 100)
    private String contractNo;

    @Column(name = "contract_period", length = 100)
    private String contractPeriod;

    @Column(name = "bg_no", length = 200)
    private String bgNo;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
