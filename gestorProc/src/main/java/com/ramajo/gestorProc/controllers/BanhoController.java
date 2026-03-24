package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.BanhoRequestDTO;
import com.ramajo.gestorProc.entities.AreaProducao;
import com.ramajo.gestorProc.entities.Banho;
import com.ramajo.gestorProc.enums.Estagio;
import com.ramajo.gestorProc.repositories.AreaProducaoRepository;
import com.ramajo.gestorProc.repositories.BanhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banho")
public class BanhoController {

    @Autowired
    private BanhoRepository repo;
    @Autowired
    private AreaProducaoRepository areaRepo;

    @GetMapping
    public List<Banho> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @GetMapping("/por-area/{estagio}")
    public List<Banho> porArea(@PathVariable String estagio) {
        return repo.findByAreas_Nome(Estagio.valueOf(estagio));
    }

    @PostMapping
    public ResponseEntity<Banho> save(@RequestBody BanhoRequestDTO dto) {
        Banho novo = new Banho(dto.nome(), dto.descricao(), dto.tempoBanho());

        if (dto.areaIds() != null && !dto.areaIds().isEmpty()) {
            List<AreaProducao> areas = dto.areaIds().stream()
                    .map(areaId -> areaRepo.findById(areaId)
                            .orElseThrow(() -> new RuntimeException("Área não encontrada: " + areaId)))
                    .toList();
            novo.setAreas(areas);
        }

        return ResponseEntity.status(201).body(repo.save(novo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banho> update(@PathVariable Long id, @RequestBody BanhoRequestDTO dto) {
        Banho banho = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Banho não encontrado"));

        banho.setNome(dto.nome());
        banho.setDescricao(dto.descricao());
        banho.setTempoBanho(dto.tempoBanho());

        if (dto.areaIds() != null) {
            List<AreaProducao> areas = dto.areaIds().stream()
                    .map(areaId -> areaRepo.findById(areaId)
                            .orElseThrow(() -> new RuntimeException("Área não encontrada: " + areaId)))
                    .toList();
            banho.setAreas(areas);
        }

        return ResponseEntity.ok(repo.save(banho));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
