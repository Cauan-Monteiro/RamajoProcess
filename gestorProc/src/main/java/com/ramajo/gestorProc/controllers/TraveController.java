package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.TraveResponseDTO;
import com.ramajo.gestorProc.dto.TraveUpdateRequestDTO;
import com.ramajo.gestorProc.entities.Trave;
import com.ramajo.gestorProc.repositories.TraveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trave")
public class TraveController {

    @Autowired
    private TraveRepository repo;

    @GetMapping
    public List<TraveResponseDTO> listar() {
        return repo.findAll().stream()
                .map(t -> new TraveResponseDTO(
                        t.getId(), t.getNome(), t.getEmUso(),
                        t.getEstagioAtual(),
                        t.getProcessoAtual() != null ? t.getProcessoAtual().getId() : null))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @GetMapping("/disponiveis")
    public List<TraveResponseDTO> disponiveis() {
        return repo.findByEmUsoFalse().stream()
                .map(t -> new TraveResponseDTO(
                        t.getId(), t.getNome(), false, null, null))
                .toList();
    }

    @PostMapping
    public Trave save(@RequestBody Trave novo) {
        return repo.save(novo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trave> update(@PathVariable Long id,
                                        @RequestBody TraveUpdateRequestDTO dto) {
        return repo.findById(id)
                .map(t -> {
                    t.setNome(dto.nome());
                    return ResponseEntity.ok(repo.save(t));
                })
                .orElseThrow(() -> new RuntimeException("Trave não encontrada"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Trave trave = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Trave não encontrada"));

        if (Boolean.TRUE.equals(trave.getEmUso())) {
            return ResponseEntity.status(409).build();
        }

        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
