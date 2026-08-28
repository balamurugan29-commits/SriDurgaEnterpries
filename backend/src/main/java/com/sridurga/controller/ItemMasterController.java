package com.sridurga.controller;

import com.sridurga.dto.ItemDto;
import com.sridurga.service.ItemMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemMasterController {

    @Autowired
    private ItemMasterService itemMasterService;

    @GetMapping
    public ResponseEntity<List<ItemDto>> getAllItems(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(itemMasterService.searchItems(search));
        }
        return ResponseEntity.ok(itemMasterService.getAllItems());
    }

    @GetMapping("/code/{itemCode}")
    public ResponseEntity<?> getItemByCode(@PathVariable String itemCode) {
        return itemMasterService.getItemByCode(itemCode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ItemDto) null));
    }

    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody ItemDto dto) {
        try {
            ItemDto created = itemMasterService.createItem(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createItemsBulk(@RequestBody List<ItemDto> dtos) {
        try {
            List<ItemDto> createdList = itemMasterService.createItemsBulk(dtos);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Bulk upload failed: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody ItemDto dto) {
        try {
            ItemDto updated = itemMasterService.updateItem(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemMasterService.deleteItem(id);
            return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not delete item: " + e.getMessage()));
        }
    }

    @PostMapping("/move-folder")
    public ResponseEntity<?> moveItemsToFolder(@RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<Number> rawIds = (List<Number>) payload.get("itemIds");
            String folderName = (String) payload.get("folderName");
            if (rawIds == null || rawIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No item IDs provided"));
            }
            List<Long> itemIds = rawIds.stream().map(Number::longValue).collect(java.util.stream.Collectors.toList());
            itemMasterService.bulkMoveToFolder(itemIds, folderName);
            return ResponseEntity.ok(Map.of("message", "Items moved to folder successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Move failed: " + e.getMessage()));
        }
    }

    @PostMapping("/rename-folder")
    public ResponseEntity<?> renameFolder(@RequestBody Map<String, String> payload) {
        try {
            String oldFolder = payload.get("oldFolder");
            String newFolder = payload.get("newFolder");
            if (oldFolder == null || newFolder == null || newFolder.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Folder names required"));
            }
            itemMasterService.renameFolder(oldFolder, newFolder);
            return ResponseEntity.ok(Map.of("message", "Folder renamed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rename failed: " + e.getMessage()));
        }
    }

    @PostMapping("/delete-folder")
    public ResponseEntity<?> deleteFolder(@RequestBody Map<String, Object> payload) {
        try {
            String folderName = (String) payload.get("folderName");
            Boolean deleteItems = (Boolean) payload.get("deleteItems");
            if (folderName == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Folder name required"));
            }
            itemMasterService.deleteFolder(folderName, Boolean.TRUE.equals(deleteItems));
            return ResponseEntity.ok(Map.of("message", "Folder deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Folder deletion failed: " + e.getMessage()));
        }
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportItemsToCsv() {
        ByteArrayInputStream stream = itemMasterService.exportToCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Sri_Durga_Item_Master.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(stream));
    }
}
