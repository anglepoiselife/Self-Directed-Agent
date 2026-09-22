package com.sheets.dto;

public record SheetAddedMessage(
    String workbookId,
    String sheetId,
    String name,
    int order
) {}