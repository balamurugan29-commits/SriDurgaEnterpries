package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_salary", indexes = {
    @Index(name = "idx_sal_emp_month", columnList = "employee_id, salary_month", unique = true),
    @Index(name = "idx_sal_month_year", columnList = "salary_period_month, salary_period_year")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name", nullable = false, length = 200)
    private String employeeName;

    @Column(name = "employee_number", length = 50)
    private String employeeNumber;

    @Column(name = "designation", length = 150)
    private String designation;

    @Column(name = "salary_month", nullable = false, length = 50)
    private String salaryMonth; // e.g. "August - 2026"

    @Column(name = "salary_period_month", nullable = false, length = 30)
    private String month; // e.g. "August"

    @Column(name = "salary_period_year", nullable = false)
    private Integer year; // e.g. 2026

    @Column(name = "total_working_days")
    private Double totalWorkingDays = 26.0;

    @Column(name = "present_days")
    private Double presentDays = 26.0;

    @Column(name = "absent_days")
    private Double absentDays = 0.0;

    @Column(name = "leave_days")
    private Double leaveDays = 0.0;

    @Column(name = "half_days")
    private Double halfDays = 0.0;

    @Column(name = "overtime_hours")
    private Double overtimeHours = 0.0;

    // Financial Wage Parameters
    @Column(name = "total_wages", nullable = false)
    private Double totalWages = 0.0; // Gross / Total monthly wages

    @Column(name = "leave_wage")
    private Double leaveWage = 0.0; // Leave wage

    @Column(name = "incentive")
    private Double incentive = 0.0; // Allowances / Incentive

    @Column(name = "epf_and_esi")
    private Double epfAndEsi = 0.0; // Statutory deductions (EPF & ESI)

    @Column(name = "lop")
    private Double lop = 0.0; // Loss Of Pay deduction

    @Column(name = "adv_deducted")
    private Double advDeducted = 0.0; // Advance deducted from salary

    @Column(name = "net_credit", nullable = false)
    private Double netCredit = 0.0; // Net take-home salary payable

    @Column(name = "current_advance")
    private Double currentAdvance = 0.0; // Advance taken during this month

    @Column(name = "balance_advance")
    private Double balanceAdvance = 0.0; // Cumulative remaining advance balance

    // Payment Tracking
    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "PENDING"; // PENDING, PAID, TRANSFERRED

    @Column(name = "payment_date", length = 50)
    private String paymentDate;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode = "Bank Transfer"; // Bank Transfer, Cash, Cheque

    // Bank & Statutory Coordinates (for auto-printing payslips)
    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 50)
    private String ifscCode;

    @Column(name = "epf_number", length = 100)
    private String epfNumber;

    @Column(name = "esi_number", length = 100)
    private String esiNumber;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
