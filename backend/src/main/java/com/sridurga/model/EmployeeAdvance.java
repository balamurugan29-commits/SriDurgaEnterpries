package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_advance", indexes = {
    @Index(name = "idx_adv_emp_id", columnList = "employee_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAdvance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name", nullable = false, length = 200)
    private String employeeName;

    @Column(name = "employee_number", length = 50)
    private String employeeNumber;

    @Column(name = "advance_date", nullable = false)
    private LocalDate advanceDate;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType = "LOAN_GIVEN"; // LOAN_GIVEN, SALARY_DEDUCTION, MANUAL_REPAYMENT

    @Column(name = "salary_month", length = 50)
    private String salaryMonth; // If deducted via salary, e.g. "August - 2026"

    @Column(name = "balance_after")
    private Double balanceAfter;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
