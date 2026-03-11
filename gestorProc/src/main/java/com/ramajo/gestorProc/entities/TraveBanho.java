package com.ramajo.gestorProc.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ramajo.gestorProc.enums.Estagio;
import jakarta.persistence.*;
import java.util.Date;

@Entity
public class TraveBanho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "processo_id")
    private Processo processo;

    @ManyToOne
    @JoinColumn(name = "trave_id")
    private Trave trave;

    @ManyToOne
    @JoinColumn(name = "banho_id")
    private Banho banho;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date iniciadoEm;

    @Temporal(TemporalType.TIMESTAMP)
    private Date finishedAt;

    @Enumerated(EnumType.STRING)
    private Estagio estagioAguardando;

    public TraveBanho() {}

    public TraveBanho(Processo processo, Trave trave, Banho banho) {
        this.processo = processo;
        this.trave = trave;
        this.banho = banho;
        this.createdAt = new Date();
        this.iniciadoEm = new Date();
        this.finishedAt = null;
    }

    public Long getId() {
        return id;
    }

    public Processo getProcesso() {
        return processo;
    }

    public void setProcesso(Processo processo) {
        this.processo = processo;
    }

    public Trave getTrave() {
        return trave;
    }

    public void setTrave(Trave trave) {
        this.trave = trave;
    }

    public Banho getBanho() {
        return banho;
    }

    public void setBanho(Banho banho) {
        this.banho = banho;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getIniciadoEm() {
        return iniciadoEm;
    }

    public void setIniciadoEm(Date iniciadoEm) {
        this.iniciadoEm = iniciadoEm;
    }

    public Date getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Date finishedAt) {
        this.finishedAt = finishedAt;
    }

    public Estagio getEstagioAguardando() {
        return estagioAguardando;
    }

    public void setEstagioAguardando(Estagio estagioAguardando) {
        this.estagioAguardando = estagioAguardando;
    }
}
