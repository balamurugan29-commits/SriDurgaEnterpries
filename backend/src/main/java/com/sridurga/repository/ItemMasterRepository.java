package com.sridurga.repository;

import com.sridurga.model.ItemMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemMasterRepository extends JpaRepository<ItemMaster, Long> {

    Optional<ItemMaster> findByItemCodeIgnoreCase(String itemCode);

    boolean existsByItemCodeIgnoreCase(String itemCode);

    List<ItemMaster> findByItemCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderBySerialNumberAsc(String itemCodeQuery, String descQuery);

    List<ItemMaster> findAllByOrderBySerialNumberAsc();

    @Query("SELECT MAX(i.serialNumber) FROM ItemMaster i")
    Integer findMaxSerialNumber();
}
