package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.AdicionarTraveRequestDTO;
import com.ramajo.gestorProc.dto.ProcessoRequestDTO;
import com.ramajo.gestorProc.dto.ProcessoResponseDTO;
import com.ramajo.gestorProc.dto.TraveEstadoDTO;
import com.ramajo.gestorProc.dto.TraveBanhoHistoricoDTO;
import com.ramajo.gestorProc.entities.Processo;
import com.ramajo.gestorProc.entities.Trave;
import com.ramajo.gestorProc.entities.TraveBanho;
import com.ramajo.gestorProc.repositories.ProcessoRepository;
import com.ramajo.gestorProc.repositories.TraveBanhoRepository;
import com.ramajo.gestorProc.repositories.TraveRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/processo")
public class ProcessoController {

    @Autowired
    private ProcessoRepository repo;
    @Autowired
    private TraveRepository traveRepo;
    @Autowired
    private TraveBanhoRepository traveBanhoRepo;

    @GetMapping
    public List<Processo> findAll(){
        return repo.findAll();
    }

    @GetMapping("/ativo")
    public List<ProcessoResponseDTO> findAllAtivos() {
        List<Processo> processosAtivos = repo.findByFinishedAtIsNull();

        return processosAtivos.stream()
                .map(processo -> {
                    List<String> nomes = processo.getHistoricoBanhos().stream()
                            .map(tb -> tb.getTrave().getNome())
                            .distinct()
                            .toList();

                    return new ProcessoResponseDTO(
                            processo.getId(),
                            processo.getNumOS(),
                            processo.getCreatedAt(),
                            null,
                            null,
                            nomes
                    );
                })
                .toList();
    }

    @GetMapping("/inativo")
    public List<ProcessoResponseDTO> findInativos() {
        List<Processo> processosInativos = repo.findByFinishedAtIsNotNull();

        return processosInativos.stream()
                .map(processo -> {
                    List<String> nomes = processo.getHistoricoBanhos().stream()
                            .map(tb -> tb.getTrave().getNome())
                            .distinct()
                            .toList();

                    long minutos = ChronoUnit.MINUTES.between(
                            processo.getCreatedAt().toInstant(),
                            processo.getFinishedAt().toInstant()
                    );

                    return new ProcessoResponseDTO(
                            processo.getId(),
                            processo.getNumOS(),
                            processo.getCreatedAt(),
                            processo.getFinishedAt(),
                            minutos,
                            nomes
                    );
                })
                .toList();
    }

    // Retorna o estado atual de cada trave do processo (em qual banho está, desde quando)
    @GetMapping("/{id}/traves")
    public ResponseEntity<List<TraveEstadoDTO>> getTraveEstado(@PathVariable Long id) {
        repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        List<TraveBanho> links = traveBanhoRepo.findByProcesso_IdAndBanhoIsNull(id);
        List<TraveBanho> sessoeAtivas = traveBanhoRepo.findByProcesso_IdAndBanhoIsNotNullAndFinishedAtIsNull(id);

        List<TraveEstadoDTO> resultado = links.stream().map(link -> {
            Trave trave = link.getTrave();

            TraveBanho sessaoAtiva = sessoeAtivas.stream()
                    .filter(tb -> tb.getTrave().getId().equals(trave.getId()))
                    .findFirst()
                    .orElse(null);

            if (sessaoAtiva != null) {
                return new TraveEstadoDTO(
                        trave.getId(),
                        trave.getNome(),
                        true,
                        sessaoAtiva.getId(),
                        sessaoAtiva.getBanho().getId(),
                        sessaoAtiva.getBanho().getNome(),
                        sessaoAtiva.getBanho().getTempoBanho(),
                        sessaoAtiva.getBanho().getEstagio(),
                        sessaoAtiva.getIniciadoEm(),
                        null
                );
            } else {
                return new TraveEstadoDTO(
                        trave.getId(),
                        trave.getNome(),
                        false,
                        null, null, null, null, null, null,
                        link.getEstagioAguardando()
                );
            }
        }).toList();

        return ResponseEntity.ok(resultado);
    }

    // Retorna o histórico completo de sessões de banho de um processo
    @GetMapping("/{id}/historico")
    public ResponseEntity<List<TraveBanhoHistoricoDTO>> getHistorico(@PathVariable Long id) {
        repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        List<TraveBanho> sessoes = traveBanhoRepo.findByProcesso_IdAndBanhoIsNotNullOrderByCreatedAtAsc(id);

        List<TraveBanhoHistoricoDTO> resultado = sessoes.stream().map(tb -> {
            Long duracao = null;
            if (tb.getFinishedAt() != null) {
                java.time.Instant inicio = tb.getIniciadoEm() != null
                        ? tb.getIniciadoEm().toInstant()
                        : tb.getCreatedAt().toInstant();
                duracao = ChronoUnit.MINUTES.between(inicio, tb.getFinishedAt().toInstant());
            }
            return new TraveBanhoHistoricoDTO(
                    tb.getId(),
                    tb.getTrave().getId(),
                    tb.getTrave().getNome(),
                    tb.getBanho().getId(),
                    tb.getBanho().getNome(),
                    tb.getBanho().getTempoBanho(),
                    tb.getBanho().getEstagio(),
                    tb.getIniciadoEm(),
                    tb.getFinishedAt(),
                    duracao
            );
        }).toList();

        return ResponseEntity.ok(resultado);
    }

    @Transactional
    @PutMapping("/finalizar/{id}")
    public ResponseEntity<ProcessoResponseDTO> finalizarProcesso(@PathVariable Long id) {
        Processo registro = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de processo não encontrado"));

        registro.setFinishedAt(new Date());

        // Fechar todas as sessões de banho ainda abertas
        registro.getHistoricoBanhos().stream()
                .filter(tb -> tb.getBanho() != null && tb.getFinishedAt() == null)
                .forEach(tb -> {
                    tb.setFinishedAt(new Date());
                    traveBanhoRepo.save(tb);
                });

        long minutos = ChronoUnit.MINUTES.between(
                registro.getCreatedAt().toInstant(),
                registro.getFinishedAt().toInstant()
        );

        ProcessoResponseDTO response = new ProcessoResponseDTO(
                registro.getId(),
                registro.getNumOS(),
                registro.getCreatedAt(),
                registro.getFinishedAt(),
                minutos,
                null
        );

        // Liberar todas as traves do processo
        registro.getHistoricoBanhos().stream()
                .filter(tb -> tb.getBanho() == null)
                .forEach(tb -> {
                    Trave t = tb.getTrave();
                    t.setEmUso(false);
                    traveRepo.save(t);
                });

        repo.save(registro);

        return ResponseEntity.ok(response);
    }

    @Transactional
    @PostMapping("/{id}/trave")
    public ResponseEntity<Void> adicionarTrave(@PathVariable Long id, @RequestBody AdicionarTraveRequestDTO dto) {
        Processo processo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        Trave trave = traveRepo.findById(dto.traveId())
                .orElseThrow(() -> new RuntimeException("Trave não encontrada"));

        trave.setEmUso(true);
        traveRepo.save(trave);

        TraveBanho vinculo = new TraveBanho(processo, trave, null);
        traveBanhoRepo.save(vinculo);

        return ResponseEntity.status(201).build();
    }

    @Transactional
    @PostMapping
    public ResponseEntity<Processo> criar(@RequestBody ProcessoRequestDTO dto) {
        Processo novo = new Processo(dto.numOS());
        novo.setCreatedAt(new Date());
        Processo salvo = repo.save(novo);

        for (Long traveId : dto.idsTraves()) {
            Trave trave = traveRepo.findById(traveId)
                    .orElseThrow(() -> new RuntimeException("Trave não encontrada: " + traveId));

            trave.setEmUso(true);

            TraveBanho vinculo = new TraveBanho(salvo, trave, null);
            traveBanhoRepo.save(vinculo);
            traveRepo.save(trave);
        }
        return ResponseEntity.ok(novo);
    }
}
