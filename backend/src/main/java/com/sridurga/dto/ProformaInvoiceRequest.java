package com.sridurga.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProformaInvoiceRequest {

    private String proformaNumber;
    private LocalDate proformaDate;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private String vendorCode;
    private String poNumber;
    private String poDate;
    private String epfCode;
    private String esiCode;
    private String gstin;
    private String pan;
    private String stateCode;
    private String customerPan;
    private String customerGstin;
    private String customerStateCode;
    private String sacCode;
    private BigDecimal gstPercent;
    private String equipmentHeader;
    private BigDecimal totalAmount;
    private String notes;
    private List<ProformaItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProformaItemDto {
        private Integer serialNumber;
        private String itemCode;
        private String description;
        private String unit;
        private BigDecimal quantity;
        private BigDecimal rate;
        private BigDecimal amount;
    }
}
