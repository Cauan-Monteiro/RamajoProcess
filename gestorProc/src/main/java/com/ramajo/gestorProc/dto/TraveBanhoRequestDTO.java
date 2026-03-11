package com.ramajo.gestorProc.dto;

import java.util.List;

public record TraveBanhoRequestDTO(Long processoId, List<Long> traveId, Long banhoId) {

}
