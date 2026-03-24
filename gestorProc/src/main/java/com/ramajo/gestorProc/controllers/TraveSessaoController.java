package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.AvancarEstagioRequestDTO;
import com.ramajo.gestorProc.dto.TraveSessaoRequestDTO;
import com.ramajo.gestorProc.dto.TraveSessaoResponseDTO;
import com.ramajo.gestorProc.entities.Banho;
import com.ramajo.gestorProc.entities.Processo;
import com.ramajo.gestorProc.entities.Trave;
import com.ramajo.gestorProc.entities.TraveSessao;
import com.ramajo.gestorProc.repositories.BanhoRepository;
import com.ramajo.gestorProc.repositories.ProcessoRepository;
import com.ramajo.gestorProc.repositories.TraveSessaoRepository;
import com.ramajo.gestorProc.repositories.TraveRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/trave_sessao")
public class TraveSessaoController {

    @Autowired
    private TraveSessaoRepository sessaoRepo;
    @Autowired
    private TraveRepository traveRepo;
    @Autowired
    private ProcessoRepository processoRepo;
    @Autowired
    private BanhoRepository banhoRepo;

    @GetMapping
    public List<TraveSessao> findAll() {
        return sessaoRepo.findAll();
    }

    @Transactional
    @PostMapping
    public ResponseEntity<Void> iniciarSessao(@RequestBody TraveSessaoRequestDTO dto) {
        Processo processo = processoRepo.findById(dto.processoId())
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        Banho banho = banhoRepo.findById(dto.banhoId())
                .orElseThrow(() -> new RuntimeException("Banho não encontrado"));

        for (Long traveId : dto.traveIds()) {
            Trave trave = traveRepo.findById(traveId)
                    .orElseThrow(() -> new RuntimeException("Trave não encontrada: " + traveId));

            TraveSessao sessao = new TraveSessao(trave, processo, banho);
            sessaoRepo.save(sessao);

            // Null = trave está em sessão ativa (não está "aguardando")
            trave.setEstagioAtual(null);
            trave.setEmUso(true);
            traveRepo.save(trave);
        }

        return ResponseEntity.status(201).build();
    }

    @Transactional
    @PutMapping("/finalizar/{id}")
    public ResponseEntity<TraveSessaoResponseDTO> finalizarSessao(@PathVariable Long id) {
        TraveSessao sessao = sessaoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada"));

        LocalDateTime agora = LocalDateTime.now();
        sessao.setFinalizadoEm(agora);
        sessao.setDuracaoMinutos(ChronoUnit.MINUTES.between(sessao.getIniciadoEm(), agora));
        sessaoRepo.save(sessao);

        return ResponseEntity.ok(new TraveSessaoResponseDTO(
                sessao.getId(),
                sessao.getProcesso().getId(),
                sessao.getTrave().getId(),
                sessao.getTrave().getNome(),
                sessao.getBanho().getId(),
                sessao.getBanho().getNome(),
                sessao.getIniciadoEm(),
                sessao.getFinalizadoEm(),
                sessao.getDuracaoMinutos()
        ));
    }

    @Transactional
    @PutMapping("/{id}/avancar-estagio")
    public ResponseEntity<Void> avancarEstagio(@PathVariable Long id,
                                               @RequestBody AvancarEstagioRequestDTO dto) {
        TraveSessao sessao = sessaoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada"));

        LocalDateTime agora = LocalDateTime.now();
        sessao.setFinalizadoEm(agora);
        sessao.setDuracaoMinutos(ChronoUnit.MINUTES.between(sessao.getIniciadoEm(), agora));
        sessaoRepo.save(sessao);

        Trave trave = sessao.getTrave();
        trave.setEstagioAtual(dto.proximoEstagio());
        traveRepo.save(trave);

        return ResponseEntity.ok().build();
    }
}
