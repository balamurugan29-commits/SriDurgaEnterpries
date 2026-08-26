package com.sridurga.controller;

import com.sridurga.model.CustomerMaster;
import com.sridurga.service.CustomerMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerMasterController {

    @Autowired
    private CustomerMasterService customerMasterService;

    @GetMapping
    public ResponseEntity<List<CustomerMaster>> getAllCustomers() {
        return ResponseEntity.ok(customerMasterService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        return customerMasterService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CustomerMaster>> searchCustomers(@RequestParam String query) {
        return ResponseEntity.ok(customerMasterService.searchCustomers(query));
    }

    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody CustomerMaster customer) {
        try {
            CustomerMaster created = customerMasterService.createCustomer(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create Customer: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody CustomerMaster customer) {
        try {
            CustomerMaster updated = customerMasterService.updateCustomer(id, customer);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update Customer: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            customerMasterService.deleteCustomer(id);
            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete Customer: " + e.getMessage()));
        }
    }
}
