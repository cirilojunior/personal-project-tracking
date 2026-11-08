package br.com.clxj.tracker.delivery;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.springframework.stereotype.Service;

import br.com.clxj.tracker.shared.RegraNegocioException;

/**
 * Regras do fluxo de Delivery: transições de status (com histórico), impedimentos e Aging WIP.
 *
 * <p>Aging WIP: o relógio começa na primeira saída de {@link StatusItem#SELECIONADO} (ponto de compromisso)
 * e para quando o item chega em {@link StatusItem#CONCLUIDO}.
 */
@Service
public class WorkflowService {

    private final Clock clock;
    private final AgingProperties aging;

    public WorkflowService(Clock clock, AgingProperties aging) {
        this.clock = clock;
        this.aging = aging;
    }

    public Instant agora() {
        return clock.instant();
    }

    /** Registra a entrada do item no board (histórico inicial). */
    public void registrarCriacao(ItemTrabalho item, Instant quando) {
        item.setStatusDesde(quando);
        item.getHistorico().add(new HistoricoStatus(item, null, item.getStatus(), quando));
    }

    public void transicionar(ItemTrabalho item, StatusItem novo) {
        transicionar(item, novo, agora());
    }

    public void transicionar(ItemTrabalho item, StatusItem novo, Instant quando) {
        StatusItem anterior = item.getStatus();
        if (anterior == novo) {
            return;
        }
        item.getHistorico().add(new HistoricoStatus(item, anterior, novo, quando));
        item.setStatus(novo);
        item.setStatusDesde(quando);
        if (novo != StatusItem.SELECIONADO && item.getInicioWip() == null) {
            item.setInicioWip(quando);
        }
        if (novo == StatusItem.CONCLUIDO) {
            item.setConcluidoEm(quando);
            limparImpedimento(item);
        } else {
            item.setConcluidoEm(null);
        }
    }

    public void impedir(ItemTrabalho item, String motivo) {
        impedir(item, motivo, agora());
    }

    public void impedir(ItemTrabalho item, String motivo, Instant quando) {
        if (item.getStatus() == StatusItem.CONCLUIDO) {
            throw new RegraNegocioException("Itens concluídos não podem ser marcados como impedidos");
        }
        if (!item.isImpedido()) {
            item.setImpedidoDesde(quando);
        }
        item.setImpedido(true);
        item.setMotivoImpedimento(motivo == null || motivo.isBlank() ? null : motivo.strip());
    }

    public void desimpedir(ItemTrabalho item) {
        limparImpedimento(item);
    }

    /** Dias desde o início do WIP (até a conclusão, se concluído); {@code null} se ainda não iniciado. */
    public Long idadeWipDias(ItemTrabalho item) {
        if (item.getInicioWip() == null) {
            return null;
        }
        Instant fim = item.getConcluidoEm() != null ? item.getConcluidoEm() : agora();
        return Duration.between(item.getInicioWip(), fim).toDays();
    }

    public NivelAging nivel(Long dias) {
        if (dias == null) {
            return null;
        }
        if (dias < aging.limiteAtencaoDias()) {
            return NivelAging.VERDE;
        }
        return dias <= aging.limiteCriticoDias() ? NivelAging.AMARELO : NivelAging.VERMELHO;
    }

    public Long diasImpedido(ItemTrabalho item) {
        return item.isImpedido() && item.getImpedidoDesde() != null
                ? Duration.between(item.getImpedidoDesde(), agora()).toDays()
                : null;
    }

    public long diasNoStatus(ItemTrabalho item) {
        return Duration.between(item.getStatusDesde(), agora()).toDays();
    }

    public AgingProperties limites() {
        return aging;
    }

    private static void limparImpedimento(ItemTrabalho item) {
        item.setImpedido(false);
        item.setMotivoImpedimento(null);
        item.setImpedidoDesde(null);
    }
}
