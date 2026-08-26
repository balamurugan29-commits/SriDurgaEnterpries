package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false)
    private Integer serialNumber;

    @Column(name = "item_code", nullable = false, unique = true, length = 100)
    private String itemCode;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(length = 20)
    private String unit = "No";

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "service_charge", precision = 18, scale = 2)
    private BigDecimal serviceCharge = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void calculateAmount() {
        this.updatedAt = LocalDateTime.now();
        BigDecimal r = this.rate != null ? this.rate : BigDecimal.ZERO;
        BigDecimal sc = this.serviceCharge != null ? this.serviceCharge : BigDecimal.ZERO;
        BigDecimal q = this.quantity != null ? this.quantity : BigDecimal.ZERO;
        // Amount = Quantity * (Rate + Service Charge)
        this.amount = q.multiply(r.add(sc));
    }
}
