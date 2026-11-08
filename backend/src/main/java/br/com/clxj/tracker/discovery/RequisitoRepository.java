package br.com.clxj.tracker.discovery;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequisitoRepository extends JpaRepository<Requisito, Long> {

    long countByProjetoId(Long projetoId);

    List<Requisito> findByProjetoIdOrderByTipoAscNumeroAsc(Long projetoId);

    List<Requisito> findByProjetoIdAndIdIn(Long projetoId, Collection<Long> ids);

    @Query("select coalesce(max(r.numero), 0) from Requisito r where r.projeto.id = :projetoId and r.tipo = :tipo")
    int maiorNumero(@Param("projetoId") Long projetoId, @Param("tipo") TipoRequisito tipo);

    @Query("select r.tipo, count(r) from Requisito r group by r.tipo")
    List<Object[]> contarPorTipo();

    @Query("select r.status, count(r) from Requisito r group by r.status")
    List<Object[]> contarPorStatus();
}
