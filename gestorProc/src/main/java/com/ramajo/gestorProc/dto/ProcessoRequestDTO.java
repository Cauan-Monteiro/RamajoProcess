package com.ramajo.gestorProc.dto;

import java.util.List;

public record ProcessoRequestDTO(String numOS, List<Long> idsTraves) {
}
