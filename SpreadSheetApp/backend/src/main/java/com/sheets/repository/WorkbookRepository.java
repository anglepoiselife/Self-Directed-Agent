package com.sheets.repository;

import com.sheets.entity.Workbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkbookRepository extends JpaRepository<Workbook, UUID> {

    List<Workbook> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);

    Optional<Workbook> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);

    long countByUserIdAndDeletedAtIsNull(UUID userId);

    List<Workbook> findByUserIdAndDeletedAtIsNull(UUID userId);
}