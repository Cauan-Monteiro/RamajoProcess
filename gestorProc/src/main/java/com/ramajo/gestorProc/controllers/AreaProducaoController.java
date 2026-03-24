package com.ramajo.gestorProc.controllers;

import com.ramajo.gestorProc.entities.AreaProducao;
import com.ramajo.gestorProc.repositories.AreaProducaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/area")
public class AreaProducaoController {

    @Autowired
    private AreaProducaoRepository repo;

    @GetMapping
    public List<AreaProducao> listar() {
        return repo.findAll();
    }
}
