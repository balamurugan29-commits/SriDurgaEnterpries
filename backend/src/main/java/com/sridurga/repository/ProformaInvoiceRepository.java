package com.sridurga.repository;

import com.sridurga.model.ProformaInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProformaInvoiceRepository extends JpaRepository<ProformaInvoice, Long> {

    Optional<ProformaInvoice> findByProformaNumber(String proformaNumber);

    List<ProformaInvoice> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p.proformaNumber FROM ProformaInvoice p WHERE p.proformaNumber LIKE %:suffix")
    List<String> findProformaNumbersBySuffix(@Param("suffix") String suffix);

    @Query("SELECT COUNT(p) FROM ProformaInvoice p")
    long countAllProformas();
}
