package com.ramajo.gestorProc.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProcessoResponseDTO(
        Long id,
        String numOS,
        LocalDateTime createdAt,
        LocalDateTime finishedAt,
        Long tempoTotalMinutos,
        List<String> nomesTraves
) {}
