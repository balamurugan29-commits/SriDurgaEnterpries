package com.sridurga.repository;

import com.sridurga.model.PurchaseLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseLedgerRepository extends JpaRepository<PurchaseLedger, Long> {
    List<PurchaseLedger> findAllByOrderByInvoiceDateDesc();
    boolean existsByDealerStoreNameIgnoreCaseAndInvoiceNoIgnoreCase(String dealerStoreName, String invoiceNo);
}
