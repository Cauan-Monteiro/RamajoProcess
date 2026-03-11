package com.ramajo.gestorProc.dto;

import com.ramajo.gestorProc.enums.Estagio;

import java.util.Date;

public record TraveEstadoDTO(
        Long traveId,
        String traveNome,
        Boolean emBanho,
        Long traveBanhoId,
        Long banhoId,
        String banhoNome,
        Float tempoBanho,
        Estagio banhoEstagio,
        Date iniciadoEm,
        Estagio estagioAguardando
) {}
