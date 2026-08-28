package com.sridurga.repository;

import com.sridurga.model.ItemMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemMasterRepository extends JpaRepository<ItemMaster, Long> {

    Optional<ItemMaster> findByItemCodeIgnoreCase(String itemCode);

    boolean existsByItemCodeIgnoreCase(String itemCode);

    Optional<ItemMaster> findByItemCodeIgnoreCaseAndFolderNameIgnoreCase(String itemCode, String folderName);

    boolean existsByItemCodeIgnoreCaseAndFolderNameIgnoreCase(String itemCode, String folderName);

    List<ItemMaster> findByFolderNameIgnoreCaseOrderBySerialNumberAsc(String folderName);

    List<ItemMaster> findByItemCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderBySerialNumberAsc(String itemCodeQuery, String descQuery);

    List<ItemMaster> findAllByOrderBySerialNumberAsc();

    @Query("SELECT MAX(i.serialNumber) FROM ItemMaster i")
    Integer findMaxSerialNumber();

    @Modifying
    @Query("UPDATE ItemMaster i SET i.folderName = :targetFolder WHERE i.id IN :itemIds")
    void bulkUpdateFolderName(@Param("itemIds") List<Long> itemIds, @Param("targetFolder") String targetFolder);

    @Modifying
    @Query("UPDATE ItemMaster i SET i.folderName = :newFolder WHERE LOWER(i.folderName) = LOWER(:oldFolder)")
    void renameFolder(@Param("oldFolder") String oldFolder, @Param("newFolder") String newFolder);

    @Modifying
    @Query("UPDATE ItemMaster i SET i.folderName = 'General' WHERE LOWER(i.folderName) = LOWER(:folderName)")
    void resetFolderToGeneral(@Param("folderName") String folderName);

    @Modifying
    @Query("DELETE FROM ItemMaster i WHERE LOWER(i.folderName) = LOWER(:folderName)")
    void deleteByFolderNameIgnoreCase(@Param("folderName") String folderName);
}
