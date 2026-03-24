package com.ramajo.gestorProc.repositories;

import com.ramajo.gestorProc.entities.TraveSessao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraveSessaoRepository extends JpaRepository<TraveSessao, Long> {

    Optional<TraveSessao> findByTrave_IdAndFinalizadoEmIsNull(Long traveId);

    List<TraveSessao> findByProcesso_IdAndFinalizadoEmIsNull(Long processoId);

    List<TraveSessao> findByProcesso_IdOrderByIniciadoEmAsc(Long processoId);

    List<TraveSessao> findByTrave_IdAndProcesso_Id(Long traveId, Long processoId);
}
