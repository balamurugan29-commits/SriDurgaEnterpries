package com.sridurga.repository;

import com.sridurga.model.EmployeeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeMasterRepository extends JpaRepository<EmployeeMaster, Long> {

    List<EmployeeMaster> findAllByOrderBySerialNumberAsc();

    Optional<EmployeeMaster> findByEmployeeNameIgnoreCase(String employeeName);

    Optional<EmployeeMaster> findByEmployeeNumberIgnoreCase(String employeeNumber);

    List<EmployeeMaster> findByEmployeeNameContainingIgnoreCaseOrEmployeeNumberContainingIgnoreCaseOrDesignationContainingIgnoreCase(
            String name, String empNo, String designation);

    List<EmployeeMaster> findByStatusIgnoreCase(String status);

    @Query("SELECT COALESCE(MAX(e.serialNumber), 0) FROM EmployeeMaster e")
    Integer getMaxSerialNumber();
}
