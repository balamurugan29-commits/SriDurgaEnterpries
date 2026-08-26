package com.sridurga.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gate_pass_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GatePassItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gate_pass_id", nullable = false)
    @JsonIgnore
    private GatePass gatePass;

    @Column(name = "serial_number")
    private Integer serialNumber;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 100)
    private String quantity;

    @Column(length = 255)
    private String remarks;
}
