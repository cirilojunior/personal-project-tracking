package br.com.clxj.tracker.projeto;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    long countByClienteId(Long clienteId);

    @EntityGraph(attributePaths = "cliente")
    @Query("""
            select p from Projeto p
            where (:status is null or p.status = :status)
              and (:clienteId is null or p.cliente.id = :clienteId)
            order by p.criadoEm desc
            """)
    List<Projeto> filtrar(@Param("status") StatusProjeto status, @Param("clienteId") Long clienteId);

    @EntityGraph(attributePaths = "cliente")
    List<Projeto> findAllByOrderByNomeAsc();
}
