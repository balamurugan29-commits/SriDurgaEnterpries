package com.sridurga.repository;

import com.sridurga.model.CustomerMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerMasterRepository extends JpaRepository<CustomerMaster, Long> {

    List<CustomerMaster> findAllByOrderBySerialNumberAsc();

    Optional<CustomerMaster> findByCustomerNameIgnoreCase(String customerName);

    List<CustomerMaster> findByCustomerNameContainingIgnoreCase(String keyword);

    @Query("SELECT COALESCE(MAX(c.serialNumber), 0) FROM CustomerMaster c")
    Integer getMaxSerialNumber();
}
