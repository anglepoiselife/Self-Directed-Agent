package com.sheets.dto;

public record AuthResponse(
    String token,
    String username
) {}