package com.sridurga.controller;

import com.sridurga.model.GatePass;
import com.sridurga.service.GatePassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gate-passes")
@CrossOrigin(origins = "*")
public class GatePassController {

    @Autowired
    private GatePassService gatePassService;

    @GetMapping
    public ResponseEntity<List<GatePass>> getAllGatePasses() {
        return ResponseEntity.ok(gatePassService.getAllGatePasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GatePass> getGatePassById(@PathVariable Long id) {
        return gatePassService.getGatePassById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextGatePassNo() {
        String nextNo = gatePassService.generateNextGatePassNo();
        return ResponseEntity.ok(Map.of("nextGatePassNo", nextNo, "gatePassNo", nextNo));
    }

    @PostMapping
    public ResponseEntity<GatePass> createGatePass(@RequestBody GatePass gatePass) {
        return ResponseEntity.ok(gatePassService.createGatePass(gatePass));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GatePass> updateGatePass(@PathVariable Long id, @RequestBody GatePass gatePass) {
        return ResponseEntity.ok(gatePassService.updateGatePass(id, gatePass));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGatePass(@PathVariable Long id) {
        gatePassService.deleteGatePass(id);
        return ResponseEntity.ok(Map.of("message", "Gate Pass deleted successfully"));
    }
}
