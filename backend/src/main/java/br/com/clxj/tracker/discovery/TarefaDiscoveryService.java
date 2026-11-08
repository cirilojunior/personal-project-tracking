package br.com.clxj.tracker.discovery;

import java.time.Clock;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.delivery.ItemTrabalhoRepository;
import br.com.clxj.tracker.discovery.DiscoveryDtos.ItemVinculado;
import br.com.clxj.tracker.discovery.DiscoveryDtos.TarefaRequest;
import br.com.clxj.tracker.discovery.DiscoveryDtos.TarefaResponse;
import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.projeto.ProjetoService;
import br.com.clxj.tracker.shared.NaoEncontradoException;
import br.com.clxj.tracker.shared.RegraNegocioException;

@Service
@Transactional
public class TarefaDiscoveryService {

    private final TarefaDiscoveryRepository tarefas;
    private final RequisitoRepository requisitos;
    private final ItemTrabalhoRepository itens;
    private final ProjetoService projetoService;
    private final Clock clock;

    public TarefaDiscoveryService(TarefaDiscoveryRepository tarefas, RequisitoRepository requisitos,
            ItemTrabalhoRepository itens, ProjetoService projetoService, Clock clock) {
        this.tarefas = tarefas;
        this.requisitos = requisitos;
        this.itens = itens;
        this.projetoService = projetoService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TarefaResponse> listar(Long projetoId) {
        projetoService.obter(projetoId);
        return tarefas.findByProjetoIdOrderByCriadoEmAsc(projetoId).stream().map(this::resposta).toList();
    }

    @Transactional(readOnly = true)
    public TarefaResponse buscar(Long id) {
        return resposta(obter(id));
    }

    public TarefaResponse criar(Long projetoId, TarefaRequest req) {
        Projeto projeto = projetoService.obter(projetoId);
        TarefaDiscovery t = new TarefaDiscovery(projeto, req.titulo().strip(), clock.instant());
        aplicar(t, req);
        return resposta(tarefas.save(t));
    }

    public TarefaResponse atualizar(Long id, TarefaRequest req) {
        TarefaDiscovery t = obter(id);
        aplicar(t, req);
        return resposta(t);
    }

    public void excluir(Long id) {
        tarefas.delete(obter(id));
    }

    public TarefaDiscovery obter(Long id) {
        return tarefas.findById(id).orElseThrow(() -> new NaoEncontradoException("Tarefa", id));
    }

    public TarefaResponse resposta(TarefaDiscovery t) {
        var item = itens.findFirstByTarefaOrigemId(t.getId())
                .map(i -> new ItemVinculado(i.getId(), i.getStatus()))
                .orElse(null);
        return TarefaResponse.de(t, item);
    }

    private void aplicar(TarefaDiscovery t, TarefaRequest req) {
        t.setTitulo(req.titulo().strip());
        t.setDescricao(req.descricao());
        if (req.prioridade() != null) {
            t.setPrioridade(req.prioridade());
        }
        if (req.status() != null) {
            t.setStatus(req.status());
        }
        if (req.requisitoIds() != null) {
            Set<Long> ids = req.requisitoIds();
            var encontrados = requisitos.findByProjetoIdAndIdIn(t.getProjeto().getId(), ids);
            if (encontrados.size() != ids.size()) {
                throw new RegraNegocioException("Há requisitos inexistentes ou de outro projeto na tarefa");
            }
            t.getRequisitos().clear();
            t.getRequisitos().addAll(encontrados);
        }
    }
}
