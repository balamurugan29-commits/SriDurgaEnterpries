package com.sridurga.service;

import com.sridurga.model.EmployeeMaster;
import com.sridurga.repository.EmployeeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeMasterService {

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

    public List<EmployeeMaster> getAllEmployees() {
        return employeeMasterRepository.findAllByOrderBySerialNumberAsc();
    }

    public Optional<EmployeeMaster> getEmployeeById(Long id) {
        return employeeMasterRepository.findById(id);
    }

    public List<EmployeeMaster> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllEmployees();
        }
        String cleanQuery = query.trim();
        return employeeMasterRepository.findByEmployeeNameContainingIgnoreCaseOrEmployeeNumberContainingIgnoreCaseOrDesignationContainingIgnoreCase(
                cleanQuery, cleanQuery, cleanQuery);
    }

    public EmployeeMaster createEmployee(EmployeeMaster employee) {
        if (employee.getSerialNumber() == null) {
            employee.setSerialNumber(employeeMasterRepository.getMaxSerialNumber() + 1);
        }
        if (employee.getStatus() == null || employee.getStatus().trim().isEmpty()) {
            employee.setStatus("Active");
        }
        return employeeMasterRepository.save(employee);
    }

    public EmployeeMaster updateEmployee(Long id, EmployeeMaster employeeDetails) {
        EmployeeMaster existing = employeeMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + id));

        existing.setEmployeeNumber(employeeDetails.getEmployeeNumber());
        existing.setEmployeeName(employeeDetails.getEmployeeName());
        existing.setDesignation(employeeDetails.getDesignation());
        existing.setDob(employeeDetails.getDob());
        existing.setPhone(employeeDetails.getPhone());
        existing.setEmail(employeeDetails.getEmail());
        existing.setAddress(employeeDetails.getAddress());
        existing.setEpfNumber(employeeDetails.getEpfNumber());
        existing.setEsiNumber(employeeDetails.getEsiNumber());
        existing.setBankName(employeeDetails.getBankName());
        existing.setBranchName(employeeDetails.getBranchName());
        existing.setAccountNumber(employeeDetails.getAccountNumber());
        existing.setIfscCode(employeeDetails.getIfscCode());
        existing.setJoiningDate(employeeDetails.getJoiningDate());
        existing.setReleasingDate(employeeDetails.getReleasingDate());
        existing.setStatus(employeeDetails.getStatus() != null ? employeeDetails.getStatus() : "Active");
        existing.setBloodGroup(employeeDetails.getBloodGroup());

        return employeeMasterRepository.save(existing);
    }

    public void deleteEmployee(Long id) {
        employeeMasterRepository.deleteById(id);
    }
}
