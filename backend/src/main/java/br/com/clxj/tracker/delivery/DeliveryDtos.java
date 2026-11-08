package br.com.clxj.tracker.delivery;

import java.time.Instant;
import java.util.List;

import br.com.clxj.tracker.shared.Prioridade;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class DeliveryDtos {

    private DeliveryDtos() {
    }

    public record ItemRequest(
            @NotBlank(message = "Título é obrigatório") @Size(max = 200, message = "Título deve ter até 200 caracteres") String titulo,
            @Size(max = 4000, message = "Descrição deve ter até 4000 caracteres") String descricao,
            Prioridade prioridade) {
    }

    /** Move o item para {@code status}, na posição {@code ordem} (0 = topo); sem ordem vai para o fim da coluna. */
    public record MoverRequest(@NotNull(message = "Status é obrigatório") StatusItem status,
            @Min(value = 0, message = "Ordem deve ser maior ou igual a zero") Integer ordem) {
    }

    public record ImpedimentoRequest(@Size(max = 1000, message = "Motivo deve ter até 1000 caracteres") String motivo) {
    }

    public record SubtarefaRequest(
            @NotBlank(message = "Título é obrigatório") @Size(max = 200, message = "Título deve ter até 200 caracteres") String titulo,
            Boolean concluida) {
    }

    public record SubtarefaDto(Long id, String titulo, boolean concluida, int ordem) {
    }

    public record HistoricoDto(StatusItem statusAnterior, StatusItem statusNovo, Instant ocorridoEm) {
    }

    public record ItemResumo(Long id, Long projetoId, String projetoNome, String titulo, Prioridade prioridade,
            StatusItem status, int ordem, boolean impedido, String motivoImpedimento, Long diasImpedido,
            Long idadeWipDias, NivelAging nivelAging, long diasNoStatus, int subtarefasTotal,
            int subtarefasConcluidas, Long tarefaOrigemId) {
    }

    public record ItemDetalhe(Long id, Long projetoId, String projetoNome, String titulo, String descricao,
            Prioridade prioridade, StatusItem status, int ordem, boolean impedido, String motivoImpedimento,
            Instant impedidoDesde, Long diasImpedido, Instant inicioWip, Instant concluidoEm, Instant statusDesde,
            Long idadeWipDias, NivelAging nivelAging, long diasNoStatus, Long tarefaOrigemId, Instant criadoEm,
            List<SubtarefaDto> subtarefas, List<HistoricoDto> historico) {
    }

    public record Coluna(StatusItem status, int total, int impedidos, List<ItemResumo> itens) {
    }

    public record Board(Long projetoId, AgingProperties limitesAging, List<Coluna> colunas) {
    }
}
