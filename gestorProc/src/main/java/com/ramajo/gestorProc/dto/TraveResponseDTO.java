package com.ramajo.gestorProc.dto;

import com.ramajo.gestorProc.enums.Estagio;

public record TraveResponseDTO(
        Long idTrave,
        String nome,
        Boolean emUso,
        Estagio estagioAtual,
        Long processoAtualId
) {}
