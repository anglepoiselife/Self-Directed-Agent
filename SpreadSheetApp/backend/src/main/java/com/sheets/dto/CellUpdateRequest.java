package com.sheets.dto;

public record CellUpdateRequest(
    int row,
    int col,
    String value,
    String cellType,
    String formula
) {}