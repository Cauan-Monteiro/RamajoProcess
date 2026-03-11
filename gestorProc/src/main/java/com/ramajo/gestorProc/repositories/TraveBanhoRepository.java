package com.ramajo.gestorProc.repositories;

import com.ramajo.gestorProc.entities.TraveBanho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraveBanhoRepository extends JpaRepository<TraveBanho, Long> {
    List<TraveBanho> findByProcesso_IdAndBanhoIsNull(Long processoId);
    List<TraveBanho> findByProcesso_IdAndBanhoIsNotNullAndFinishedAtIsNull(Long processoId);
    List<TraveBanho> findByProcesso_IdAndBanhoIsNotNullOrderByCreatedAtAsc(Long processoId);
    Optional<TraveBanho> findFirstByProcesso_IdAndTrave_IdAndBanhoIsNull(Long processoId, Long traveId);
}
