package com.ramajo.gestorProc.repositories;

import com.ramajo.gestorProc.entities.Banho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BanhoRepository extends JpaRepository<Banho, Long> {
}
