package com.sheets.dto;

public record CellUpdateMessage(
    String sheetId,
    int row,
    int col,
    String value,
    String computedValue,
    String userId
) {}