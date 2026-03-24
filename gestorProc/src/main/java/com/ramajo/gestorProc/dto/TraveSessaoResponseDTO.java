package com.ramajo.gestorProc.dto;

import java.time.LocalDateTime;

public record TraveSessaoResponseDTO(
        Long id,
        Long processoId,
        Long traveId,
        String traveNome,
        Long banhoId,
        String banhoNome,
        LocalDateTime iniciadoEm,
        LocalDateTime finalizadoEm,
        Long duracaoMinutos
) {}
