package com.ramajo.gestorProc.repositories;

import com.ramajo.gestorProc.entities.Processo;
import com.ramajo.gestorProc.entities.Trave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TraveRepository extends JpaRepository<Trave, Long> {
    List<Trave> findByEmUsoFalse();
    List<Trave> findByProcessoAtual(Processo processo);
    List<Trave> findByProcessoAtual_Id(Long processoId);
}
