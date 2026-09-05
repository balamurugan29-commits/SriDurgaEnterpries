package com.sridurga.service;

import com.sridurga.model.EmployeeAdvance;
import com.sridurga.model.EmployeeAttendance;
import com.sridurga.model.EmployeeMaster;
import com.sridurga.model.EmployeeSalary;
import com.sridurga.repository.EmployeeAdvanceRepository;
import com.sridurga.repository.EmployeeAttendanceRepository;
import com.sridurga.repository.EmployeeMasterRepository;
import com.sridurga.repository.EmployeeSalaryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class AttendancePayrollService {

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

    @Autowired
    private EmployeeAttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeSalaryRepository salaryRepository;

    @Autowired
    private EmployeeAdvanceRepository advanceRepository;

    // ==========================================
    // 1. ATTENDANCE MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public List<EmployeeAttendance> getAttendanceByDate(String dateStr) {
        LocalDate date;
        try {
            date = (dateStr != null && !dateStr.trim().isEmpty()) ? LocalDate.parse(dateStr.trim()) : LocalDate.now();
        } catch (Exception e) {
            date = LocalDate.now();
        }
        return attendanceRepository.findByAttendanceDateOrderByEmployeeNameAsc(date);
    }

    @Transactional(readOnly = true)
    public List<EmployeeAttendance> getAttendanceByMonth(String month, Integer year) {
        return attendanceRepository.findByMonthAndYearOrderByAttendanceDateAscEmployeeNameAsc(month, year);
    }

    @Transactional
    public List<EmployeeAttendance> saveDailyAttendanceBatch(LocalDate date, List<EmployeeAttendance> records) {
        String month = date.format(DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH));
        int year = date.getYear();

        List<EmployeeAttendance> savedList = new ArrayList<>();
        for (EmployeeAttendance req : records) {
            Optional<EmployeeAttendance> existing = attendanceRepository.findByEmployeeIdAndAttendanceDate(req.getEmployeeId(), date);
            EmployeeAttendance att = existing.orElse(new EmployeeAttendance());

            att.setEmployeeId(req.getEmployeeId());
            att.setEmployeeName(req.getEmployeeName());
            att.setEmployeeNumber(req.getEmployeeNumber());
            att.setDesignation(req.getDesignation());
            att.setAttendanceDate(date);
            att.setMonth(month);
            att.setYear(year);
            att.setStatus(req.getStatus() != null ? req.getStatus() : "PRESENT");
            att.setInTime(req.getInTime());
            att.setOutTime(req.getOutTime());
            att.setOvertimeHours(req.getOvertimeHours() != null ? req.getOvertimeHours() : 0.0);
            att.setRemarks(req.getRemarks());

            savedList.add(attendanceRepository.save(att));
        }
        return savedList;
    }

    @Transactional
    public List<EmployeeAttendance> markAllPresent(LocalDate date) {
        List<EmployeeMaster> activeEmployees = employeeMasterRepository.findByStatusIgnoreCase("Active");
        String month = date.format(DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH));
        int year = date.getYear();

        List<EmployeeAttendance> savedList = new ArrayList<>();
        for (EmployeeMaster emp : activeEmployees) {
            Optional<EmployeeAttendance> existing = attendanceRepository.findByEmployeeIdAndAttendanceDate(emp.getId(), date);
            EmployeeAttendance att = existing.orElse(new EmployeeAttendance());

            att.setEmployeeId(emp.getId());
            att.setEmployeeName(emp.getEmployeeName());
            att.setEmployeeNumber(emp.getEmployeeNumber());
            att.setDesignation(emp.getDesignation());
            att.setAttendanceDate(date);
            att.setMonth(month);
            att.setYear(year);
            att.setStatus("PRESENT");
            att.setOvertimeHours(0.0);

            savedList.add(attendanceRepository.save(att));
        }
        return savedList;
    }

    // ==========================================
    // 2. SALARY & PAYROLL CALCULATION
    // ==========================================

    @Transactional(readOnly = true)
    public List<EmployeeSalary> getSalariesByMonth(String salaryMonth) {
        if (salaryMonth == null || salaryMonth.trim().isEmpty() || "ALL".equalsIgnoreCase(salaryMonth.trim())) {
            return salaryRepository.findAll();
        }
        return salaryRepository.findBySalaryMonthOrderByEmployeeNameAsc(salaryMonth);
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableSalaryMonths() {
        return salaryRepository.findDistinctSalaryMonths();
    }

    @Transactional
    public EmployeeSalary saveSalaryRecord(EmployeeSalary salary) {
        double workingDays = (salary.getTotalWorkingDays() != null && salary.getTotalWorkingDays() > 0) ? salary.getTotalWorkingDays() : 26.0;
        double monthlySalary = (salary.getMonthlySalary() != null && salary.getMonthlySalary() > 0) 
            ? salary.getMonthlySalary() 
            : ((salary.getTotalWages() != null && salary.getTotalWages() > 0) ? salary.getTotalWages() : 20000.0);
        
        salary.setTotalWorkingDays(workingDays);
        salary.setMonthlySalary(monthlySalary);

        // Per day rate = monthlySalary / workingDays
        double perDayRate = Math.round((monthlySalary / workingDays) * 100.0) / 100.0;
        salary.setPerDayRate(perDayRate);

        // Basic wage per day is editable (default 400.0 or from input)
        double basicRate = (salary.getBasicRate() != null && salary.getBasicRate() >= 0) ? salary.getBasicRate() : 400.0;
        // Other wage per day = Per day rate - Basic wage
        double othersRate = Math.max(0.0, Math.round((perDayRate - basicRate) * 100.0) / 100.0);
        
        salary.setBasicRate(basicRate);
        salary.setOthersRate(othersRate);

        double presentDays = salary.getPresentDays() != null ? salary.getPresentDays() : 0.0;
        double leaveDays = salary.getLeaveDays() != null ? salary.getLeaveDays() : 0.0;
        double absentDays = salary.getAbsentDays() != null ? salary.getAbsentDays() : 0.0;
        double otHours = salary.getOvertimeHours() != null ? salary.getOvertimeHours() : 0.0;

        // Earned Basic = Basic wage * Present days
        double earnedBasic = Math.round((basicRate * presentDays) * 100.0) / 100.0;
        // Earned Others = Other wage * Present days
        double earnedOthers = Math.round((othersRate * presentDays) * 100.0) / 100.0;
        // OT Amount = OT Hours * (Per Day / 8)
        double otAmount = (salary.getOtAmount() != null && salary.getOtAmount() > 0) 
            ? salary.getOtAmount() 
            : Math.round((otHours * (perDayRate / 8.0)) * 100.0) / 100.0;
        
        salary.setEarnedBasic(earnedBasic);
        salary.setEarnedOthers(earnedOthers);
        salary.setOtAmount(otAmount);

        // Total wages (Earned Total) = Earned Basic + Earned Others + OT Amount
        double totalWages = Math.round((earnedBasic + earnedOthers + otAmount) * 100.0) / 100.0;
        salary.setTotalWages(totalWages);

        // Leave wage & LOP (Absent Days * Per Day Rate)
        double leaveWage = Math.round((leaveDays * perDayRate) * 100.0) / 100.0;
        double lop = Math.round((absentDays * perDayRate) * 100.0) / 100.0;
        salary.setLeaveWage(leaveWage);
        salary.setLop(lop);

        // EPF: MIN(earnedBasic, 15000) * 12%
        double epfWage = Math.min(earnedBasic, 15000.0);
        double epf = (salary.getEpf() != null && salary.getEpf() > 0)
            ? salary.getEpf()
            : Math.round((epfWage * 0.12) * 100.0) / 100.0;
        salary.setEpf(epf);

        // ESIC: MIN(totalWages, 21000) * 0.75%
        double esicWage = Math.min(totalWages, 21000.0);
        double esi = (salary.getEsi() != null && salary.getEsi() > 0)
            ? salary.getEsi()
            : Math.round((esicWage * 0.0075) * 100.0) / 100.0;
        salary.setEsi(esi);
        salary.setEpfAndEsi(Math.round((epf + esi) * 100.0) / 100.0);

        double bonus = salary.getBonus() != null ? salary.getBonus() : 0.0;
        double incentive = salary.getIncentive() != null ? salary.getIncentive() : 0.0;
        salary.setBonus(bonus);
        salary.setIncentive(incentive);

        // Grand Total = Total wages + Leave wage + Bonus - (EPF + ESI)
        double grandTotal = Math.round((totalWages + leaveWage + bonus - epf - esi) * 100.0) / 100.0;
        salary.setGrandTotal(grandTotal);

        // Advance deductions
        double advDeducted = salary.getAdvDeducted() != null ? salary.getAdvDeducted() : 0.0;
        salary.setAdvDeducted(advDeducted);

        // Net Credit = Total wage + Leave wage - (EPF + ESI) - Advance Deducted + Bonus + Incentive
        double netCredit = Math.round((grandTotal - advDeducted + incentive) * 100.0) / 100.0;
        salary.setNetCredit(netCredit);

        // Fetch employee coordinates if missing
        if (salary.getEmployeeId() != null) {
            employeeMasterRepository.findById(salary.getEmployeeId()).ifPresent(emp -> {
                if (salary.getBankName() == null || salary.getBankName().isEmpty()) salary.setBankName(emp.getBankName());
                if (salary.getAccountNumber() == null || salary.getAccountNumber().isEmpty()) salary.setAccountNumber(emp.getAccountNumber());
                if (salary.getIfscCode() == null || salary.getIfscCode().isEmpty()) salary.setIfscCode(emp.getIfscCode());
                if (salary.getEpfNumber() == null || salary.getEpfNumber().isEmpty()) salary.setEpfNumber(emp.getEpfNumber());
                if (salary.getEsiNumber() == null || salary.getEsiNumber().isEmpty()) salary.setEsiNumber(emp.getEsiNumber());
            });

            // Update advance balance if current advance or deduction is present
            Double currentBalance = advanceRepository.calculateRunningBalance(salary.getEmployeeId());
            double newBalance = (currentBalance != null ? currentBalance : 0.0);
            if (salary.getCurrentAdvance() != null && salary.getCurrentAdvance() > 0) {
                newBalance += salary.getCurrentAdvance();
            }
            if (salary.getAdvDeducted() != null && salary.getAdvDeducted() > 0) {
                newBalance -= salary.getAdvDeducted();
            }
            salary.setBalanceAdvance(Math.max(0.0, Math.round(newBalance * 100.0) / 100.0));
        }

        Optional<EmployeeSalary> existing = salaryRepository.findByEmployeeIdAndSalaryMonth(salary.getEmployeeId(), salary.getSalaryMonth());
        if (existing.isPresent()) {
            salary.setId(existing.get().getId());
        }

        return salaryRepository.save(salary);
    }

    @Transactional
    public List<EmployeeSalary> saveSalariesBatch(List<EmployeeSalary> salaries) {
        List<EmployeeSalary> savedList = new ArrayList<>();
        if (salaries != null) {
            for (EmployeeSalary salary : salaries) {
                savedList.add(saveSalaryRecord(salary));
            }
        }
        return savedList;
    }

    @Transactional
    public List<EmployeeSalary> autoGenerateMonthlySalaries(String month, Integer year, Double defaultWorkingDays) {
        String salaryMonth = month + " - " + year;
        List<EmployeeMaster> activeEmployees = employeeMasterRepository.findByStatusIgnoreCase("Active");
        List<EmployeeAttendance> attendanceRecords = attendanceRepository.findByMonthAndYearOrderByAttendanceDateAscEmployeeNameAsc(month, year);

        double workingDays = (defaultWorkingDays != null && defaultWorkingDays > 0) ? defaultWorkingDays : 26.0;

        List<EmployeeSalary> resultList = new ArrayList<>();

        for (EmployeeMaster emp : activeEmployees) {
            // Count attendance metrics
            double presentCount = 0.0;
            double absentCount = 0.0;
            double leaveCount = 0.0;
            double halfDayCount = 0.0;
            double totalOt = 0.0;

            for (EmployeeAttendance att : attendanceRecords) {
                if (att.getEmployeeId().equals(emp.getId())) {
                    String status = att.getStatus() != null ? att.getStatus().toUpperCase() : "PRESENT";
                    switch (status) {
                        case "PRESENT":
                            presentCount += 1.0;
                            break;
                        case "ABSENT":
                            absentCount += 1.0;
                            break;
                        case "PAID_LEAVE":
                            leaveCount += 1.0;
                            break;
                        case "HALF_DAY":
                            halfDayCount += 1.0;
                            presentCount += 0.5;
                            absentCount += 0.5;
                            break;
                        default:
                            break;
                    }
                    if (att.getOvertimeHours() != null) {
                        totalOt += att.getOvertimeHours();
                    }
                }
            }

            // Check if existing salary record exists
            Optional<EmployeeSalary> existingOpt = salaryRepository.findByEmployeeIdAndSalaryMonth(emp.getId(), salaryMonth);
            EmployeeSalary sal = existingOpt.orElse(new EmployeeSalary());

            sal.setEmployeeId(emp.getId());
            sal.setEmployeeName(emp.getEmployeeName());
            sal.setEmployeeNumber(emp.getEmployeeNumber());
            sal.setDesignation(emp.getDesignation());
            sal.setSalaryMonth(salaryMonth);
            sal.setMonth(month);
            sal.setYear(year);

            sal.setTotalWorkingDays(workingDays);
            sal.setPresentDays(presentCount);
            sal.setAbsentDays(absentCount);
            sal.setLeaveDays(leaveCount);
            sal.setHalfDays(halfDayCount);
            sal.setOvertimeHours(totalOt);

            double monthlyWage = (emp.getMonthlySalary() != null && emp.getMonthlySalary() > 0) ? emp.getMonthlySalary() : 20000.0;
            double basicWage = (emp.getBasicRate() != null && emp.getBasicRate() >= 0) ? emp.getBasicRate() : 400.0;
            sal.setMonthlySalary(monthlyWage);
            sal.setBasicRate(basicWage);

            // Balance advance from ledger
            Double advanceBalance = advanceRepository.calculateRunningBalance(emp.getId());
            sal.setBalanceAdvance(advanceBalance != null ? advanceBalance : 0.0);

            // Coordinates
            sal.setBankName(emp.getBankName());
            sal.setAccountNumber(emp.getAccountNumber());
            sal.setIfscCode(emp.getIfscCode());
            sal.setEpfNumber(emp.getEpfNumber());
            sal.setEsiNumber(emp.getEsiNumber());
            sal.setPaymentStatus(sal.getPaymentStatus() != null ? sal.getPaymentStatus() : "PENDING");
            sal.setPaymentMode("Bank Transfer");

            resultList.add(saveSalaryRecord(sal));
        }

        return resultList;
    }

    // ==========================================
    // 3. ADVANCE & LOAN LEDGER
    // ==========================================

    @Transactional(readOnly = true)
    public List<EmployeeAdvance> getAllAdvances() {
        return advanceRepository.findAllByOrderByAdvanceDateDesc();
    }

    @Transactional(readOnly = true)
    public Map<Long, Double> getAllAdvanceBalances() {
        List<EmployeeMaster> employees = employeeMasterRepository.findAll();
        Map<Long, Double> balances = new HashMap<>();
        for (EmployeeMaster emp : employees) {
            Double bal = advanceRepository.calculateRunningBalance(emp.getId());
            balances.put(emp.getId(), bal != null ? bal : 0.0);
        }
        return balances;
    }

    @Transactional(readOnly = true)
    public List<EmployeeAdvance> getAdvancesByEmployee(Long employeeId) {
        return advanceRepository.findByEmployeeIdOrderByAdvanceDateDesc(employeeId);
    }

    @Transactional(readOnly = true)
    public Double getEmployeeAdvanceBalance(Long employeeId) {
        return advanceRepository.calculateRunningBalance(employeeId);
    }

    @Transactional
    public EmployeeAdvance recordAdvanceTransaction(EmployeeAdvance advance) {
        if (advance.getAdvanceDate() == null) {
            advance.setAdvanceDate(LocalDate.now());
        }
        Double currentBalance = advanceRepository.calculateRunningBalance(advance.getEmployeeId());
        double prev = currentBalance != null ? currentBalance : 0.0;

        double newBalance = prev;
        if ("LOAN_GIVEN".equalsIgnoreCase(advance.getTransactionType())) {
            newBalance += advance.getAmount();
        } else {
            newBalance -= advance.getAmount();
        }

        advance.setBalanceAfter(Math.max(0.0, Math.round(newBalance * 100.0) / 100.0));
        return advanceRepository.save(advance);
    }
}
