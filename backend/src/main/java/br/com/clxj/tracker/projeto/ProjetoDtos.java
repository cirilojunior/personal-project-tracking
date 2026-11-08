package br.com.clxj.tracker.projeto;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProjetoDtos {

    private ProjetoDtos() {
    }

    public record ProjetoRequest(
            @NotBlank(message = "Nome é obrigatório") @Size(max = 150, message = "Nome deve ter até 150 caracteres") String nome,
            @NotBlank(message = "Tema/área de negócio é obrigatório") @Size(max = 150, message = "Tema deve ter até 150 caracteres") String tema,
            @Size(max = 4000, message = "Descrição deve ter até 4000 caracteres") String descricao,
            Long clienteId,
            StatusProjeto status,
            LocalDate dataInicio) {
    }

    public record Contagens(long requisitos, long tarefas, long itensWip, long itensConcluidos, long itensImpedidos) {
    }

    public record ProjetoResponse(Long id, String nome, String tema, String descricao, Long clienteId,
            String clienteNome, StatusProjeto status, LocalDate dataInicio, Instant criadoEm, Contagens contagens) {

        public static ProjetoResponse de(Projeto p, Contagens contagens) {
            var c = p.getCliente();
            return new ProjetoResponse(p.getId(), p.getNome(), p.getTema(), p.getDescricao(),
                    c == null ? null : c.getId(), c == null ? null : c.getNome(), p.getStatus(),
                    p.getDataInicio(), p.getCriadoEm(), contagens);
        }
    }
}
