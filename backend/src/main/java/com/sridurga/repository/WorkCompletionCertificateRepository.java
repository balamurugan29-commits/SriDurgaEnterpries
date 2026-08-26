package com.sridurga.repository;

import com.sridurga.model.WorkCompletionCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkCompletionCertificateRepository extends JpaRepository<WorkCompletionCertificate, Long> {
    List<WorkCompletionCertificate> findAllByOrderByCreatedAtDesc();
}
