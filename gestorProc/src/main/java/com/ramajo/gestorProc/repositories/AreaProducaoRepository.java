package com.ramajo.gestorProc.repositories;

import com.ramajo.gestorProc.entities.AreaProducao;
import com.ramajo.gestorProc.enums.Estagio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AreaProducaoRepository extends JpaRepository<AreaProducao, Long> {
    Optional<AreaProducao> findByNome(Estagio nome);
}
