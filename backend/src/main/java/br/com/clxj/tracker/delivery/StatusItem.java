package br.com.clxj.tracker.delivery;

import java.util.EnumSet;
import java.util.Set;

/** Colunas do board de Delivery, na ordem do fluxo. */
public enum StatusItem {
    SELECIONADO,
    EM_REFINAMENTO,
    REFINADO,
    EM_IMPLEMENTACAO,
    IMPLEMENTADO,
    EM_TESTES,
    TESTADO,
    AGUARDANDO_PLANEJAMENTO_IMPLANTACAO,
    CONCLUIDO;

    /** Status considerados "trabalho em andamento" (após o ponto de compromisso e antes da conclusão). */
    public static Set<StatusItem> emWip() {
        return EnumSet.range(EM_REFINAMENTO, AGUARDANDO_PLANEJAMENTO_IMPLANTACAO);
    }

    public boolean isWip() {
        return emWip().contains(this);
    }
}
