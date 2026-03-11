package com.ramajo.gestorProc.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Entity
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numOS;

    @OneToMany(mappedBy = "processo")
    private List<TraveBanho> historicoBanhos;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date finishedAt;

    public Processo() {}

    public Processo(String numOS) {
        this.numOS = numOS;
        this.createdAt = new Date();
        this.finishedAt = null;
    }

    public Long getId() {
        return id;
    }

    public String getNumOS() {
        return numOS;
    }

    public void setNumOS(String numOS) {
        this.numOS = numOS;
    }

    public List<TraveBanho> getHistoricoBanhos() {
        return historicoBanhos;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Date finishedAt) {
        this.finishedAt = finishedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Processo processo = (Processo) o;
        return Objects.equals(id, processo.id) && Objects.equals(numOS, processo.numOS);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, numOS);
    }

    @Override
    public String toString() {
        return "Processo{" +
                "id=" + id +
                ", numOS='" + numOS + '\'' +
                ", createdAt=" + createdAt +
                ", finishedAt=" + finishedAt +
                '}';
    }
}