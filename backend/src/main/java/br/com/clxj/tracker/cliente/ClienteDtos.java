package br.com.clxj.tracker.cliente;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ClienteDtos {

    private ClienteDtos() {
    }

    public record ClienteRequest(
            @NotBlank(message = "Nome é obrigatório") @Size(max = 150, message = "Nome deve ter até 150 caracteres") String nome,
            @Size(max = 150, message = "Empresa deve ter até 150 caracteres") String empresa,
            @Email(message = "E-mail inválido") @Size(max = 150) String email,
            @Size(max = 40, message = "Telefone deve ter até 40 caracteres") String telefone,
            @Size(max = 4000, message = "Observações devem ter até 4000 caracteres") String observacoes) {
    }

    public record ClienteResponse(Long id, String nome, String empresa, String email, String telefone,
            String observacoes, Instant criadoEm, long totalProjetos) {

        static ClienteResponse de(Cliente c, long totalProjetos) {
            return new ClienteResponse(c.getId(), c.getNome(), c.getEmpresa(), c.getEmail(), c.getTelefone(),
                    c.getObservacoes(), c.getCriadoEm(), totalProjetos);
        }
    }
}
