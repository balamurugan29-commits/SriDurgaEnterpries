package com.sridurga.controller;

import com.sridurga.model.EmployeeAdvance;
import com.sridurga.model.EmployeeAttendance;
import com.sridurga.model.EmployeeSalary;
import com.sridurga.service.AttendancePayrollService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Slf4j
public class AttendancePayrollController {

    @Autowired
    private AttendancePayrollService attendancePayrollService;

    // ==========================================
    // ATTENDANCE ENDPOINTS
    // ==========================================

    @GetMapping("/attendance")
    public ResponseEntity<List<EmployeeAttendance>> getAttendanceByDate(@RequestParam(value = "date", required = false) String date) {
        String targetDate = (date != null && !date.isEmpty()) ? date : LocalDate.now().toString();
        return ResponseEntity.ok(attendancePayrollService.getAttendanceByDate(targetDate));
    }

    @GetMapping("/attendance/month")
    public ResponseEntity<List<EmployeeAttendance>> getAttendanceByMonth(
            @RequestParam("month") String month,
            @RequestParam("year") Integer year) {
        return ResponseEntity.ok(attendancePayrollService.getAttendanceByMonth(month, year));
    }

    @PostMapping("/attendance/batch")
    public ResponseEntity<List<EmployeeAttendance>> saveDailyAttendanceBatch(
            @RequestParam("date") String dateStr,
            @RequestBody List<EmployeeAttendance> records) {
        LocalDate date = LocalDate.parse(dateStr);
        return ResponseEntity.ok(attendancePayrollService.saveDailyAttendanceBatch(date, records));
    }

    @PostMapping("/attendance/mark-all-present")
    public ResponseEntity<List<EmployeeAttendance>> markAllPresent(@RequestParam("date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return ResponseEntity.ok(attendancePayrollService.markAllPresent(date));
    }

    // ==========================================
    // SALARY & PAYSLIP ENDPOINTS
    // ==========================================

    @GetMapping("/salaries")
    public ResponseEntity<List<EmployeeSalary>> getSalariesByMonth(
            @RequestParam(value = "salaryMonth", required = false) String salaryMonth,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "year", required = false) Integer year) {
        String targetMonth = salaryMonth;
        if (targetMonth == null || targetMonth.trim().isEmpty()) {
            if (month != null && year != null) {
                targetMonth = month + " - " + year;
            } else if (month != null) {
                targetMonth = month;
            }
        }
        return ResponseEntity.ok(attendancePayrollService.getSalariesByMonth(targetMonth));
    }

    @GetMapping("/salaries/months")
    public ResponseEntity<List<String>> getAvailableSalaryMonths() {
        return ResponseEntity.ok(attendancePayrollService.getAvailableSalaryMonths());
    }

    @PostMapping("/salaries")
    public ResponseEntity<EmployeeSalary> saveSalaryRecord(@RequestBody EmployeeSalary salary) {
        return ResponseEntity.ok(attendancePayrollService.saveSalaryRecord(salary));
    }

    @PostMapping("/salaries/batch")
    public ResponseEntity<List<EmployeeSalary>> saveSalariesBatch(@RequestBody List<EmployeeSalary> salaries) {
        return ResponseEntity.ok(attendancePayrollService.saveSalariesBatch(salaries));
    }

    @PostMapping("/salaries/generate")
    public ResponseEntity<List<EmployeeSalary>> autoGenerateMonthlySalaries(@RequestBody Map<String, Object> req) {
        String month = (String) req.getOrDefault("month", "August");
        Integer year = req.containsKey("year") ? Integer.parseInt(req.get("year").toString()) : LocalDate.now().getYear();
        Double workingDays = req.containsKey("totalWorkingDays") ? Double.parseDouble(req.get("totalWorkingDays").toString()) : 26.0;

        return ResponseEntity.ok(attendancePayrollService.autoGenerateMonthlySalaries(month, year, workingDays));
    }

    // ==========================================
    // ADVANCE & LOAN LEDGER ENDPOINTS
    // ==========================================

    @GetMapping("/advances")
    public ResponseEntity<List<EmployeeAdvance>> getAllAdvances() {
        return ResponseEntity.ok(attendancePayrollService.getAllAdvances());
    }

    @GetMapping("/advances/summary")
    public ResponseEntity<Map<Long, Double>> getAllAdvanceBalances() {
        return ResponseEntity.ok(attendancePayrollService.getAllAdvanceBalances());
    }

    @GetMapping("/advances/{employeeId}")
    public ResponseEntity<List<EmployeeAdvance>> getAdvancesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendancePayrollService.getAdvancesByEmployee(employeeId));
    }

    @GetMapping("/advances/{employeeId}/balance")
    public ResponseEntity<Map<String, Object>> getEmployeeAdvanceBalance(@PathVariable Long employeeId) {
        Double balance = attendancePayrollService.getEmployeeAdvanceBalance(employeeId);
        return ResponseEntity.ok(Map.of("employeeId", employeeId, "balance", balance != null ? balance : 0.0));
    }

    @PostMapping("/advances")
    public ResponseEntity<EmployeeAdvance> recordAdvanceTransaction(@RequestBody EmployeeAdvance advance) {
        return ResponseEntity.ok(attendancePayrollService.recordAdvanceTransaction(advance));
    }
}
