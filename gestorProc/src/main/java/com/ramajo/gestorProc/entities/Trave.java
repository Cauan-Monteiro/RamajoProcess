package com.ramajo.gestorProc.entities;

import com.ramajo.gestorProc.enums.Estagio;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Trave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Boolean emUso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Estagio estagioAtual;

    @ManyToOne
    @JoinColumn(name = "processo_atual_id", nullable = true)
    private Processo processoAtual;

    public Trave() {}

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

    public Estagio getEstagioAtual() {
        return estagioAtual;
    }

    public void setEstagioAtual(Estagio estagioAtual) {
        this.estagioAtual = estagioAtual;
    }

    public Processo getProcessoAtual() {
        return processoAtual;
    }

    public void setProcessoAtual(Processo processoAtual) {
        this.processoAtual = processoAtual;
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
        return "Trave{id=" + id + ", nome='" + nome + "', emUso=" + emUso + ", estagioAtual=" + estagioAtual + '}';
    }
}
