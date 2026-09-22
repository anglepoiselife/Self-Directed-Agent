package com.sheets.service;

import com.sheets.dto.WorkbookCreateRequest;
import com.sheets.dto.WorkbookDTO;
import com.sheets.dto.WorkbookUpdateRequest;
import com.sheets.entity.Workbook;
import com.sheets.repository.WorkbookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class WorkbookService {

    private final WorkbookRepository workbookRepository;
    private final SheetService sheetService;

    public WorkbookService(WorkbookRepository workbookRepository, SheetService sheetService) {
        this.workbookRepository = workbookRepository;
        this.sheetService = sheetService;
    }

    @Transactional(readOnly = true)
    public List<WorkbookDTO> list(UUID userId) {
        return workbookRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public WorkbookDTO create(UUID userId, WorkbookCreateRequest request) {
        Workbook workbook = new Workbook(request.name(), userId);
        workbook = workbookRepository.save(workbook);
        sheetService.addSheetToWorkbook(workbook.getId(), "Sheet1");
        return toDTO(workbook);
    }

    @Transactional
    public WorkbookDTO rename(UUID userId, UUID id, WorkbookUpdateRequest request) {
        Workbook workbook = workbookRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> new RuntimeException("Workbook not found"));
        workbook.setName(request.name());
        workbook = workbookRepository.save(workbook);
        return toDTO(workbook);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Workbook workbook = workbookRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> new RuntimeException("Workbook not found"));
        workbook.setDeletedAt(OffsetDateTime.now());
        workbookRepository.save(workbook);
    }

    private WorkbookDTO toDTO(Workbook workbook) {
        return new WorkbookDTO(
                workbook.getId().toString(),
                workbook.getName(),
                workbook.getCreatedAt().toString(),
                workbook.getUpdatedAt().toString(),
                List.of()
        );
    }
}