package com.sheets.dto;

import java.util.List;

public record WorkbookDTO(
    String id,
    String name,
    String createdAt,
    String updatedAt,
    List<SheetDTO> sheets
) {}