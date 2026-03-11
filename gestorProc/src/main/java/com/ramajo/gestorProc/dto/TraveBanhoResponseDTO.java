package com.ramajo.gestorProc.dto;

public record TraveBanhoResponseDTO(
        Long id,
        Long processoId,
        Long traveId,
        Long banhoId,
        Long tempoTotalMinutos
) {}