package com.ramajo.gestorProc.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ramajo.gestorProc.enums.Estagio;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "area_producao")
public class AreaProducao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Estagio nome;

    @JsonIgnore
    @ManyToMany(mappedBy = "areas")
    private List<Banho> banhos = new ArrayList<>();

    public AreaProducao() {}

    public AreaProducao(Estagio nome) {
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public Estagio getNome() {
        return nome;
    }

    public void setNome(Estagio nome) {
        this.nome = nome;
    }

    public List<Banho> getBanhos() {
        return banhos;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        AreaProducao that = (AreaProducao) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "AreaProducao{id=" + id + ", nome=" + nome + '}';
    }
}
