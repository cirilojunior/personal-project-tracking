package br.com.clxj.tracker.delivery;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemTrabalhoRepository extends JpaRepository<ItemTrabalho, Long> {

    long countByProjetoIdAndStatusIn(Long projetoId, Collection<StatusItem> status);

    long countByProjetoIdAndStatus(Long projetoId, StatusItem status);

    long countByProjetoIdAndImpedidoTrue(Long projetoId);

    Optional<ItemTrabalho> findFirstByTarefaOrigemId(Long tarefaId);

    List<ItemTrabalho> findByProjetoIdAndStatusOrderByOrdemAscIdAsc(Long projetoId, StatusItem status);

    @EntityGraph(attributePaths = {"projeto", "subtarefas"})
    @Query("""
            select i from ItemTrabalho i
            where (:projetoId is null or i.projeto.id = :projetoId)
            order by i.ordem asc, i.id asc
            """)
    List<ItemTrabalho> listarParaBoard(@Param("projetoId") Long projetoId);
}
