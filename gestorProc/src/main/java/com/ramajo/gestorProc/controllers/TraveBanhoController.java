package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.AvancarEstagioRequestDTO;
import com.ramajo.gestorProc.dto.TraveBanhoRequestDTO;
import com.ramajo.gestorProc.dto.TraveBanhoResponseDTO;
import com.ramajo.gestorProc.entities.Banho;
import com.ramajo.gestorProc.entities.Processo;
import com.ramajo.gestorProc.entities.Trave;
import com.ramajo.gestorProc.entities.TraveBanho;
import com.ramajo.gestorProc.repositories.BanhoRepository;
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
@RequestMapping("/api/trave_banho")
public class TraveBanhoController {
    @Autowired
    private BanhoRepository banhoRepo;
    @Autowired
    private TraveBanhoRepository traveBanhoRepo;
    @Autowired
    private TraveRepository traveRepo;
    @Autowired
    private ProcessoRepository processoRepo;


    @GetMapping
    public List<TraveBanho> findAll(){
        return traveBanhoRepo.findAll();
    }

    @Transactional
    @PutMapping("/finalizar/{id}")
    public ResponseEntity<TraveBanhoResponseDTO> finalizarBanho(@PathVariable Long id) {
        TraveBanho registro = traveBanhoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de banho não encontrado"));

        registro.setFinishedAt(new Date());

        java.time.Instant inicio = registro.getIniciadoEm() != null
                ? registro.getIniciadoEm().toInstant()
                : registro.getCreatedAt().toInstant();
        long minutos = ChronoUnit.MINUTES.between(inicio, registro.getFinishedAt().toInstant());

        TraveBanhoResponseDTO response = new TraveBanhoResponseDTO(
                registro.getId(),
                registro.getProcesso().getId(),
                registro.getTrave().getId(),
                registro.getBanho().getId(),
                minutos
        );

        traveBanhoRepo.save(registro);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> iniciarBanho(@RequestBody TraveBanhoRequestDTO dto) {
        Processo processo = processoRepo.findById(dto.processoId())
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));

        Banho banho = banhoRepo.findById(dto.banhoId())
                .orElseThrow(() -> new RuntimeException("Banho não encontrado"));

        for (Long id : dto.traveId()) {
            Trave trave = traveRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Trave não encontrada: " + id));

            TraveBanho novoRegistro = new TraveBanho(processo, trave, banho);
            traveBanhoRepo.save(novoRegistro);

            trave.setEmUso(true);
            traveRepo.save(trave);

            // Clear estagioAguardando on the root link
            traveBanhoRepo
                    .findFirstByProcesso_IdAndTrave_IdAndBanhoIsNull(dto.processoId(), id)
                    .ifPresent(root -> {
                        root.setEstagioAguardando(null);
                        traveBanhoRepo.save(root);
                    });
        }

        return ResponseEntity.status(201).build();
    }

    @Transactional
    @PutMapping("/{id}/avancar-estagio")
    public ResponseEntity<Void> avancarEstagio(@PathVariable Long id, @RequestBody AvancarEstagioRequestDTO dto) {
        TraveBanho registro = traveBanhoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        registro.setFinishedAt(new Date());
        traveBanhoRepo.save(registro);

        traveBanhoRepo
                .findFirstByProcesso_IdAndTrave_IdAndBanhoIsNull(
                        registro.getProcesso().getId(),
                        registro.getTrave().getId())
                .ifPresent(root -> {
                    root.setEstagioAguardando(dto.proximoEstagio());
                    traveBanhoRepo.save(root);
                });

        return ResponseEntity.ok().build();
    }
}
