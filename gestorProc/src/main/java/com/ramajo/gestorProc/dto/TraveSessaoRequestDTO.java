package com.ramajo.gestorProc.dto;

import java.util.List;

public record TraveSessaoRequestDTO(
        Long processoId,
        List<Long> traveIds,
        Long banhoId
) {}
