package com.sridurga.repository;

import com.sridurga.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
    List<JobCard> findAllByOrderByCreatedAtDesc();
    Optional<JobCard> findByJobNo(String jobNo);
}
