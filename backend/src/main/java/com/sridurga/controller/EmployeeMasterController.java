package com.sridurga.controller;

import com.sridurga.model.EmployeeMaster;
import com.sridurga.service.EmployeeMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeMasterController {

    @Autowired
    private EmployeeMasterService employeeMasterService;

    @GetMapping
    public ResponseEntity<List<EmployeeMaster>> getAllEmployees(
            @RequestParam(required = false, defaultValue = "") String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(employeeMasterService.searchEmployees(search));
        }
        return ResponseEntity.ok(employeeMasterService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        return employeeMasterService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<EmployeeMaster>> searchEmployees(@RequestParam String query) {
        return ResponseEntity.ok(employeeMasterService.searchEmployees(query));
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody EmployeeMaster employee) {
        try {
            EmployeeMaster created = employeeMasterService.createEmployee(employee);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create Employee: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody EmployeeMaster employee) {
        try {
            EmployeeMaster updated = employeeMasterService.updateEmployee(id, employee);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update Employee: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeMasterService.deleteEmployee(id);
            return ResponseEntity.ok(Map.of("message", "Employee record deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete Employee: " + e.getMessage()));
        }
    }
}
