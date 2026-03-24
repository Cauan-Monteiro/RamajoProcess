package com.ramajo.gestorProc.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
public class Banho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String descricao;
    private Integer tempoBanho;

    @ManyToMany
    @JoinTable(
        name = "banho_area_producao",
        joinColumns = @JoinColumn(name = "banho_id"),
        inverseJoinColumns = @JoinColumn(name = "area_producao_id")
    )
    private List<AreaProducao> areas = new ArrayList<>();

    public Banho() {}

    public Banho(String nome, String descricao, Integer tempoBanho) {
        this.nome = nome;
        this.descricao = descricao;
        this.tempoBanho = tempoBanho;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getTempoBanho() {
        return tempoBanho;
    }

    public void setTempoBanho(Integer tempoBanho) {
        this.tempoBanho = tempoBanho;
    }

    public List<AreaProducao> getAreas() {
        return areas;
    }

    public void setAreas(List<AreaProducao> areas) {
        this.areas = areas;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Banho banho = (Banho) o;
        return Objects.equals(id, banho.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Banho{id=" + id + ", nome='" + nome + "', tempoBanho=" + tempoBanho + '}';
    }
}
