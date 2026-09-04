package com.sridurga.repository;

import com.sridurga.model.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSalaryRepository extends JpaRepository<EmployeeSalary, Long> {

    List<EmployeeSalary> findBySalaryMonthOrderByEmployeeNameAsc(String salaryMonth);

    List<EmployeeSalary> findByMonthAndYearOrderByEmployeeNameAsc(String month, Integer year);

    Optional<EmployeeSalary> findByEmployeeIdAndSalaryMonth(Long employeeId, String salaryMonth);

    List<EmployeeSalary> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);

    @Query("SELECT DISTINCT s.salaryMonth FROM EmployeeSalary s ORDER BY s.salaryMonth DESC")
    List<String> findDistinctSalaryMonths();

    void deleteByEmployeeId(Long employeeId);
}
