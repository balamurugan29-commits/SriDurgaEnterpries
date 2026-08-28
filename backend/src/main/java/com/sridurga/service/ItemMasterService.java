package com.sridurga.service;

import com.sridurga.dto.ItemDto;
import com.sridurga.model.ItemMaster;
import com.sridurga.repository.ItemMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemMasterService {

    @Autowired
    private ItemMasterRepository itemMasterRepository;

    @Transactional(readOnly = true)
    public List<ItemDto> getAllItems() {
        return itemMasterRepository.findAllByOrderBySerialNumberAsc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemDto> searchItems(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllItems();
        }
        String q = query.trim();
        return itemMasterRepository.findByItemCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderBySerialNumberAsc(q, q)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ItemDto> getItemByCode(String itemCode) {
        return itemMasterRepository.findByItemCodeIgnoreCase(itemCode.trim())
                .map(this::convertToDto);
    }

    public ItemDto createItem(ItemDto dto) {
        if (itemMasterRepository.existsByItemCodeIgnoreCase(dto.getItemCode())) {
            throw new IllegalArgumentException("Item Code '" + dto.getItemCode() + "' already exists!");
        }

        ItemMaster item = new ItemMaster();
        Integer nextSerial = itemMasterRepository.findMaxSerialNumber();
        item.setSerialNumber(nextSerial != null ? nextSerial + 1 : 1);
        
        String code = dto.getItemCode().trim().toUpperCase();
        if (code.length() > 100) code = code.substring(0, 100);
        item.setItemCode(code);

        String desc = dto.getDescription() != null ? dto.getDescription().trim() : "";
        if (desc.length() > 1950) desc = desc.substring(0, 1950);
        item.setDescription(desc);

        item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : BigDecimal.ZERO);
        item.setUnit(dto.getUnit() != null && !dto.getUnit().trim().isEmpty() ? dto.getUnit().trim() : "No");
        item.setRate(dto.getRate() != null ? dto.getRate() : BigDecimal.ZERO);
        item.setServiceCharge(dto.getServiceCharge() != null ? dto.getServiceCharge() : BigDecimal.ZERO);
        item.setFolderName(dto.getFolderName() != null && !dto.getFolderName().trim().isEmpty() ? dto.getFolderName().trim() : "General");
        
        // Amount auto calculation: Amount = Quantity * (Rate + Service Charge)
        item.calculateAmount();

        ItemMaster saved = itemMasterRepository.save(item);
        return convertToDto(saved);
    }

    public ItemDto updateItem(Long id, ItemDto dto) {
        ItemMaster item = itemMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with ID: " + id));

        String code = dto.getItemCode().trim().toUpperCase();
        if (code.length() > 100) code = code.substring(0, 100);

        if (!item.getItemCode().equalsIgnoreCase(code) &&
                itemMasterRepository.existsByItemCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Item Code '" + code + "' already exists!");
        }

        if (dto.getSerialNumber() != null) {
            item.setSerialNumber(dto.getSerialNumber());
        }
        item.setItemCode(code);

        String desc = dto.getDescription() != null ? dto.getDescription().trim() : "";
        if (desc.length() > 1950) desc = desc.substring(0, 1950);
        item.setDescription(desc);

        item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : BigDecimal.ZERO);
        if (dto.getUnit() != null && !dto.getUnit().trim().isEmpty()) {
            item.setUnit(dto.getUnit().trim());
        }
        item.setRate(dto.getRate() != null ? dto.getRate() : BigDecimal.ZERO);
        item.setServiceCharge(dto.getServiceCharge() != null ? dto.getServiceCharge() : BigDecimal.ZERO);
        if (dto.getFolderName() != null && !dto.getFolderName().trim().isEmpty()) {
            item.setFolderName(dto.getFolderName().trim());
        }
        
        // Amount auto calculation: Amount = Quantity * (Rate + Service Charge)
        item.calculateAmount();

        ItemMaster updated = itemMasterRepository.save(item);
        return convertToDto(updated);
    }

    public List<ItemDto> createItemsBulk(List<ItemDto> dtos) {
        List<ItemDto> results = new java.util.ArrayList<>();
        Integer currentMaxSno = itemMasterRepository.findMaxSerialNumber();
        int maxSno = currentMaxSno != null ? currentMaxSno : 0;

        for (ItemDto dto : dtos) {
            try {
                if (dto.getItemCode() == null || dto.getItemCode().trim().isEmpty()) {
                    continue;
                }
                String code = dto.getItemCode().trim().toUpperCase();
                String desc = dto.getDescription() != null ? dto.getDescription().trim() : "";
                String folder = dto.getFolderName() != null && !dto.getFolderName().trim().isEmpty() ? dto.getFolderName().trim() : "General";

                Optional<ItemMaster> existingOpt = itemMasterRepository.findByItemCodeIgnoreCase(code);
                ItemMaster item;
                if (existingOpt.isPresent()) {
                    item = existingOpt.get();
                    if (!desc.isEmpty()) {
                        item.setDescription(desc);
                    }
                    if (dto.getRate() != null) {
                        item.setRate(dto.getRate());
                    }
                    if (dto.getUnit() != null && !dto.getUnit().trim().isEmpty()) {
                        item.setUnit(dto.getUnit().trim());
                    }
                    if (dto.getServiceCharge() != null) {
                        item.setServiceCharge(dto.getServiceCharge());
                    }
                    if (dto.getQuantity() != null) {
                        item.setQuantity(dto.getQuantity());
                    }
                    if (dto.getFolderName() != null && !dto.getFolderName().trim().isEmpty()) {
                        item.setFolderName(folder);
                    }
                    item.calculateAmount();
                } else {
                    item = new ItemMaster();
                    maxSno++;
                    item.setSerialNumber(maxSno);
                    item.setItemCode(code);
                    item.setDescription(desc);
                    item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : BigDecimal.ZERO);
                    item.setUnit(dto.getUnit() != null && !dto.getUnit().trim().isEmpty() ? dto.getUnit().trim() : "No");
                    item.setRate(dto.getRate() != null ? dto.getRate() : BigDecimal.ZERO);
                    item.setServiceCharge(dto.getServiceCharge() != null ? dto.getServiceCharge() : BigDecimal.ZERO);
                    item.setFolderName(folder);
                    item.calculateAmount();
                }
                ItemMaster saved = itemMasterRepository.save(item);
                results.add(convertToDto(saved));
            } catch (Exception e) {
                System.err.println("Error saving bulk item code '" + dto.getItemCode() + "': " + e.getMessage());
            }
        }
        return results;
    }

    public void bulkMoveToFolder(List<Long> itemIds, String targetFolder) {
        if (itemIds == null || itemIds.isEmpty()) return;
        String folder = targetFolder != null && !targetFolder.trim().isEmpty() ? targetFolder.trim() : "General";
        itemMasterRepository.bulkUpdateFolderName(itemIds, folder);
    }

    public void renameFolder(String oldFolder, String newFolder) {
        if (oldFolder == null || newFolder == null) return;
        String target = newFolder.trim();
        itemMasterRepository.renameFolder(oldFolder.trim(), target);
    }

    public void deleteFolder(String folderName, boolean deleteItems) {
        if (folderName == null) return;
        String folder = folderName.trim();
        if (deleteItems) {
            itemMasterRepository.deleteByFolderNameIgnoreCase(folder);
        } else {
            itemMasterRepository.resetFolderToGeneral(folder);
        }
    }

    public void deleteItem(Long id) {
        itemMasterRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportToCsv() {
        List<ItemMaster> items = itemMasterRepository.findAllByOrderBySerialNumberAsc();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            // Write CSV Header
            writer.println("Serial Number,Item Code,Description,Quantity,Unit,Rate (INR),Service Charge (INR),Amount (INR),Folder");
            
            for (ItemMaster item : items) {
                writer.println(String.format("%d,\"%s\",\"%s\",%.2f,\"%s\",%.2f,%.2f,%.2f,\"%s\"",
                        item.getSerialNumber(),
                        escapeCsv(item.getItemCode()),
                        escapeCsv(item.getDescription()),
                        item.getQuantity(),
                        escapeCsv(item.getUnit() != null ? item.getUnit() : "No"),
                        item.getRate(),
                        item.getServiceCharge() != null ? item.getServiceCharge() : BigDecimal.ZERO,
                        item.getAmount(),
                        escapeCsv(item.getFolderName() != null ? item.getFolderName() : "General")));
            }
            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        return data.replace("\"", "\"\"");
    }

    private ItemDto convertToDto(ItemMaster item) {
        return new ItemDto(
                item.getId(),
                item.getSerialNumber(),
                item.getItemCode(),
                item.getDescription(),
                item.getQuantity(),
                item.getUnit() != null ? item.getUnit() : "No",
                item.getRate(),
                item.getServiceCharge() != null ? item.getServiceCharge() : BigDecimal.ZERO,
                item.getAmount(),
                item.getFolderName() != null ? item.getFolderName() : "General"
        );
    }
}
