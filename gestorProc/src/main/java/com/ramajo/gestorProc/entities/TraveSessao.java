package com.ramajo.gestorProc.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "trave_sessao")
public class TraveSessao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trave_id", nullable = false)
    private Trave trave;

    @ManyToOne
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @ManyToOne
    @JoinColumn(name = "banho_id", nullable = false)
    private Banho banho;

    private LocalDateTime iniciadoEm;
    private LocalDateTime finalizadoEm;

    // Gravado na finalização; null enquanto a sessão está ativa
    private Long duracaoMinutos;

    public TraveSessao() {}

    public TraveSessao(Trave trave, Processo processo, Banho banho) {
        this.trave = trave;
        this.processo = processo;
        this.banho = banho;
        this.iniciadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Trave getTrave() {
        return trave;
    }

    public void setTrave(Trave trave) {
        this.trave = trave;
    }

    public Processo getProcesso() {
        return processo;
    }

    public void setProcesso(Processo processo) {
        this.processo = processo;
    }

    public Banho getBanho() {
        return banho;
    }

    public void setBanho(Banho banho) {
        this.banho = banho;
    }

    public LocalDateTime getIniciadoEm() {
        return iniciadoEm;
    }

    public void setIniciadoEm(LocalDateTime iniciadoEm) {
        this.iniciadoEm = iniciadoEm;
    }

    public LocalDateTime getFinalizadoEm() {
        return finalizadoEm;
    }

    public void setFinalizadoEm(LocalDateTime finalizadoEm) {
        this.finalizadoEm = finalizadoEm;
    }

    public Long getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public void setDuracaoMinutos(Long duracaoMinutos) {
        this.duracaoMinutos = duracaoMinutos;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        TraveSessao that = (TraveSessao) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TraveSessao{id=" + id + ", trave=" + trave.getId() + ", banho=" + banho.getId() + ", iniciadoEm=" + iniciadoEm + '}';
    }
}
