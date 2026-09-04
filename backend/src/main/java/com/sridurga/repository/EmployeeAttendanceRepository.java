package com.sridurga.repository;

import com.sridurga.model.EmployeeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeAttendanceRepository extends JpaRepository<EmployeeAttendance, Long> {

    List<EmployeeAttendance> findByAttendanceDateOrderByEmployeeNameAsc(LocalDate date);

    List<EmployeeAttendance> findByMonthAndYearOrderByAttendanceDateAscEmployeeNameAsc(String month, Integer year);

    List<EmployeeAttendance> findByEmployeeIdAndMonthAndYearOrderByAttendanceDateAsc(Long employeeId, String month, Integer year);

    Optional<EmployeeAttendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    @Query("SELECT a FROM EmployeeAttendance a WHERE a.attendanceDate BETWEEN :startDate AND :endDate ORDER BY a.attendanceDate ASC, a.employeeName ASC")
    List<EmployeeAttendance> findBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    void deleteByEmployeeId(Long employeeId);
}
