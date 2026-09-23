package com.sheets.controller;

import com.sheets.dto.SheetCreateRequest;
import com.sheets.dto.SheetDTO;
import com.sheets.dto.SheetUpdateRequest;
import com.sheets.service.SheetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class SheetController {

    private final SheetService sheetService;

    public SheetController(SheetService sheetService) {
        this.sheetService = sheetService;
    }

    @GetMapping("/workbooks/{workbookId}/sheets")
    public ResponseEntity<List<SheetDTO>> getSheets(@PathVariable UUID workbookId) {
        List<SheetDTO> sheets = sheetService.getSheetsForWorkbook(workbookId);
        return ResponseEntity.ok(sheets);
    }

    @PostMapping("/workbooks/{workbookId}/sheets")
    public ResponseEntity<SheetDTO> createSheet(
            @PathVariable UUID workbookId,
            @RequestBody SheetCreateRequest request) {
        try {
            SheetDTO sheet = sheetService.addSheetToWorkbook(workbookId, request.name());
            return ResponseEntity.status(HttpStatus.CREATED).body(sheet);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/sheets/{sheetId}")
    public ResponseEntity<SheetDTO> renameSheet(
            @PathVariable UUID sheetId,
            @RequestBody SheetUpdateRequest request) {
        try {
            SheetDTO sheet = sheetService.renameSheet(sheetId, request.name());
            return ResponseEntity.ok(sheet);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/sheets/{sheetId}")
    public ResponseEntity<Void> deleteSheet(@PathVariable UUID sheetId) {
        try {
            sheetService.deleteSheet(sheetId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sheets/{sheetId}")
    public ResponseEntity<SheetDTO> getSheet(@PathVariable UUID sheetId) {
        try {
            SheetDTO sheet = sheetService.getSheetById(sheetId);
            return ResponseEntity.ok(sheet);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}