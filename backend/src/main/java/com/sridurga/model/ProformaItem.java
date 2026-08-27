package com.sridurga.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "proforma_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProformaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proforma_invoice_id", nullable = false)
    @JsonBackReference
    private ProformaInvoice proformaInvoice;

    @Column(name = "serial_number", nullable = false)
    private Integer serialNumber;

    @Column(name = "item_code", nullable = false, length = 50)
    private String itemCode;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 20)
    private String unit = "No";

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @PrePersist
    @PreUpdate
    public void calculateAmount() {
        if (this.quantity != null && this.rate != null) {
            this.amount = this.quantity.multiply(this.rate);
        } else {
            this.amount = BigDecimal.ZERO;
        }
    }
}
