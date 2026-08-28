package com.sridurga.repository;

import com.sridurga.model.GatePass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GatePassRepository extends JpaRepository<GatePass, Long> {
    List<GatePass> findAllByOrderByCreatedAtDesc();
    Optional<GatePass> findByGatePassNo(String gatePassNo);

    @Query("SELECT g.gatePassNo FROM GatePass g WHERE g.gatePassNo LIKE %:suffix")
    List<String> findGatePassNosBySuffix(@Param("suffix") String suffix);
}
