package br.com.clxj.tracker.dashboard;

import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.cliente.ClienteRepository;
import br.com.clxj.tracker.delivery.DeliveryDtos.ItemResumo;
import br.com.clxj.tracker.delivery.ItemTrabalhoRepository;
import br.com.clxj.tracker.delivery.ItemTrabalhoService;
import br.com.clxj.tracker.delivery.NivelAging;
import br.com.clxj.tracker.delivery.StatusItem;
import br.com.clxj.tracker.discovery.RequisitoRepository;
import br.com.clxj.tracker.discovery.StatusRequisito;
import br.com.clxj.tracker.discovery.TarefaDiscoveryRepository;
import br.com.clxj.tracker.discovery.TipoRequisito;
import br.com.clxj.tracker.projeto.ProjetoDtos.ProjetoResponse;
import br.com.clxj.tracker.projeto.ProjetoService;
import br.com.clxj.tracker.projeto.StatusProjeto;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final int TOP_MAIS_ANTIGOS = 5;

    private final ClienteRepository clientes;
    private final ProjetoService projetoService;
    private final RequisitoRepository requisitos;
    private final TarefaDiscoveryRepository tarefas;
    private final ItemTrabalhoRepository itens;
    private final ItemTrabalhoService itemService;

    public DashboardService(ClienteRepository clientes, ProjetoService projetoService, RequisitoRepository requisitos,
            TarefaDiscoveryRepository tarefas, ItemTrabalhoRepository itens, ItemTrabalhoService itemService) {
        this.clientes = clientes;
        this.projetoService = projetoService;
        this.requisitos = requisitos;
        this.tarefas = tarefas;
        this.itens = itens;
        this.itemService = itemService;
    }

    public record Totais(long clientes, long projetos, long requisitos, long tarefas, long itensWip,
            long itensConcluidos, long itensImpedidos) {
    }

    public record Dashboard(Totais totais, Map<StatusProjeto, Long> projetosPorStatus,
            Map<TipoRequisito, Long> requisitosPorTipo, Map<StatusRequisito, Long> requisitosPorStatus,
            Map<StatusItem, Long> itensPorStatus, Map<NivelAging, Long> agingPorNivel,
            List<ItemResumo> impedidos, List<ItemResumo> maisAntigosEmWip, List<ProjetoResponse> projetos) {
    }

    public Dashboard gerar() {
        List<ProjetoResponse> projetos = projetoService.listar(null, null);
        List<ItemResumo> todos = itens.listarParaBoard(null).stream().map(itemService::resumo).toList();
        List<ItemResumo> wip = todos.stream().filter(i -> i.status().isWip()).toList();

        Map<StatusProjeto, Long> projetosPorStatus = zerado(StatusProjeto.class);
        projetos.forEach(p -> projetosPorStatus.merge(p.status(), 1L, Long::sum));

        Map<TipoRequisito, Long> porTipo = zerado(TipoRequisito.class);
        requisitos.contarPorTipo().forEach(r -> porTipo.put((TipoRequisito) r[0], (Long) r[1]));

        Map<StatusRequisito, Long> porStatusReq = zerado(StatusRequisito.class);
        requisitos.contarPorStatus().forEach(r -> porStatusReq.put((StatusRequisito) r[0], (Long) r[1]));

        Map<StatusItem, Long> itensPorStatus = zerado(StatusItem.class);
        todos.forEach(i -> itensPorStatus.merge(i.status(), 1L, Long::sum));

        Map<NivelAging, Long> agingPorNivel = zerado(NivelAging.class);
        wip.forEach(i -> agingPorNivel.merge(i.nivelAging(), 1L, Long::sum));

        List<ItemResumo> impedidos = todos.stream()
                .filter(ItemResumo::impedido)
                .sorted(Comparator.comparing(ItemResumo::diasImpedido, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        List<ItemResumo> maisAntigos = wip.stream()
                .sorted(Comparator.comparing(ItemResumo::idadeWipDias, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(TOP_MAIS_ANTIGOS)
                .toList();

        var totais = new Totais(clientes.count(), projetos.size(), requisitos.count(), tarefas.count(), wip.size(),
                itensPorStatus.get(StatusItem.CONCLUIDO), impedidos.size());
        return new Dashboard(totais, projetosPorStatus, porTipo, porStatusReq, itensPorStatus, agingPorNivel,
                impedidos, maisAntigos, projetos);
    }

    private static <E extends Enum<E>> Map<E, Long> zerado(Class<E> tipo) {
        Map<E, Long> mapa = new EnumMap<>(tipo);
        Arrays.stream(tipo.getEnumConstants()).forEach(e -> mapa.put(e, 0L));
        return mapa;
    }
}
