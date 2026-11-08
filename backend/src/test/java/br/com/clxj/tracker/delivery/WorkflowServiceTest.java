package br.com.clxj.tracker.delivery;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.shared.RegraNegocioException;

class WorkflowServiceTest {

    static final Instant AGORA = Instant.parse("2026-11-08T12:00:00Z");

    WorkflowService workflow;
    ItemTrabalho item;

    @BeforeEach
    void setUp() {
        workflow = new WorkflowService(Clock.fixed(AGORA, ZoneOffset.UTC), new AgingProperties(5, 10));
        item = new ItemTrabalho(new Projeto("P", "T", dias(30)), "Item", dias(20));
        workflow.registrarCriacao(item, dias(20));
    }

    static Instant dias(int atras) {
        return AGORA.minus(Duration.ofDays(atras));
    }

    @Test
    void itemSelecionadoNaoTemAging() {
        assertThat(item.getStatus()).isEqualTo(StatusItem.SELECIONADO);
        assertThat(workflow.idadeWipDias(item)).isNull();
        assertThat(workflow.nivel(workflow.idadeWipDias(item))).isNull();
        assertThat(item.getHistorico()).hasSize(1);
    }

    @Test
    void agingComecaNaPrimeiraSaidaDeSelecionado() {
        workflow.transicionar(item, StatusItem.EM_REFINAMENTO, dias(12));
        workflow.transicionar(item, StatusItem.REFINADO, dias(8));
        workflow.transicionar(item, StatusItem.SELECIONADO, dias(6));
        workflow.transicionar(item, StatusItem.EM_REFINAMENTO, dias(4));

        assertThat(item.getInicioWip()).isEqualTo(dias(12));
        assertThat(workflow.idadeWipDias(item)).isEqualTo(12);
        assertThat(workflow.nivel(12L)).isEqualTo(NivelAging.VERMELHO);
        assertThat(workflow.diasNoStatus(item)).isEqualTo(4);
        assertThat(item.getHistorico()).hasSize(5);
    }

    @Test
    void conclusaoCongelaIdadeELimpaImpedimento() {
        workflow.transicionar(item, StatusItem.EM_IMPLEMENTACAO, dias(10));
        workflow.impedir(item, "Aguardando cliente", dias(5));
        workflow.transicionar(item, StatusItem.CONCLUIDO, dias(3));

        assertThat(workflow.idadeWipDias(item)).isEqualTo(7);
        assertThat(item.isImpedido()).isFalse();
        assertThat(item.getConcluidoEm()).isEqualTo(dias(3));

        workflow.transicionar(item, StatusItem.EM_TESTES, dias(1));
        assertThat(item.getConcluidoEm()).isNull();
        assertThat(workflow.idadeWipDias(item)).isEqualTo(10);
    }

    @Test
    void mesmaColunaNaoGeraHistorico() {
        workflow.transicionar(item, StatusItem.SELECIONADO, dias(1));
        assertThat(item.getHistorico()).hasSize(1);
    }

    @Test
    void faixasDeAging() {
        assertThat(workflow.nivel(0L)).isEqualTo(NivelAging.VERDE);
        assertThat(workflow.nivel(4L)).isEqualTo(NivelAging.VERDE);
        assertThat(workflow.nivel(5L)).isEqualTo(NivelAging.AMARELO);
        assertThat(workflow.nivel(10L)).isEqualTo(NivelAging.AMARELO);
        assertThat(workflow.nivel(11L)).isEqualTo(NivelAging.VERMELHO);
    }

    @Test
    void impedimentoPreservaDataOriginalAoAtualizarMotivo() {
        workflow.impedir(item, "Motivo 1", dias(4));
        workflow.impedir(item, "Motivo 2", dias(1));

        assertThat(item.getImpedidoDesde()).isEqualTo(dias(4));
        assertThat(item.getMotivoImpedimento()).isEqualTo("Motivo 2");
        assertThat(workflow.diasImpedido(item)).isEqualTo(4);

        workflow.desimpedir(item);
        assertThat(item.isImpedido()).isFalse();
        assertThat(workflow.diasImpedido(item)).isNull();
    }

    @Test
    void naoPermiteImpedirItemConcluido() {
        workflow.transicionar(item, StatusItem.CONCLUIDO, dias(1));
        assertThatThrownBy(() -> workflow.impedir(item, "x"))
                .isInstanceOf(RegraNegocioException.class);
    }
}
