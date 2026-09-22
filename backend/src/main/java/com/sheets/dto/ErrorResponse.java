package com.sheets.dto;

public record ErrorResponse(
    String error,
    String message
) {}