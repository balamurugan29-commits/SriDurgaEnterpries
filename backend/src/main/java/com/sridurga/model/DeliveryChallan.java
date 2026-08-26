package com.sridurga.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivery_challan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryChallan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challan_number", nullable = false, unique = true, length = 50)
    private String challanNumber;

    @Column(name = "challan_date", nullable = false)
    private LocalDate challanDate;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_address", length = 500)
    private String customerAddress;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "vendor_code", length = 50)
    private String vendorCode;

    @Column(name = "po_number", length = 50)
    private String poNumber;

    @Column(name = "po_date", length = 50)
    private String poDate;

    @Column(name = "epf_code", length = 50)
    private String epfCode;

    @Column(name = "esi_code", length = 50)
    private String esiCode;

    @Column(name = "gstin", length = 50)
    private String gstin;

    @Column(name = "pan", length = 50)
    private String pan;

    @Column(name = "state_code", length = 50)
    private String stateCode;

    @Column(name = "customer_pan", length = 50)
    private String customerPan;

    @Column(name = "customer_gstin", length = 50)
    private String customerGstin;

    @Column(name = "customer_state_code", length = 50)
    private String customerStateCode;

    @Column(name = "sac_code", length = 50)
    private String sacCode;

    @Column(name = "gst_percent", precision = 5, scale = 2)
    private BigDecimal gstPercent = new BigDecimal("18");

    @Column(name = "equipment_header", length = 255)
    private String equipmentHeader;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "deliveryChallan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ChallanItem> items = new ArrayList<>();

    public void addItem(ChallanItem item) {
        items.add(item);
        item.setDeliveryChallan(this);
    }

    public void recalculateTotal() {
        this.totalAmount = items.stream()
                .map(ChallanItem::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
