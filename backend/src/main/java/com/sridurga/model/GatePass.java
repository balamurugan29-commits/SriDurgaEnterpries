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
@Table(name = "gate_pass")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GatePass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gate_pass_no", nullable = false, length = 50, unique = true)
    private String gatePassNo;

    @Column(name = "gate_pass_date")
    private LocalDate gatePassDate = LocalDate.now();

    @Column(name = "receiver_name", length = 255)
    private String receiverName;

    @Column(name = "pass_type", length = 10)
    private String passType = "OUT";

    @Column(name = "site_name", length = 255)
    private String siteName;

    @OneToMany(mappedBy = "gatePass", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GatePassItem> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
