package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false)
    private Integer serialNumber;

    @Column(name = "employee_number", length = 50)
    private String employeeNumber;

    @Column(name = "employee_name", nullable = false, length = 200)
    private String employeeName;

    @Column(name = "designation", length = 150)
    private String designation;

    @Column(name = "dob", length = 50)
    private String dob;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "epf_number", length = 100)
    private String epfNumber;

    @Column(name = "esi_number", length = 100)
    private String esiNumber;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "branch_name", length = 150)
    private String branchName;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 50)
    private String ifscCode;

    @Column(name = "joining_date", length = 50)
    private String joiningDate;

    @Column(name = "releasing_date", length = 50)
    private String releasingDate;

    @Column(name = "status", length = 50)
    private String status = "Active";

    @Column(name = "blood_group", length = 20)
    private String bloodGroup;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
