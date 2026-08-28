package com.sridurga.dto;

import com.sridurga.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatabaseBackupDTO {
    private String app;
    private String version;
    private String exportTimestamp;
    private String databaseEngine;

    @Builder.Default
    private Map<String, Integer> counts = new HashMap<>();

    @Builder.Default
    private List<CompanyDetails> companyDetails = new ArrayList<>();

    @Builder.Default
    private List<CustomerMaster> customers = new ArrayList<>();

    @Builder.Default
    private List<ItemMaster> items = new ArrayList<>();

    @Builder.Default
    private List<DeliveryChallan> deliveryChallans = new ArrayList<>();

    @Builder.Default
    private List<ProformaInvoice> proformaInvoices = new ArrayList<>();

    @Builder.Default
    private List<JobCard> jobCards = new ArrayList<>();

    @Builder.Default
    private List<GatePass> gatePasses = new ArrayList<>();

    @Builder.Default
    private List<WorkCompletionCertificate> workCompletionCertificates = new ArrayList<>();

    @Builder.Default
    private List<SalesLedger> salesLedger = new ArrayList<>();

    @Builder.Default
    private List<PurchaseLedger> purchaseLedger = new ArrayList<>();

    @Builder.Default
    private List<User> users = new ArrayList<>();
}
