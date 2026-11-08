package br.com.clxj.tracker.discovery;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarefaDiscoveryRepository extends JpaRepository<TarefaDiscovery, Long> {

    long countByProjetoId(Long projetoId);

    @EntityGraph(attributePaths = "requisitos")
    List<TarefaDiscovery> findByProjetoIdOrderByCriadoEmAsc(Long projetoId);
}
