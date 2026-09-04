package com.sridurga.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_attendance", indexes = {
    @Index(name = "idx_att_emp_date", columnList = "employee_id, attendance_date", unique = true),
    @Index(name = "idx_att_month_year", columnList = "att_month, att_year")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAttendance {

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

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "att_month", nullable = false, length = 30)
    private String month; // e.g. "August"

    @Column(name = "att_year", nullable = false)
    private Integer year; // e.g. 2026

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PRESENT"; // PRESENT, ABSENT, HALF_DAY, PAID_LEAVE, WEEKLY_OFF, HOLIDAY

    @Column(name = "in_time", length = 20)
    private String inTime;

    @Column(name = "out_time", length = 20)
    private String outTime;

    @Column(name = "overtime_hours")
    private Double overtimeHours = 0.0;

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
