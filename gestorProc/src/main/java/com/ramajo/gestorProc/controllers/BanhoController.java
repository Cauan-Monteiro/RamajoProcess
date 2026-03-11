package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.entities.Banho;
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


    @GetMapping
    public List<Banho> listar()
    {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        return ResponseEntity.ok(repo.findById(id));
    }

    @PutMapping("/{id}")
    public Banho update(@PathVariable Long id, @RequestBody Banho atualizado){
        return repo.findById(id)
                .map(b -> {
                    b.setNome(atualizado.getNome());
                    b.setDescricao(atualizado.getDescricao());
                    b.setTempoBanho(atualizado.getTempoBanho());
                    b.setEstagio(atualizado.getEstagio());
                    return repo.save(b);
                })
                .orElseThrow(() -> new RuntimeException("Banho não encontrado"));
    }

    @PostMapping
    public Banho  save(@RequestBody Banho novo){
        return repo.save(novo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
