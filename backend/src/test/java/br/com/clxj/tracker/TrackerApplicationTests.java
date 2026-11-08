package br.com.clxj.tracker;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import br.com.clxj.tracker.dashboard.DashboardService;

/** Sobe a aplicação no perfil padrão (dev), executando migrações e o seed de dados de exemplo. */
@SpringBootTest
class TrackerApplicationTests {

    @Autowired
    DashboardService dashboard;

    @Test
    void contextoSobeComDadosDeExemplo() {
        var d = dashboard.gerar();
        assertThat(d.totais().projetos()).isEqualTo(3);
        assertThat(d.totais().itensImpedidos()).isEqualTo(2);
        assertThat(d.maisAntigosEmWip()).isNotEmpty();
        assertThat(d.maisAntigosEmWip().getFirst().idadeWipDias()).isEqualTo(28);
    }
}
