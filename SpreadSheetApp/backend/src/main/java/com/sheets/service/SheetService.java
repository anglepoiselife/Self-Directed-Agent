package com.sheets.service;

import com.sheets.dto.SheetDTO;
import com.sheets.entity.Cell;
import com.sheets.entity.Sheet;
import com.sheets.entity.Workbook;
import com.sheets.repository.CellRepository;
import com.sheets.repository.SheetRepository;
import com.sheets.repository.WorkbookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SheetService {

    private final SheetRepository sheetRepository;
    private final CellRepository cellRepository;
    private final WorkbookRepository workbookRepository;

    public SheetService(SheetRepository sheetRepository, CellRepository cellRepository, WorkbookRepository workbookRepository) {
        this.sheetRepository = sheetRepository;
        this.cellRepository = cellRepository;
        this.workbookRepository = workbookRepository;
    }

    @Transactional
    public SheetDTO createSheet(UUID workbookId, String name, int position) {
        Workbook workbook = workbookRepository.findById(workbookId)
                .orElseThrow(() -> new IllegalArgumentException("Workbook not found: " + workbookId));

        sheetRepository.findByWorkbook_IdAndName(workbookId, name).ifPresent(sheet -> {
            throw new IllegalArgumentException("A sheet named '" + name + "' already exists in this workbook.");
        });

        Sheet sheet = new Sheet();
        sheet.setWorkbook(workbook);
        sheet.setName(name);
        sheet.setPosition(position);
        sheet.setCreatedAt(LocalDateTime.now());
        sheet.setUpdatedAt(LocalDateTime.now());

        Sheet saved = sheetRepository.save(sheet);
        return toDTO(saved);
    }

    @Transactional
    public SheetDTO addSheetToWorkbook(UUID workbookId, String name) {
        List<Sheet> existing = sheetRepository.findByWorkbook_IdOrderByPositionAsc(workbookId);
        int position = existing.size();

        return createSheet(workbookId, name, position);
    }

    @Transactional
    public SheetDTO renameSheet(UUID sheetId, String newName) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));

        UUID workbookId = sheet.getWorkbook().getId();
        sheetRepository.findByWorkbook_IdAndName(workbookId, newName).ifPresent(existing -> {
            if (!existing.getId().equals(sheetId)) {
                throw new IllegalArgumentException("A sheet named '" + newName + "' already exists in this workbook.");
            }
        });

        sheet.setName(newName);
        sheet.setUpdatedAt(LocalDateTime.now());
        Sheet saved = sheetRepository.save(sheet);
        return toDTO(saved);
    }

    @Transactional
    public void deleteSheet(UUID sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));

        List<Cell> cells = cellRepository.findBySheet_Id(sheetId);
        if (!cells.isEmpty()) {
            cellRepository.deleteAll(cells);
        }

        sheetRepository.delete(sheet);
    }

    @Transactional(readOnly = true)
    public List<SheetDTO> getSheetsForWorkbook(UUID workbookId) {
        List<Sheet> sheets = sheetRepository.findByWorkbook_IdOrderByPositionAsc(workbookId);
        return sheets.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SheetDTO getSheetById(UUID sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));
        return toDTO(sheet);
    }

    private SheetDTO toDTO(Sheet sheet) {
        return new SheetDTO(
                sheet.getId().toString(),
                sheet.getName(),
                sheet.getPosition()
        );
    }
}