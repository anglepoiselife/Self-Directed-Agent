package com.sheets.controller;

import com.sheets.dto.WorkbookCreateRequest;
import com.sheets.dto.WorkbookDTO;
import com.sheets.dto.WorkbookUpdateRequest;
import com.sheets.service.WorkbookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/workbooks")
public class WorkbookController {

    private final WorkbookService workbookService;

    public WorkbookController(WorkbookService workbookService) {
        this.workbookService = workbookService;
    }

    @GetMapping
    public ResponseEntity<List<WorkbookDTO>> list() {
        UUID userId = getCurrentUserId();
        List<WorkbookDTO> workbooks = workbookService.list(userId);
        return ResponseEntity.ok(workbooks);
    }

    @PostMapping
    public ResponseEntity<WorkbookDTO> create(@RequestBody WorkbookCreateRequest request) {
        UUID userId = getCurrentUserId();
        WorkbookDTO workbook = workbookService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(workbook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkbookDTO> rename(@PathVariable UUID id, @RequestBody WorkbookUpdateRequest request) {
        UUID userId = getCurrentUserId();
        WorkbookDTO workbook = workbookService.rename(userId, id, request);
        return ResponseEntity.ok(workbook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        workbookService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    private UUID getCurrentUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}