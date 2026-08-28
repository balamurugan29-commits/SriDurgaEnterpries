package com.sridurga.repository;

import com.sridurga.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
    List<JobCard> findAllByOrderByCreatedAtDesc();
    Optional<JobCard> findByJobNo(String jobNo);

    @Query("SELECT j.jobNo FROM JobCard j WHERE j.jobNo LIKE %:suffix")
    List<String> findJobNosBySuffix(@Param("suffix") String suffix);
}
