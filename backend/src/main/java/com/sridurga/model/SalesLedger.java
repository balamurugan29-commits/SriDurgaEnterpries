package com.sridurga.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_ledger")
public class SalesLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number")
    private Integer serialNumber;

    @Column(name = "invoice_no", nullable = false)
    private String invoiceNo;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "billed_to_remarks", columnDefinition = "TEXT")
    private String billedToRemarks;

    @Column(name = "taxable_amount", precision = 18, scale = 2)
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "igst", precision = 18, scale = 2)
    private BigDecimal igst = BigDecimal.ZERO;

    @Column(name = "sgst", precision = 18, scale = 2)
    private BigDecimal sgst = BigDecimal.ZERO;

    @Column(name = "ugst", precision = 18, scale = 2)
    private BigDecimal ugst = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 18, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "it_tds", precision = 18, scale = 2)
    private BigDecimal itTds = BigDecimal.ZERO;

    @Column(name = "gst_tds", precision = 18, scale = 2)
    private BigDecimal gstTds = BigDecimal.ZERO;

    @Column(name = "passed_amount", precision = 18, scale = 2)
    private BigDecimal passedAmount = BigDecimal.ZERO;

    @Column(name = "passed_date")
    private LocalDate passedDate;

    @Column(name = "mode_of_payment")
    private String modeOfPayment;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SalesLedger() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(Integer serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public String getBilledToRemarks() {
        return billedToRemarks;
    }

    public void setBilledToRemarks(String billedToRemarks) {
        this.billedToRemarks = billedToRemarks;
    }

    public BigDecimal getTaxableAmount() {
        return taxableAmount;
    }

    public void setTaxableAmount(BigDecimal taxableAmount) {
        this.taxableAmount = taxableAmount;
    }

    public BigDecimal getIgst() {
        return igst;
    }

    public void setIgst(BigDecimal igst) {
        this.igst = igst;
    }

    public BigDecimal getSgst() {
        return sgst;
    }

    public void setSgst(BigDecimal sgst) {
        this.sgst = sgst;
    }

    public BigDecimal getUgst() {
        return ugst;
    }

    public void setUgst(BigDecimal ugst) {
        this.ugst = ugst;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getItTds() {
        return itTds;
    }

    public void setItTds(BigDecimal itTds) {
        this.itTds = itTds;
    }

    public BigDecimal getGstTds() {
        return gstTds;
    }

    public void setGstTds(BigDecimal gstTds) {
        this.gstTds = gstTds;
    }

    public BigDecimal getPassedAmount() {
        return passedAmount;
    }

    public void setPassedAmount(BigDecimal passedAmount) {
        this.passedAmount = passedAmount;
    }

    public LocalDate getPassedDate() {
        return passedDate;
    }

    public void setPassedDate(LocalDate passedDate) {
        this.passedDate = passedDate;
    }

    public String getModeOfPayment() {
        return modeOfPayment;
    }

    public void setModeOfPayment(String modeOfPayment) {
        this.modeOfPayment = modeOfPayment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
