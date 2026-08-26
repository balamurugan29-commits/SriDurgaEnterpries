package com.sridurga.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "work_completion_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkCompletionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number")
    private Integer serialNumber;

    @Column(name = "rc_item_no", length = 50)
    private String rcItemNo;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "quantity")
    private Double quantity = 1.0;

    @Column(length = 20)
    private String unit = "No";

    @Column(name = "item_type", length = 50)
    private String itemType = "MATERIAL"; // "SERVICE" or "MATERIAL"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_id")
    @JsonIgnore
    private WorkCompletionCertificate certificate;
}
