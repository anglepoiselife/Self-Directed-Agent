package com.sheets.dto;

public record SheetRemovedMessage(
    String workbookId,
    String sheetId
) {}