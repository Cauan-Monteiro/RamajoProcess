package com.ramajo.gestorProc.repositories;

import com.ramajo.gestorProc.entities.Processo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProcessoRepository extends JpaRepository<Processo, Long> {
    List<Processo> findByFinishedAtIsNull();

    List<Processo> findByFinishedAtIsNotNull();

    List<Processo> findByFinishedAtBetween(LocalDateTime from, LocalDateTime to);
}
