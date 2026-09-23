package com.sheets.dto;

public record SheetRenamedMessage(
    String workbookId,
    String sheetId,
    String name
) {}