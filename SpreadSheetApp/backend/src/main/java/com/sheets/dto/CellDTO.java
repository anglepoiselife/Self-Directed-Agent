package com.sheets.dto;

import java.time.LocalDateTime;

public record CellDTO(
    String id,
    String sheetId,
    int row,
    int col,
    String cellRef,
    String value,
    String cellType,
    String formula,
    String computedValue,
    LocalDateTime updatedAt
) {}