package com.sridurga.controller;

import com.sridurga.dto.ChallanRequest;
import com.sridurga.model.DeliveryChallan;
import com.sridurga.service.DeliveryChallanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challans")
@CrossOrigin(origins = "*")
public class DeliveryChallanController {

    @Autowired
    private DeliveryChallanService deliveryChallanService;

    @GetMapping
    public ResponseEntity<List<DeliveryChallan>> getAllChallans() {
        return ResponseEntity.ok(deliveryChallanService.getAllChallans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getChallanById(@PathVariable Long id) {
        return deliveryChallanService.getChallanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextChallanNumber() {
        String nextNumber = deliveryChallanService.generateNextChallanNumber();
        return ResponseEntity.ok(Map.of("nextChallanNumber", nextNumber));
    }

    @PostMapping
    public ResponseEntity<?> createChallan(@RequestBody ChallanRequest request) {
        try {
            DeliveryChallan created = deliveryChallanService.createChallan(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create Delivery Challan: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateChallan(@PathVariable Long id, @RequestBody ChallanRequest request) {
        try {
            DeliveryChallan updated = deliveryChallanService.updateChallan(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update Delivery Challan: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChallan(@PathVariable Long id) {
        try {
            deliveryChallanService.deleteChallan(id);
            return ResponseEntity.ok(Map.of("message", "Delivery Challan deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete: " + e.getMessage()));
        }
    }
}
