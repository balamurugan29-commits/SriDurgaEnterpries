package com.sridurga.service;

import com.sridurga.model.JobCard;
import com.sridurga.repository.JobCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class JobCardService {

    @Autowired
    private JobCardRepository jobCardRepository;

    public List<JobCard> getAllJobCards() {
        return jobCardRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<JobCard> getJobCardById(Long id) {
        return jobCardRepository.findById(id);
    }

    public String generateNextJobNo() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;
        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        long count = jobCardRepository.count() + 1;
        return String.format("JC-%02d/%s", count, fySuffix);
    }

    public JobCard createJobCard(JobCard jobCard) {
        if (jobCard.getJobNo() == null || jobCard.getJobNo().trim().isEmpty()) {
            jobCard.setJobNo(generateNextJobNo());
        }
        if (jobCard.getJobDate() == null) {
            jobCard.setJobDate(LocalDate.now());
        }
        return jobCardRepository.save(jobCard);
    }

    public JobCard updateJobCard(Long id, JobCard updated) {
        JobCard existing = jobCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job Card not found with ID: " + id));

        updated.setId(id);
        if (updated.getJobDate() == null) {
            updated.setJobDate(existing.getJobDate());
        }
        if (updated.getJobNo() == null || updated.getJobNo().trim().isEmpty()) {
            updated.setJobNo(existing.getJobNo());
        }
        return jobCardRepository.save(updated);
    }

    public void deleteJobCard(Long id) {
        jobCardRepository.deleteById(id);
    }
}
