package com.sridurga.service;

import com.sridurga.model.GatePass;
import com.sridurga.model.GatePassItem;
import com.sridurga.repository.GatePassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GatePassService {

    @Autowired
    private GatePassRepository gatePassRepository;

    public List<GatePass> getAllGatePasses() {
        return gatePassRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<GatePass> getGatePassById(Long id) {
        return gatePassRepository.findById(id);
    }

    public String generateNextGatePassNo() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;
        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        long count = gatePassRepository.count() + 1;
        return String.format("GP-%02d/%s", count, fySuffix);
    }

    public GatePass createGatePass(GatePass gatePass) {
        if (gatePass.getGatePassNo() == null || gatePass.getGatePassNo().trim().isEmpty()) {
            gatePass.setGatePassNo(generateNextGatePassNo());
        }
        if (gatePass.getGatePassDate() == null) {
            gatePass.setGatePassDate(LocalDate.now());
        }
        if (gatePass.getItems() != null) {
            for (GatePassItem item : gatePass.getItems()) {
                item.setGatePass(gatePass);
            }
        }
        return gatePassRepository.save(gatePass);
    }

    public GatePass updateGatePass(Long id, GatePass updated) {
        GatePass existing = gatePassRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gate Pass not found with ID: " + id));

        updated.setId(id);
        if (updated.getGatePassDate() == null) {
            updated.setGatePassDate(existing.getGatePassDate());
        }
        if (updated.getGatePassNo() == null || updated.getGatePassNo().trim().isEmpty()) {
            updated.setGatePassNo(existing.getGatePassNo());
        }
        if (updated.getItems() != null) {
            for (GatePassItem item : updated.getItems()) {
                item.setGatePass(updated);
            }
        }
        return gatePassRepository.save(updated);
    }

    public void deleteGatePass(Long id) {
        gatePassRepository.deleteById(id);
    }
}
