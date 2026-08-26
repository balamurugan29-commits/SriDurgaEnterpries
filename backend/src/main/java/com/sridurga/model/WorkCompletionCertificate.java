package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_completion_certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkCompletionCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_no", length = 50)
    private String certificateNo;

    @Column(name = "certificate_date")
    private LocalDate certificateDate = LocalDate.now();

    @Column(length = 255)
    private String agency = "SRI DURGA ENTERPRISES, # 10 V.G. Nagar, Kovilpathu, Karaikal";

    @Column(name = "rate_contract_ref", length = 255)
    private String rateContractRef = "KKL/CAU-ASSET/SUPPORT/2023/1240914/SDE/9010038288";

    // Equipment Details / Requirement
    @Column(name = "equipment_description", length = 150)
    private String equipmentDescription = "Material"; // "Material" or "Service"

    @Column(length = 150)
    private String equipment; // Populated when Description is "Service"

    @Column(length = 100)
    private String location = "RMD#GCS";

    @Column(length = 100)
    private String make = "-";

    @Column(name = "sl_no", length = 100)
    private String slNo = "-";

    @Column(length = 100)
    private String capacity = "-";

    @Column(name = "type_model", length = 100)
    private String typeModel = "-";

    @Column(name = "completion_time", length = 50)
    private String completionTime = "5 Day(s)";

    // Other Details
    @Column(name = "date_handing_over", length = 50)
    private String dateHandingOver;

    @Column(name = "date_completion", length = 50)
    private String dateCompletion;

    @Column(name = "delay_in_completion", length = 100)
    private String delayInCompletion = "NIL";

    @Column(name = "performance_of_machines", length = 100)
    private String performanceOfMachines = "OK";

    @Column(name = "defective_spares_returned", length = 100)
    private String defectiveSparesReturned = "NA";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<WorkCompletionItem> items = new ArrayList<>();
}
