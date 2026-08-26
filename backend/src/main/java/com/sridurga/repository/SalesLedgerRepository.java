package com.sridurga.repository;

import com.sridurga.model.SalesLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesLedgerRepository extends JpaRepository<SalesLedger, Long> {
    List<SalesLedger> findAllByOrderByInvoiceDateDesc();
    boolean existsByInvoiceNo(String invoiceNo);
    boolean existsByInvoiceNoAndInvoiceDate(String invoiceNo, LocalDate invoiceDate);
}
