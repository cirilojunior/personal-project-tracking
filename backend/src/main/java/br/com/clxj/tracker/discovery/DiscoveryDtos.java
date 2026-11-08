package br.com.clxj.tracker.discovery;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import br.com.clxj.tracker.delivery.StatusItem;
import br.com.clxj.tracker.shared.Prioridade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class DiscoveryDtos {

    private DiscoveryDtos() {
    }

    public record RequisitoRequest(
            @NotBlank(message = "Título é obrigatório") @Size(max = 200, message = "Título deve ter até 200 caracteres") String titulo,
            @Size(max = 4000, message = "Descrição deve ter até 4000 caracteres") String descricao,
            @NotNull(message = "Tipo é obrigatório") TipoRequisito tipo,
            CategoriaNfr categoriaNfr,
            PrioridadeMoscow prioridade,
            StatusRequisito status) {
    }

    public record RequisitoResponse(Long id, Long projetoId, String codigo, String titulo, String descricao,
            TipoRequisito tipo, CategoriaNfr categoriaNfr, PrioridadeMoscow prioridade, StatusRequisito status,
            Instant criadoEm) {

        static RequisitoResponse de(Requisito r) {
            return new RequisitoResponse(r.getId(), r.getProjeto().getId(), r.getCodigo(), r.getTitulo(),
                    r.getDescricao(), r.getTipo(), r.getCategoriaNfr(), r.getPrioridade(), r.getStatus(),
                    r.getCriadoEm());
        }
    }

    public record RequisitoRef(Long id, String codigo, String titulo) {
    }

    public record TarefaRequest(
            @NotBlank(message = "Título é obrigatório") @Size(max = 200, message = "Título deve ter até 200 caracteres") String titulo,
            @Size(max = 4000, message = "Descrição deve ter até 4000 caracteres") String descricao,
            Prioridade prioridade,
            StatusTarefa status,
            Set<Long> requisitoIds) {
    }

    public record ItemVinculado(Long id, StatusItem status) {
    }

    public record TarefaResponse(Long id, Long projetoId, String titulo, String descricao, Prioridade prioridade,
            StatusTarefa status, List<RequisitoRef> requisitos, ItemVinculado itemTrabalho, Instant criadoEm) {

        static TarefaResponse de(TarefaDiscovery t, ItemVinculado item) {
            var reqs = t.getRequisitos().stream()
                    .sorted(Comparator.comparing(Requisito::getTipo).thenComparing(Requisito::getNumero))
                    .map(r -> new RequisitoRef(r.getId(), r.getCodigo(), r.getTitulo()))
                    .toList();
            return new TarefaResponse(t.getId(), t.getProjeto().getId(), t.getTitulo(), t.getDescricao(),
                    t.getPrioridade(), t.getStatus(), reqs, item, t.getCriadoEm());
        }
    }
}
