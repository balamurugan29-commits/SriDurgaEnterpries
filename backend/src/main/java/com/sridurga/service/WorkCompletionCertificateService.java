package com.sridurga.service;

import com.sridurga.model.WorkCompletionCertificate;
import com.sridurga.model.WorkCompletionItem;
import com.sridurga.repository.WorkCompletionCertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WorkCompletionCertificateService {

    @Autowired
    private WorkCompletionCertificateRepository certificateRepository;

    @Transactional(readOnly = true)
    public List<WorkCompletionCertificate> getAllCertificates() {
        return certificateRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<WorkCompletionCertificate> getCertificateById(Long id) {
        return certificateRepository.findById(id);
    }

    public synchronized String generateNextCertificateNo() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;
        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        List<String> existingNumbers = certificateRepository.findCertificateNosBySuffix("/" + fySuffix);
        long maxSeq = 0;
        for (String num : existingNumbers) {
            if (num != null && num.contains("/") && num.toUpperCase().startsWith("WCC-")) {
                String mid = num.substring(4, num.indexOf("/")).trim();
                try {
                    long val = Long.parseLong(mid);
                    if (val > maxSeq) {
                        maxSeq = val;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        long nextSeq = maxSeq + 1;
        return String.format("WCC-%02d/%s", nextSeq, fySuffix);
    }

    public WorkCompletionCertificate createCertificate(WorkCompletionCertificate certificate) {
        if (certificate.getCertificateNo() == null || certificate.getCertificateNo().trim().isEmpty()) {
            certificate.setCertificateNo(generateNextCertificateNo());
        }
        if (certificate.getCertificateDate() == null) {
            certificate.setCertificateDate(LocalDate.now());
        }

        if (certificate.getItems() != null) {
            for (WorkCompletionItem item : certificate.getItems()) {
                item.setCertificate(certificate);
            }
        }

        return certificateRepository.save(certificate);
    }

    public WorkCompletionCertificate updateCertificate(Long id, WorkCompletionCertificate updated) {
        WorkCompletionCertificate existing = certificateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found with ID: " + id));

        updated.setId(id);
        if (updated.getCertificateNo() == null || updated.getCertificateNo().trim().isEmpty()) {
            updated.setCertificateNo(existing.getCertificateNo());
        }
        if (updated.getCertificateDate() == null) {
            updated.setCertificateDate(existing.getCertificateDate());
        }

        if (updated.getItems() != null) {
            for (WorkCompletionItem item : updated.getItems()) {
                item.setCertificate(updated);
            }
        }

        return certificateRepository.save(updated);
    }

    public void deleteCertificate(Long id) {
        certificateRepository.deleteById(id);
    }
}
