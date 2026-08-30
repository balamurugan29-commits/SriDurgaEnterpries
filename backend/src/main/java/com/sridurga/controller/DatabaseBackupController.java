package com.sridurga.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sridurga.dto.DatabaseBackupDTO;
import com.sridurga.service.DatabaseBackupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "*")
@Slf4j
public class DatabaseBackupController {

    @Autowired
    private DatabaseBackupService databaseBackupService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Download Total Database Backup as a formatted JSON attachment
     */
    @GetMapping("/download")
    public ResponseEntity<DatabaseBackupDTO> downloadDatabaseBackup() {
        log.info("Request to download complete database backup received");
        DatabaseBackupDTO backup = databaseBackupService.exportDatabaseBackup();

        String filename = "sri_durga_total_database_backup_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + ".json";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(backup);
    }

    /**
     * Restore Total Database via JSON Payload
     */
    @PostMapping("/restore")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> restoreDatabase(@RequestBody DatabaseBackupDTO backup) {
        log.info("Request to restore database via JSON payload received");
        Map<String, Object> result = databaseBackupService.restoreDatabaseBackup(backup);
        return ResponseEntity.ok(result);
    }

    /**
     * Upload & Restore Total Database via File Upload (.json / .sdbak)
     */
    @PostMapping("/upload-restore")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadAndRestoreDatabase(@RequestParam("file") MultipartFile file) {
        log.info("Request to upload and restore database file: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Uploaded database file is empty."
            ));
        }

        try {
            DatabaseBackupDTO backup = objectMapper.readValue(file.getInputStream(), DatabaseBackupDTO.class);
            Map<String, Object> result = databaseBackupService.restoreDatabaseBackup(backup);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to parse or restore database backup file", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to restore database: " + e.getMessage()
            ));
        }
    }

    /**
     * Get Live Table Counts Summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDatabaseSummary() {
        return ResponseEntity.ok(databaseBackupService.getDatabaseSummary());
    }
}
