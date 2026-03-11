package com.ramajo.gestorProc.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ramajo.gestorProc.enums.Estagio;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;

@Entity
public class Banho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String descricao;
    private Float tempoBanho;

    @Enumerated(EnumType.STRING)
    private Estagio estagio;

    @JsonIgnore
    @OneToMany(mappedBy = "banho")
    private List<TraveBanho> historicoTraves;

    public Banho() {}

    public Banho(String nome, String descricao, Float tempoBanho) {
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

    public Float getTempoBanho() {
        return tempoBanho;
    }

    public void setTempoBanho(Float tempoBanho) {
        this.tempoBanho = tempoBanho;
    }

    public Estagio getEstagio() {
        return estagio;
    }

    public void setEstagio(Estagio estagio) {
        this.estagio = estagio;
    }

    public List<TraveBanho> getHistoricoTraves() {
        return historicoTraves;
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
        return "Banho{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", descricao='" + descricao + '\'' +
                ", tempoBanho=" + tempoBanho +
                '}';
    }
}
