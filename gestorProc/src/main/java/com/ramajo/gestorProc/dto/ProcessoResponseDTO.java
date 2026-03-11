package com.ramajo.gestorProc.dto;

import java.util.Date;
import java.util.List;

public record ProcessoResponseDTO(Long id, String numOS, Date createdAt, Date finishedAt, Long tempoTotalMinutos, List<String> nomesTraves){

}
