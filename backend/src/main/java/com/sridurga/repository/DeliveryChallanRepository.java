package com.sridurga.repository;

import com.sridurga.model.DeliveryChallan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryChallanRepository extends JpaRepository<DeliveryChallan, Long> {

    Optional<DeliveryChallan> findByChallanNumber(String challanNumber);

    List<DeliveryChallan> findAllByOrderByCreatedAtDesc();

    @Query("SELECT d.challanNumber FROM DeliveryChallan d WHERE d.challanNumber LIKE %:suffix")
    List<String> findChallanNumbersBySuffix(@Param("suffix") String suffix);

    @Query("SELECT COUNT(d) FROM DeliveryChallan d")
    Long countChallans();
}
