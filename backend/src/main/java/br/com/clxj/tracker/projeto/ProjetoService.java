package br.com.clxj.tracker.projeto;

import java.time.Clock;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.cliente.ClienteService;
import br.com.clxj.tracker.delivery.ItemTrabalhoRepository;
import br.com.clxj.tracker.delivery.StatusItem;
import br.com.clxj.tracker.discovery.RequisitoRepository;
import br.com.clxj.tracker.discovery.TarefaDiscoveryRepository;
import br.com.clxj.tracker.projeto.ProjetoDtos.Contagens;
import br.com.clxj.tracker.projeto.ProjetoDtos.ProjetoRequest;
import br.com.clxj.tracker.projeto.ProjetoDtos.ProjetoResponse;
import br.com.clxj.tracker.shared.NaoEncontradoException;

@Service
@Transactional
public class ProjetoService {

    private final ProjetoRepository projetos;
    private final ClienteService clienteService;
    private final RequisitoRepository requisitos;
    private final TarefaDiscoveryRepository tarefas;
    private final ItemTrabalhoRepository itens;
    private final Clock clock;

    public ProjetoService(ProjetoRepository projetos, ClienteService clienteService, RequisitoRepository requisitos,
            TarefaDiscoveryRepository tarefas, ItemTrabalhoRepository itens, Clock clock) {
        this.projetos = projetos;
        this.clienteService = clienteService;
        this.requisitos = requisitos;
        this.tarefas = tarefas;
        this.itens = itens;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ProjetoResponse> listar(StatusProjeto status, Long clienteId) {
        return projetos.filtrar(status, clienteId).stream().map(this::resposta).toList();
    }

    @Transactional(readOnly = true)
    public ProjetoResponse buscar(Long id) {
        return resposta(obter(id));
    }

    public ProjetoResponse criar(ProjetoRequest req) {
        Projeto p = new Projeto(req.nome().strip(), req.tema().strip(), clock.instant());
        aplicar(p, req);
        return resposta(projetos.save(p));
    }

    public ProjetoResponse atualizar(Long id, ProjetoRequest req) {
        Projeto p = obter(id);
        aplicar(p, req);
        return resposta(p);
    }

    public void excluir(Long id) {
        projetos.delete(obter(id));
    }

    public Projeto obter(Long id) {
        return projetos.findById(id).orElseThrow(() -> new NaoEncontradoException("Projeto", id));
    }

    private void aplicar(Projeto p, ProjetoRequest req) {
        p.setNome(req.nome().strip());
        p.setTema(req.tema().strip());
        p.setDescricao(req.descricao());
        p.setCliente(req.clienteId() == null ? null : clienteService.obter(req.clienteId()));
        if (req.status() != null) {
            p.setStatus(req.status());
        }
        p.setDataInicio(req.dataInicio());
    }

    private ProjetoResponse resposta(Projeto p) {
        Long id = p.getId();
        var contagens = new Contagens(
                requisitos.countByProjetoId(id),
                tarefas.countByProjetoId(id),
                itens.countByProjetoIdAndStatusIn(id, StatusItem.emWip()),
                itens.countByProjetoIdAndStatus(id, StatusItem.CONCLUIDO),
                itens.countByProjetoIdAndImpedidoTrue(id));
        return ProjetoResponse.de(p, contagens);
    }
}
