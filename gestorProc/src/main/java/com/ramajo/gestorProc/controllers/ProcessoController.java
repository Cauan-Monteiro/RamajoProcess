package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.AdicionarTraveRequestDTO;
import com.ramajo.gestorProc.dto.ProcessoRequestDTO;
import com.ramajo.gestorProc.dto.ProcessoResponseDTO;
import com.ramajo.gestorProc.dto.SessaoHistoricoDTO;
import com.ramajo.gestorProc.dto.TraveEstadoDTO;
import com.ramajo.gestorProc.entities.Processo;
import com.ramajo.gestorProc.entities.Trave;
import com.ramajo.gestorProc.entities.TraveSessao;
import com.ramajo.gestorProc.repositories.ProcessoRepository;
import com.ramajo.gestorProc.repositories.TraveSessaoRepository;
import com.ramajo.gestorProc.repositories.TraveRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/processo")
public class ProcessoController {

    @Autowired
    private ProcessoRepository repo;
    @Autowired
    private TraveRepository traveRepo;
    @Autowired
    private TraveSessaoRepository sessaoRepo;

    @GetMapping
    public List<Processo> findAll() {
        return repo.findAll();
    }

    @GetMapping("/ativo")
    public List<ProcessoResponseDTO> findAllAtivos() {
        return repo.findByFinishedAtIsNull().stream()
                .map(processo -> {
                    List<String> nomes = traveRepo.findByProcessoAtual_Id(processo.getId())
                            .stream().map(Trave::getNome).toList();
                    return new ProcessoResponseDTO(
                            processo.getId(), processo.getNumOS(),
                            processo.getCreatedAt(), null, null, nomes);
                })
                .toList();
    }

    @GetMapping("/inativo")
    public List<ProcessoResponseDTO> findInativos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        LocalDateTime fim = (to != null) ? to : LocalDateTime.now();
        LocalDateTime inicio = (from != null) ? from : fim.minusDays(7);

        return repo.findByFinishedAtBetween(inicio, fim).stream()
                .map(processo -> {
                    List<String> nomes = sessaoRepo.findByProcesso_IdOrderByIniciadoEmAsc(processo.getId())
                            .stream().map(s -> s.getTrave().getNome()).distinct().toList();
                    long minutos = ChronoUnit.MINUTES.between(
                            processo.getCreatedAt(), processo.getFinishedAt());
                    return new ProcessoResponseDTO(
                            processo.getId(), processo.getNumOS(),
                            processo.getCreatedAt(), processo.getFinishedAt(),
                            minutos, nomes);
                })
                .toList();
    }

    @GetMapping("/{id}/traves")
    public ResponseEntity<List<TraveEstadoDTO>> getTraveEstado(@PathVariable Long id) {
        repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        List<Trave> traves = traveRepo.findByProcessoAtual_Id(id);

        Map<Long, TraveSessao> sessaoAtivaPorTrave = sessaoRepo
                .findByProcesso_IdAndFinalizadoEmIsNull(id)
                .stream()
                .collect(Collectors.toMap(s -> s.getTrave().getId(), s -> s));

        List<TraveEstadoDTO> resultado = traves.stream().map(trave -> {
            TraveSessao sessao = sessaoAtivaPorTrave.get(trave.getId());
            if (sessao != null) {
                List<String> areas = sessao.getBanho().getAreas()
                        .stream().map(a -> a.getNome().name()).toList();
                return new TraveEstadoDTO(
                        trave.getId(), trave.getNome(),
                        trave.getEstagioAtual(),
                        true,
                        sessao.getId(),
                        sessao.getBanho().getId(), sessao.getBanho().getNome(),
                        sessao.getBanho().getTempoBanho(),
                        areas,
                        sessao.getIniciadoEm()
                );
            } else {
                return new TraveEstadoDTO(
                        trave.getId(), trave.getNome(),
                        trave.getEstagioAtual(),
                        false,
                        null, null, null, null, null, null
                );
            }
        }).toList();

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<List<SessaoHistoricoDTO>> getHistorico(@PathVariable Long id) {
        repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        List<SessaoHistoricoDTO> resultado = sessaoRepo
                .findByProcesso_IdOrderByIniciadoEmAsc(id)
                .stream().map(s -> new SessaoHistoricoDTO(
                        s.getId(),
                        s.getTrave().getId(), s.getTrave().getNome(),
                        s.getBanho().getId(), s.getBanho().getNome(),
                        s.getBanho().getTempoBanho(),
                        s.getIniciadoEm(), s.getFinalizadoEm(),
                        s.getDuracaoMinutos()
                )).toList();

        return ResponseEntity.ok(resultado);
    }

    @Transactional
    @PostMapping
    public ResponseEntity<Processo> criar(@RequestBody ProcessoRequestDTO dto) {
        Processo novo = new Processo(dto.numOS());
        Processo salvo = repo.save(novo);

        for (Long traveId : dto.idsTraves()) {
            Trave trave = traveRepo.findById(traveId)
                    .orElseThrow(() -> new RuntimeException("Trave não encontrada: " + traveId));
            trave.setEmUso(true);
            trave.setProcessoAtual(salvo);
            trave.setEstagioAtual(null);
            traveRepo.save(trave);
        }

        return ResponseEntity.ok(salvo);
    }

    @Transactional
    @PutMapping("/finalizar/{id}")
    public ResponseEntity<ProcessoResponseDTO> finalizarProcesso(@PathVariable Long id) {
        Processo processo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        LocalDateTime agora = LocalDateTime.now();

        // Fechar todas as sessões abertas deste processo
        sessaoRepo.findByProcesso_IdAndFinalizadoEmIsNull(id).forEach(sessao -> {
            sessao.setFinalizadoEm(agora);
            sessao.setDuracaoMinutos(ChronoUnit.MINUTES.between(sessao.getIniciadoEm(), agora));
            sessaoRepo.save(sessao);
        });

        // Liberar todas as traves do processo
        traveRepo.findByProcessoAtual_Id(id).forEach(trave -> {
            trave.setEmUso(false);
            trave.setProcessoAtual(null);
            trave.setEstagioAtual(null);
            traveRepo.save(trave);
        });

        processo.setFinishedAt(agora);
        repo.save(processo);

        long minutos = ChronoUnit.MINUTES.between(processo.getCreatedAt(), agora);

        return ResponseEntity.ok(new ProcessoResponseDTO(
                processo.getId(), processo.getNumOS(),
                processo.getCreatedAt(), agora, minutos, null));
    }

    @Transactional
    @PutMapping("/{processoId}/trave/{traveId}/liberar")
    public ResponseEntity<Void> liberarTrave(@PathVariable Long processoId,
                                             @PathVariable Long traveId) {
        Trave trave = traveRepo.findById(traveId)
                .orElseThrow(() -> new RuntimeException("Trave não encontrada"));

        if (trave.getProcessoAtual() == null || !trave.getProcessoAtual().getId().equals(processoId)) {
            return ResponseEntity.badRequest().build();
        }

        LocalDateTime agora = LocalDateTime.now();

        // Fechar sessão aberta desta trave neste processo (se houver)
        sessaoRepo.findByTrave_IdAndFinalizadoEmIsNull(traveId).ifPresent(sessao -> {
            sessao.setFinalizadoEm(agora);
            sessao.setDuracaoMinutos(ChronoUnit.MINUTES.between(sessao.getIniciadoEm(), agora));
            sessaoRepo.save(sessao);
        });

        trave.setEmUso(false);
        trave.setProcessoAtual(null);
        trave.setEstagioAtual(null);
        traveRepo.save(trave);

        return ResponseEntity.ok().build();
    }

    @Transactional
    @PostMapping("/{id}/trave")
    public ResponseEntity<Void> adicionarTrave(@PathVariable Long id,
                                               @RequestBody AdicionarTraveRequestDTO dto) {
        Processo processo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        Trave trave = traveRepo.findById(dto.traveId())
                .orElseThrow(() -> new RuntimeException("Trave não encontrada"));

        trave.setEmUso(true);
        trave.setProcessoAtual(processo);
        trave.setEstagioAtual(null);
        traveRepo.save(trave);

        return ResponseEntity.status(201).build();
    }
}
