package com.sridurga.service;

import com.sridurga.model.WorkCompletionCertificate;
import com.sridurga.model.WorkCompletionItem;
import com.sridurga.repository.WorkCompletionCertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WorkCompletionCertificateService {

    @Autowired
    private WorkCompletionCertificateRepository certificateRepository;

    public List<WorkCompletionCertificate> getAllCertificates() {
        return certificateRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<WorkCompletionCertificate> getCertificateById(Long id) {
        return certificateRepository.findById(id);
    }

    public String generateNextCertificateNo() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;
        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        long count = certificateRepository.count() + 1;
        return String.format("WCC-%02d/%s", count, fySuffix);
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
