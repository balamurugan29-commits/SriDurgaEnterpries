package com.sridurga.repository;

import com.sridurga.model.EmployeeAdvance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeAdvanceRepository extends JpaRepository<EmployeeAdvance, Long> {

    List<EmployeeAdvance> findByEmployeeIdOrderByAdvanceDateDesc(Long employeeId);

    List<EmployeeAdvance> findAllByOrderByAdvanceDateDesc();

    @Query("SELECT COALESCE(SUM(CASE WHEN a.transactionType = 'LOAN_GIVEN' THEN a.amount WHEN a.transactionType = 'SALARY_DEDUCTION' OR a.transactionType = 'MANUAL_REPAYMENT' THEN -a.amount ELSE 0 END), 0.0) FROM EmployeeAdvance a WHERE a.employeeId = :employeeId")
    Double calculateRunningBalance(@Param("employeeId") Long employeeId);

    void deleteByEmployeeId(Long employeeId);
}
