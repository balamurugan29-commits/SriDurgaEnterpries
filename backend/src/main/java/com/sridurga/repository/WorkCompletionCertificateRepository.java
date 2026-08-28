package com.sridurga.repository;

import com.sridurga.model.WorkCompletionCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkCompletionCertificateRepository extends JpaRepository<WorkCompletionCertificate, Long> {
    List<WorkCompletionCertificate> findAllByOrderByCreatedAtDesc();
    Optional<WorkCompletionCertificate> findByCertificateNo(String certificateNo);

    @Query("SELECT w.certificateNo FROM WorkCompletionCertificate w WHERE w.certificateNo LIKE %:suffix")
    List<String> findCertificateNosBySuffix(@Param("suffix") String suffix);
}
