package com.ramajo.gestorProc.dto;

import java.util.List;

public record BanhoRequestDTO(
        String nome,
        String descricao,
        Integer tempoBanho,
        List<Long> areaIds
) {}
