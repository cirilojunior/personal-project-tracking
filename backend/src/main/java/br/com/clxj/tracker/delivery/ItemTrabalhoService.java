package br.com.clxj.tracker.delivery;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.delivery.DeliveryDtos.Board;
import br.com.clxj.tracker.delivery.DeliveryDtos.Coluna;
import br.com.clxj.tracker.delivery.DeliveryDtos.HistoricoDto;
import br.com.clxj.tracker.delivery.DeliveryDtos.ItemDetalhe;
import br.com.clxj.tracker.delivery.DeliveryDtos.ItemRequest;
import br.com.clxj.tracker.delivery.DeliveryDtos.ItemResumo;
import br.com.clxj.tracker.delivery.DeliveryDtos.MoverRequest;
import br.com.clxj.tracker.delivery.DeliveryDtos.SubtarefaDto;
import br.com.clxj.tracker.delivery.DeliveryDtos.SubtarefaRequest;
import br.com.clxj.tracker.discovery.StatusTarefa;
import br.com.clxj.tracker.discovery.TarefaDiscovery;
import br.com.clxj.tracker.discovery.TarefaDiscoveryService;
import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.projeto.ProjetoService;
import br.com.clxj.tracker.shared.NaoEncontradoException;
import br.com.clxj.tracker.shared.RegraNegocioException;

@Service
@Transactional
public class ItemTrabalhoService {

    private final ItemTrabalhoRepository itens;
    private final ProjetoService projetoService;
    private final TarefaDiscoveryService tarefaService;
    private final WorkflowService workflow;

    public ItemTrabalhoService(ItemTrabalhoRepository itens, ProjetoService projetoService,
            TarefaDiscoveryService tarefaService, WorkflowService workflow) {
        this.itens = itens;
        this.projetoService = projetoService;
        this.tarefaService = tarefaService;
        this.workflow = workflow;
    }

    /** Board com as 9 colunas; {@code projetoId} nulo traz os itens de todos os projetos. */
    @Transactional(readOnly = true)
    public Board board(Long projetoId) {
        if (projetoId != null) {
            projetoService.obter(projetoId);
        }
        Map<StatusItem, List<ItemResumo>> porStatus = new EnumMap<>(StatusItem.class);
        Arrays.stream(StatusItem.values()).forEach(s -> porStatus.put(s, new ArrayList<>()));
        itens.listarParaBoard(projetoId).forEach(i -> porStatus.get(i.getStatus()).add(resumo(i)));
        List<Coluna> colunas = porStatus.entrySet().stream()
                .map(e -> new Coluna(e.getKey(), e.getValue().size(),
                        (int) e.getValue().stream().filter(ItemResumo::impedido).count(), e.getValue()))
                .toList();
        return new Board(projetoId, workflow.limites(), colunas);
    }

    @Transactional(readOnly = true)
    public ItemDetalhe detalhe(Long id) {
        return detalhe(obter(id));
    }

    public ItemDetalhe criar(Long projetoId, ItemRequest req) {
        Projeto projeto = projetoService.obter(projetoId);
        ItemTrabalho item = novoItem(projeto, req.titulo().strip());
        item.setDescricao(req.descricao());
        if (req.prioridade() != null) {
            item.setPrioridade(req.prioridade());
        }
        return detalhe(itens.save(item));
    }

    public ItemDetalhe criarDeTarefa(Long tarefaId) {
        TarefaDiscovery tarefa = tarefaService.obter(tarefaId);
        if (itens.findFirstByTarefaOrigemId(tarefaId).isPresent()) {
            throw new RegraNegocioException("Esta tarefa já foi enviada para o Delivery");
        }
        ItemTrabalho item = novoItem(tarefa.getProjeto(), tarefa.getTitulo());
        item.setDescricao(tarefa.getDescricao());
        item.setPrioridade(tarefa.getPrioridade());
        item.setTarefaOrigem(tarefa);
        if (tarefa.getStatus() == StatusTarefa.A_FAZER) {
            tarefa.setStatus(StatusTarefa.EM_ANDAMENTO);
        }
        return detalhe(itens.save(item));
    }

    public ItemDetalhe atualizar(Long id, ItemRequest req) {
        ItemTrabalho item = obter(id);
        item.setTitulo(req.titulo().strip());
        item.setDescricao(req.descricao());
        if (req.prioridade() != null) {
            item.setPrioridade(req.prioridade());
        }
        return detalhe(item);
    }

    public void excluir(Long id) {
        ItemTrabalho item = obter(id);
        Long projetoId = item.getProjeto().getId();
        StatusItem status = item.getStatus();
        itens.delete(item);
        itens.flush();
        renumerar(itens.findByProjetoIdAndStatusOrderByOrdemAscIdAsc(projetoId, status));
    }

    /** Move o item de coluna e/ou posição, registrando histórico e reordenando as colunas afetadas. */
    public ItemDetalhe mover(Long id, MoverRequest req) {
        ItemTrabalho item = obter(id);
        Long projetoId = item.getProjeto().getId();
        StatusItem origem = item.getStatus();

        workflow.transicionar(item, req.status());

        List<ItemTrabalho> destino = new ArrayList<>(
                itens.findByProjetoIdAndStatusOrderByOrdemAscIdAsc(projetoId, req.status()));
        destino.removeIf(i -> i.getId().equals(item.getId()));
        int posicao = req.ordem() == null ? destino.size() : Math.min(req.ordem(), destino.size());
        destino.add(posicao, item);
        renumerar(destino);

        if (origem != req.status()) {
            List<ItemTrabalho> colunaOrigem = new ArrayList<>(
                    itens.findByProjetoIdAndStatusOrderByOrdemAscIdAsc(projetoId, origem));
            colunaOrigem.removeIf(i -> i.getId().equals(item.getId()));
            renumerar(colunaOrigem);
        }
        return detalhe(item);
    }

    public ItemDetalhe impedir(Long id, String motivo) {
        ItemTrabalho item = obter(id);
        workflow.impedir(item, motivo);
        return detalhe(item);
    }

    public ItemDetalhe desimpedir(Long id) {
        ItemTrabalho item = obter(id);
        workflow.desimpedir(item);
        return detalhe(item);
    }

    // ---- Subtarefas ----

    public ItemDetalhe adicionarSubtarefa(Long itemId, SubtarefaRequest req) {
        ItemTrabalho item = obter(itemId);
        SubTarefa sub = new SubTarefa(item, req.titulo().strip(), item.getSubtarefas().size());
        sub.setConcluida(Boolean.TRUE.equals(req.concluida()));
        item.getSubtarefas().add(sub);
        itens.flush();
        return detalhe(item);
    }

    public ItemDetalhe atualizarSubtarefa(Long itemId, Long subId, SubtarefaRequest req) {
        ItemTrabalho item = obter(itemId);
        SubTarefa sub = subtarefa(item, subId);
        sub.setTitulo(req.titulo().strip());
        if (req.concluida() != null) {
            sub.setConcluida(req.concluida());
        }
        return detalhe(item);
    }

    public ItemDetalhe excluirSubtarefa(Long itemId, Long subId) {
        ItemTrabalho item = obter(itemId);
        item.getSubtarefas().remove(subtarefa(item, subId));
        for (int i = 0; i < item.getSubtarefas().size(); i++) {
            item.getSubtarefas().get(i).setOrdem(i);
        }
        return detalhe(item);
    }

    // ---- Apoio ----

    public ItemResumo resumo(ItemTrabalho i) {
        Long idade = workflow.idadeWipDias(i);
        int concluidas = (int) i.getSubtarefas().stream().filter(SubTarefa::isConcluida).count();
        return new ItemResumo(i.getId(), i.getProjeto().getId(), i.getProjeto().getNome(), i.getTitulo(),
                i.getPrioridade(), i.getStatus(), i.getOrdem(), i.isImpedido(), i.getMotivoImpedimento(),
                workflow.diasImpedido(i), idade, workflow.nivel(idade), workflow.diasNoStatus(i),
                i.getSubtarefas().size(), concluidas, tarefaOrigemId(i));
    }

    private ItemDetalhe detalhe(ItemTrabalho i) {
        Long idade = workflow.idadeWipDias(i);
        var subs = i.getSubtarefas().stream()
                .map(s -> new SubtarefaDto(s.getId(), s.getTitulo(), s.isConcluida(), s.getOrdem()))
                .toList();
        var hist = i.getHistorico().stream()
                .map(h -> new HistoricoDto(h.getStatusAnterior(), h.getStatusNovo(), h.getOcorridoEm()))
                .toList();
        return new ItemDetalhe(i.getId(), i.getProjeto().getId(), i.getProjeto().getNome(), i.getTitulo(),
                i.getDescricao(), i.getPrioridade(), i.getStatus(), i.getOrdem(), i.isImpedido(),
                i.getMotivoImpedimento(), i.getImpedidoDesde(), workflow.diasImpedido(i), i.getInicioWip(),
                i.getConcluidoEm(), i.getStatusDesde(), idade, workflow.nivel(idade), workflow.diasNoStatus(i),
                tarefaOrigemId(i), i.getCriadoEm(), subs, hist);
    }

    private ItemTrabalho novoItem(Projeto projeto, String titulo) {
        ItemTrabalho item = new ItemTrabalho(projeto, titulo, workflow.agora());
        item.setOrdem((int) itens.countByProjetoIdAndStatus(projeto.getId(), StatusItem.SELECIONADO));
        workflow.registrarCriacao(item, item.getCriadoEm());
        return item;
    }

    private ItemTrabalho obter(Long id) {
        return itens.findById(id).orElseThrow(() -> new NaoEncontradoException("Item de trabalho", id));
    }

    private static SubTarefa subtarefa(ItemTrabalho item, Long subId) {
        return item.getSubtarefas().stream()
                .filter(s -> s.getId().equals(subId))
                .findFirst()
                .orElseThrow(() -> new NaoEncontradoException("Subtarefa", subId));
    }

    private static Long tarefaOrigemId(ItemTrabalho i) {
        return i.getTarefaOrigem() == null ? null : i.getTarefaOrigem().getId();
    }

    private static void renumerar(List<ItemTrabalho> coluna) {
        for (int i = 0; i < coluna.size(); i++) {
            coluna.get(i).setOrdem(i);
        }
    }
}
