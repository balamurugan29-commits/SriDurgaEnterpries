package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_card")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_no", nullable = false, length = 50)
    private String jobNo;

    @Column(name = "g_pass", length = 50)
    private String gPass;

    @Column(name = "job_date")
    private LocalDate jobDate = LocalDate.now();

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(length = 150)
    private String site;

    @Column(length = 100)
    private String make;

    @Column(length = 150)
    private String equipment;

    @Column(name = "sl_no", length = 100)
    private String slNo;

    @Column(name = "delivered_on")
    private String deliveredOn;

    @Column(length = 255)
    private String others;

    // Equipment Details
    @Column(name = "rating_hp", length = 50)
    private String ratingHp;

    @Column(name = "rating_kw", length = 50)
    private String ratingKw;

    @Column(name = "rating_kva", length = 50)
    private String ratingKva;

    @Column(length = 50)
    private String volt;

    @Column(name = "`current`", length = 50)
    private String current;

    @Column(name = "frame_size", length = 50)
    private String frameSize;

    @Column(length = 50)
    private String type;

    @Column(name = "bearing_de", length = 50)
    private String bearingDe;

    @Column(name = "bearing_nde", length = 50)
    private String bearingNde;

    @Column(name = "cooling_fan_id", length = 50)
    private String coolingFanId;

    @Column(name = "cooling_fan_od", length = 50)
    private String coolingFanOd;

    @Column(name = "fan_cover_circumference", length = 50)
    private String fanCoverCircumference;

    @Column(name = "fan_cover_height", length = 50)
    private String fanCoverHeight;

    @Column(name = "fan_cover_dia", length = 50)
    private String fanCoverDia;

    @Column(length = 50)
    private String speed;

    @Column(name = "terminal_box", length = 50)
    private String terminalBox; // LEFT / RIGHT

    @Column(length = 50)
    private String connection;

    // Winding Details
    // Winding Details (Running Coil or Main Winding)
    @Column(length = 500)
    private String pitch;

    @Column(length = 500)
    private String turns;

    @Column(length = 500)
    private String bobbin;

    @Column(name = "core_length", length = 50)
    private String coreLength;

    @Column(length = 50)
    private String swg;

    @Column(name = "coil_weight_1set", length = 50)
    private String coilWeight1Set;

    @Column(name = "coil_weight_total", length = 50)
    private String coilWeightTotal;

    @Column(name = "set_of_coil", length = 50)
    private String setOfCoil;

    @Column(name = "no_of_slots", length = 50)
    private String noOfSlots;

    @Column(name = "total_no_coil", length = 50)
    private String totalNoCoil;

    @Column(name = "job_carried", columnDefinition = "NVARCHAR(MAX)")
    private String jobCarried;

    // Counts for Running/Main winding dynamic inputs
    @Column(name = "pitch_count", length = 50)
    private String pitchCount;

    @Column(name = "turns_count", length = 50)
    private String turnsCount;

    @Column(name = "bobbin_count", length = 50)
    private String bobbinCount;

    // Starting Coil Winding Details (used when volt = 220)
    @Column(name = "sc_pitch", length = 500)
    private String scPitch;

    @Column(name = "sc_turns", length = 500)
    private String scTurns;

    @Column(name = "sc_bobbin", length = 500)
    private String scBobbin;

    @Column(name = "sc_core_length", length = 50)
    private String scCoreLength;

    @Column(name = "sc_swg", length = 50)
    private String scSwg;

    @Column(name = "sc_coil_weight_1set", length = 50)
    private String scCoilWeight1Set;

    @Column(name = "sc_coil_weight_total", length = 50)
    private String scCoilWeightTotal;

    @Column(name = "sc_set_of_coil", length = 50)
    private String scSetOfCoil;

    @Column(name = "sc_no_of_slots", length = 50)
    private String scNoOfSlots;

    @Column(name = "sc_total_no_coil", length = 50)
    private String scTotalNoCoil;

    @Column(name = "sc_job_carried", columnDefinition = "NVARCHAR(MAX)")
    private String scJobCarried;

    // Counts for Starting winding dynamic inputs
    @Column(name = "sc_pitch_count", length = 50)
    private String scPitchCount;

    @Column(name = "sc_turns_count", length = 50)
    private String scTurnsCount;

    @Column(name = "sc_bobbin_count", length = 50)
    private String scBobbinCount;

    // Test Details
    @Column(name = "test_ww_resistance", length = 50)
    private String testWwResistance;

    @Column(name = "test_wb_resistance", length = 50)
    private String testWbResistance;

    @Column(name = "test_no_load_current", length = 50)
    private String testNoLoadCurrent;

    @Column(name = "test_rpm", length = 50)
    private String testRpm;

    // Remarks & Personnel Sign-off
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    @Column(name = "dismantled_by", length = 100)
    private String dismantledBy;

    @Column(name = "coil_dismantled_by", length = 100)
    private String coilDismantledBy;

    @Column(name = "winding_by", length = 100)
    private String windingBy;

    @Column(name = "assembled_by", length = 100)
    private String assembledBy;

    @Column(name = "tested_by", length = 100)
    private String testedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
