package com.ramajo.gestorProc.dto;

import com.ramajo.gestorProc.enums.Estagio;

import java.util.Date;

public record TraveBanhoHistoricoDTO(
        Long traveBanhoId,
        Long traveId,
        String traveNome,
        Long banhoId,
        String banhoNome,
        Float tempoBanho,
        Estagio banhoEstagio,
        Date iniciadoEm,
        Date finalizadoEm,
        Long duracaoMinutos
) {}
