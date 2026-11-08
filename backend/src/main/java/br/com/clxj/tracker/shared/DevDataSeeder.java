package br.com.clxj.tracker.shared;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.cliente.Cliente;
import br.com.clxj.tracker.cliente.ClienteRepository;
import br.com.clxj.tracker.delivery.ItemTrabalho;
import br.com.clxj.tracker.delivery.ItemTrabalhoRepository;
import br.com.clxj.tracker.delivery.StatusItem;
import br.com.clxj.tracker.delivery.SubTarefa;
import br.com.clxj.tracker.delivery.WorkflowService;
import br.com.clxj.tracker.discovery.CategoriaNfr;
import br.com.clxj.tracker.discovery.PrioridadeMoscow;
import br.com.clxj.tracker.discovery.Requisito;
import br.com.clxj.tracker.discovery.RequisitoRepository;
import br.com.clxj.tracker.discovery.StatusRequisito;
import br.com.clxj.tracker.discovery.StatusTarefa;
import br.com.clxj.tracker.discovery.TarefaDiscovery;
import br.com.clxj.tracker.discovery.TarefaDiscoveryRepository;
import br.com.clxj.tracker.discovery.TipoRequisito;
import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.projeto.ProjetoRepository;
import br.com.clxj.tracker.projeto.StatusProjeto;

/** Popula o banco em memória com dados de exemplo (perfil dev). Datas retroativas exercitam o Aging WIP. */
@Component
@ConditionalOnProperty(name = "tracker.seed.enabled", havingValue = "true")
public class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final ClienteRepository clientes;
    private final ProjetoRepository projetos;
    private final RequisitoRepository requisitos;
    private final TarefaDiscoveryRepository tarefas;
    private final ItemTrabalhoRepository itens;
    private final WorkflowService workflow;
    private final Map<String, Integer> ordens = new HashMap<>();
    private Instant agora;

    public DevDataSeeder(ClienteRepository clientes, ProjetoRepository projetos, RequisitoRepository requisitos,
            TarefaDiscoveryRepository tarefas, ItemTrabalhoRepository itens, WorkflowService workflow) {
        this.clientes = clientes;
        this.projetos = projetos;
        this.requisitos = requisitos;
        this.tarefas = tarefas;
        this.itens = itens;
        this.workflow = workflow;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (clientes.count() > 0) {
            return;
        }
        agora = workflow.agora();

        Cliente acme = cliente("Ana Souza", "Acme Logística", "ana.souza@acme.example", "(11) 98888-1111");
        Cliente bella = cliente("Bruno Lima", "Bella Moda", "bruno@bellamoda.example", "(21) 97777-2222");

        Projeto roteirizacao = projeto("Roteirização de Entregas", "Logística / Last mile", acme,
                StatusProjeto.EM_ANDAMENTO, "Plataforma para otimizar rotas de entrega e rastreamento em tempo real.");
        Projeto ecommerce = projeto("E-commerce B2C", "Varejo de moda", bella, StatusProjeto.DISCOVERY,
                "Loja virtual com catálogo, carrinho e integração com meios de pagamento.");
        projeto("Portal do Motorista", "Logística / Mobile", acme, StatusProjeto.PAUSADO,
                "App para motoristas consultarem rotas e registrarem ocorrências.");

        Requisito rf1 = requisito(roteirizacao, TipoRequisito.FUNCIONAL, "Calcular rota otimizada",
                PrioridadeMoscow.MUST, StatusRequisito.APROVADO, null);
        Requisito rf2 = requisito(roteirizacao, TipoRequisito.FUNCIONAL, "Rastrear entregas no mapa",
                PrioridadeMoscow.MUST, StatusRequisito.APROVADO, null);
        requisito(roteirizacao, TipoRequisito.FUNCIONAL, "Exportar relatório de entregas em CSV",
                PrioridadeMoscow.COULD, StatusRequisito.VALIDADO, null);
        Requisito rnf1 = requisito(roteirizacao, TipoRequisito.NAO_FUNCIONAL, "Cálculo de rota em até 3 segundos",
                PrioridadeMoscow.MUST, StatusRequisito.APROVADO, CategoriaNfr.DESEMPENHO);
        requisito(roteirizacao, TipoRequisito.NAO_FUNCIONAL, "Autenticação via SSO corporativo",
                PrioridadeMoscow.SHOULD, StatusRequisito.VALIDADO, CategoriaNfr.SEGURANCA);
        requisito(ecommerce, TipoRequisito.FUNCIONAL, "Carrinho de compras persistente",
                PrioridadeMoscow.MUST, StatusRequisito.RASCUNHO, null);
        requisito(ecommerce, TipoRequisito.FUNCIONAL, "Pagamento via Pix e cartão",
                PrioridadeMoscow.MUST, StatusRequisito.VALIDADO, null);
        requisito(ecommerce, TipoRequisito.NAO_FUNCIONAL, "Disponibilidade de 99,5%",
                PrioridadeMoscow.SHOULD, StatusRequisito.RASCUNHO, CategoriaNfr.DISPONIBILIDADE);

        TarefaDiscovery tRotas = tarefa(roteirizacao, "Motor de roteirização", Prioridade.ALTA,
                StatusTarefa.EM_ANDAMENTO, rf1, rnf1);
        TarefaDiscovery tMapa = tarefa(roteirizacao, "Mapa de rastreamento", Prioridade.ALTA,
                StatusTarefa.EM_ANDAMENTO, rf2);
        tarefa(roteirizacao, "Relatórios operacionais", Prioridade.BAIXA, StatusTarefa.A_FAZER);
        tarefa(ecommerce, "Entrevistas com stakeholders", Prioridade.ALTA, StatusTarefa.EM_ANDAMENTO);
        tarefa(ecommerce, "Mapear jornada de compra", Prioridade.MEDIA, StatusTarefa.A_FAZER);

        ItemTrabalho motor = item(roteirizacao, "Implementar algoritmo de roteirização", Prioridade.ALTA, 18,
                Map.of(StatusItem.EM_REFINAMENTO, 14, StatusItem.REFINADO, 12, StatusItem.EM_IMPLEMENTACAO, 11));
        motor.setTarefaOrigem(tRotas);
        sub(motor, "Modelar grafo de vias", true);
        sub(motor, "Integrar API de geocodificação", true);
        sub(motor, "Heurística de vizinho mais próximo", false);
        sub(motor, "Testes de desempenho", false);
        workflow.impedir(motor, "Aguardando chave da API de mapas do cliente", dias(3));

        ItemTrabalho mapa = item(roteirizacao, "Tela de rastreamento em tempo real", Prioridade.ALTA, 10,
                Map.of(StatusItem.EM_REFINAMENTO, 7, StatusItem.REFINADO, 6, StatusItem.EM_IMPLEMENTACAO, 5,
                        StatusItem.IMPLEMENTADO, 2, StatusItem.EM_TESTES, 1));
        mapa.setTarefaOrigem(tMapa);
        sub(mapa, "Componente de mapa", true);
        sub(mapa, "WebSocket de posições", true);

        item(roteirizacao, "Cadastro de veículos", Prioridade.MEDIA, 9, Map.of(StatusItem.EM_REFINAMENTO, 3));
        item(roteirizacao, "Login com SSO", Prioridade.MEDIA, 30,
                Map.of(StatusItem.EM_REFINAMENTO, 28, StatusItem.REFINADO, 26, StatusItem.EM_IMPLEMENTACAO, 24,
                        StatusItem.IMPLEMENTADO, 20, StatusItem.EM_TESTES, 18, StatusItem.TESTADO, 16,
                        StatusItem.AGUARDANDO_PLANEJAMENTO_IMPLANTACAO, 15));
        item(roteirizacao, "Setup de CI/CD", Prioridade.ALTA, 40,
                Map.of(StatusItem.EM_REFINAMENTO, 38, StatusItem.REFINADO, 37, StatusItem.EM_IMPLEMENTACAO, 36,
                        StatusItem.IMPLEMENTADO, 34, StatusItem.EM_TESTES, 33, StatusItem.TESTADO, 32,
                        StatusItem.CONCLUIDO, 31));
        item(roteirizacao, "Relatório CSV de entregas", Prioridade.BAIXA, 2, Map.of());
        ItemTrabalho prototipo = item(ecommerce, "Protótipo navegável do checkout", Prioridade.MEDIA, 6,
                Map.of(StatusItem.EM_REFINAMENTO, 4));
        workflow.impedir(prototipo, "Cliente ainda não enviou o manual da marca", dias(2));

        log.info("Dados de exemplo carregados: {} clientes, {} projetos, {} requisitos, {} tarefas, {} itens",
                clientes.count(), projetos.count(), requisitos.count(), tarefas.count(), itens.count());
    }

    private Instant dias(int atras) {
        return agora.minus(Duration.ofDays(atras));
    }

    private Cliente cliente(String nome, String empresa, String email, String telefone) {
        Cliente c = new Cliente(nome, dias(60));
        c.setEmpresa(empresa);
        c.setEmail(email);
        c.setTelefone(telefone);
        return clientes.save(c);
    }

    private Projeto projeto(String nome, String tema, Cliente cliente, StatusProjeto status, String descricao) {
        Projeto p = new Projeto(nome, tema, dias(45));
        p.setCliente(cliente);
        p.setStatus(status);
        p.setDescricao(descricao);
        p.setDataInicio(LocalDate.ofInstant(dias(45), ZoneId.systemDefault()));
        return projetos.save(p);
    }

    private Requisito requisito(Projeto p, TipoRequisito tipo, String titulo, PrioridadeMoscow prioridade,
            StatusRequisito status, CategoriaNfr categoria) {
        Requisito r = new Requisito(p, dias(40));
        r.numerar(tipo, requisitos.maiorNumero(p.getId(), tipo) + 1);
        r.setTitulo(titulo);
        r.setPrioridade(prioridade);
        r.setStatus(status);
        r.setCategoriaNfr(categoria);
        return requisitos.saveAndFlush(r);
    }

    private TarefaDiscovery tarefa(Projeto p, String titulo, Prioridade prioridade, StatusTarefa status,
            Requisito... reqs) {
        TarefaDiscovery t = new TarefaDiscovery(p, titulo, dias(35));
        t.setPrioridade(prioridade);
        t.setStatus(status);
        t.getRequisitos().addAll(List.of(reqs));
        return tarefas.save(t);
    }

    /** Cria um item e aplica as transições (status → dias atrás), na ordem do fluxo. */
    private ItemTrabalho item(Projeto p, String titulo, Prioridade prioridade, int criadoDiasAtras,
            Map<StatusItem, Integer> transicoes) {
        ItemTrabalho item = new ItemTrabalho(p, titulo, dias(criadoDiasAtras));
        item.setPrioridade(prioridade);
        workflow.registrarCriacao(item, item.getCriadoEm());
        transicoes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> workflow.transicionar(item, e.getKey(), dias(e.getValue())));
        item.setOrdem(ordens.merge(p.getId() + ":" + item.getStatus(), 1, Integer::sum) - 1);
        return itens.save(item);
    }

    private void sub(ItemTrabalho item, String titulo, boolean concluida) {
        SubTarefa s = new SubTarefa(item, titulo, item.getSubtarefas().size());
        s.setConcluida(concluida);
        item.getSubtarefas().add(s);
    }
}
