package com.ramajo.gestorProc.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numOS;

    private LocalDateTime createdAt;
    private LocalDateTime finishedAt;

    public Processo() {}

    public Processo(String numOS) {
        this.numOS = numOS;
        this.createdAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Processo processo = (Processo) o;
        return Objects.equals(id, processo.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Processo{id=" + id + ", numOS='" + numOS + "', createdAt=" + createdAt + '}';
    }
}
