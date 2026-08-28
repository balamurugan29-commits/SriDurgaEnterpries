package com.sridurga.service;

import com.sridurga.model.GatePass;
import com.sridurga.model.GatePassItem;
import com.sridurga.repository.GatePassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GatePassService {

    @Autowired
    private GatePassRepository gatePassRepository;

    @Transactional(readOnly = true)
    public List<GatePass> getAllGatePasses() {
        return gatePassRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<GatePass> getGatePassById(Long id) {
        return gatePassRepository.findById(id);
    }

    public synchronized String generateNextGatePassNo() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;
        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        List<String> existingNumbers = gatePassRepository.findGatePassNosBySuffix("/" + fySuffix);
        long maxSeq = 0;
        for (String num : existingNumbers) {
            if (num != null && num.contains("/") && num.toUpperCase().startsWith("GP-")) {
                String mid = num.substring(3, num.indexOf("/")).trim();
                try {
                    long val = Long.parseLong(mid);
                    if (val > maxSeq) {
                        maxSeq = val;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        long nextSeq = maxSeq + 1;
        return String.format("GP-%02d/%s", nextSeq, fySuffix);
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
