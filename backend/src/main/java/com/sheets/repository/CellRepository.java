package com.sheets.repository;

import com.sheets.entity.Cell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CellRepository extends JpaRepository<Cell, UUID> {

    List<Cell> findBySheet_Id(UUID sheetId);

    Optional<Cell> findBySheet_IdAndRowAndCol(UUID sheetId, Integer row, Integer col);

    @Query("SELECT c FROM Cell c WHERE c.sheet.id = :sheetId AND c.row IN :rows AND c.col IN :cols")
    List<Cell> findBySheet_IdAndRowInAndColIn(@Param("sheetId") UUID sheetId,
                                              @Param("rows") List<Integer> rows,
                                              @Param("cols") List<Integer> cols);
}