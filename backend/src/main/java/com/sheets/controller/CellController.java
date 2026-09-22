package com.sheets.controller;

import com.sheets.dto.CellDTO;
import com.sheets.dto.CellUpdateRequest;
import com.sheets.service.CellService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CellController {

    private final CellService cellService;

    public CellController(CellService cellService) {
        this.cellService = cellService;
    }

    @GetMapping("/sheets/{sheetId}/cells")
    public ResponseEntity<List<CellDTO>> getCells(@PathVariable UUID sheetId) {
        try {
            List<CellDTO> cells = cellService.getCellsForSheet(sheetId);
            return ResponseEntity.ok(cells);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/sheets/{sheetId}/cells")
    public ResponseEntity<List<CellDTO>> updateCells(
            @PathVariable UUID sheetId,
            @RequestBody List<CellUpdateRequest> updates) {
        try {
            List<CellDTO> cells = cellService.bulkUpdateCells(sheetId, updates);
            return ResponseEntity.ok(cells);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/sheets/{sheetId}/cells/recalculate")
    public ResponseEntity<List<CellDTO>> recalculate(@PathVariable UUID sheetId) {
        try {
            List<CellDTO> cells = cellService.recalculateFormulas(sheetId);
            return ResponseEntity.ok(cells);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}