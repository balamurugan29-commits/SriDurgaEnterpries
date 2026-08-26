package com.sridurga.controller;

import com.sridurga.model.JobCard;
import com.sridurga.service.JobCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-cards")
@CrossOrigin(origins = "*")
public class JobCardController {

    @Autowired
    private JobCardService jobCardService;

    @GetMapping
    public ResponseEntity<List<JobCard>> getAllJobCards() {
        return ResponseEntity.ok(jobCardService.getAllJobCards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobCard> getJobCardById(@PathVariable Long id) {
        return jobCardService.getJobCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextJobNo() {
        String nextNo = jobCardService.generateNextJobNo();
        return ResponseEntity.ok(Map.of("nextJobNo", nextNo, "jobNo", nextNo));
    }

    @PostMapping
    public ResponseEntity<JobCard> createJobCard(@RequestBody JobCard jobCard) {
        return ResponseEntity.ok(jobCardService.createJobCard(jobCard));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobCard> updateJobCard(@PathVariable Long id, @RequestBody JobCard jobCard) {
        return ResponseEntity.ok(jobCardService.updateJobCard(id, jobCard));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteJobCard(@PathVariable Long id) {
        jobCardService.deleteJobCard(id);
        return ResponseEntity.ok(Map.of("message", "Job Card deleted successfully"));
    }
}
