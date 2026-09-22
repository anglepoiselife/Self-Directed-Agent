package com.sheets.repository;

import com.sheets.entity.Sheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SheetRepository extends JpaRepository<Sheet, UUID> {

    List<Sheet> findByWorkbook_Id(UUID workbookId);

    List<Sheet> findByWorkbook_IdOrderByPositionAsc(UUID workbookId);

    Optional<Sheet> findByWorkbook_IdAndName(UUID workbookId, String name);
}