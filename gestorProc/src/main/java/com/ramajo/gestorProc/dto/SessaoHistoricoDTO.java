package com.ramajo.gestorProc.dto;

import java.time.LocalDateTime;

public record SessaoHistoricoDTO(
        Long sessaoId,
        Long traveId,
        String traveNome,
        Long banhoId,
        String banhoNome,
        Integer tempoBanho,
        LocalDateTime iniciadoEm,
        LocalDateTime finalizadoEm,
        Long duracaoMinutos
) {}
