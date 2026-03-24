package com.ramajo.gestorProc.dto;

import com.ramajo.gestorProc.enums.Estagio;

import java.time.LocalDateTime;
import java.util.List;

public record TraveEstadoDTO(
        Long traveId,
        String traveNome,
        Estagio estagioAtual,
        Boolean emSessao,
        Long sessaoId,
        Long banhoId,
        String banhoNome,
        Integer tempoBanho,
        List<String> banhoAreas,
        LocalDateTime iniciadoEm
) {}
