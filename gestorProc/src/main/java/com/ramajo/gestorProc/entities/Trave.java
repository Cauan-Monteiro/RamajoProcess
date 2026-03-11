package com.ramajo.gestorProc.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;

@Entity
public class Trave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Boolean emUso;

    @JsonIgnore
    @OneToMany(mappedBy = "trave")
    private List<TraveBanho> historicoBanhos;

    public Trave () {}
    public Trave(String nome) {
        this.nome = nome;
        this.emUso = false;
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

    public Boolean getEmUso() {
        return emUso;
    }

    public void setEmUso(Boolean emUso) {
        this.emUso = emUso;
    }

    public List<TraveBanho> getHistoricoBanhos() {
        return historicoBanhos;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Trave trave = (Trave) o;
        return Objects.equals(id, trave.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Trave{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", emUso=" + emUso +
                '}';
    }
}