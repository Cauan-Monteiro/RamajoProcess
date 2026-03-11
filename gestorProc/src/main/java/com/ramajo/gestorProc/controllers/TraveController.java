package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.dto.TraveResponseDTO;
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
    public List<Trave> listar()
    {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        return ResponseEntity.ok(repo.findById(id));
    }

    @GetMapping("/disponiveis")
    public List<TraveResponseDTO> disponiveis() {
        List<Trave> travesLivres = repo.findByEmUsoFalse();

        return travesLivres.stream()
                .map(trave -> new TraveResponseDTO(
                        trave.getId(),
                        trave.getNome()
                ))
                .toList();
    }

    @PutMapping("/uso/{id}")
    public ResponseEntity<?> changeUso(@PathVariable Long id){
        return repo.findById(id)
                .map(t -> {
                    t.setEmUso(!t.getEmUso());
                    repo.save(t);
                    return ResponseEntity.ok().build();
                })
                .orElseThrow(() -> new RuntimeException("Trave não encontrada"));
    }

    @PutMapping("/{id}")
    public Trave update(@PathVariable Long id, @RequestBody Trave atualizado){
        return repo.findById(id)
                .map(t -> {
                    t.setNome(atualizado.getNome());
                    t.setEmUso(atualizado.getEmUso());
                    return repo.save(t);
                })
                .orElseThrow(() -> new RuntimeException("Trave não encontrado"));
    }

    @PostMapping
    public Trave save(@RequestBody Trave novo){
        return repo.save(novo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
