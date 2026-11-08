package br.com.clxj.tracker.discovery;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.clxj.tracker.delivery.DeliveryDtos.ItemDetalhe;
import br.com.clxj.tracker.delivery.ItemTrabalhoService;
import br.com.clxj.tracker.discovery.DiscoveryDtos.RequisitoRequest;
import br.com.clxj.tracker.discovery.DiscoveryDtos.RequisitoResponse;
import br.com.clxj.tracker.discovery.DiscoveryDtos.TarefaRequest;
import br.com.clxj.tracker.discovery.DiscoveryDtos.TarefaResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class DiscoveryController {

    private final RequisitoService requisitos;
    private final TarefaDiscoveryService tarefas;
    private final ItemTrabalhoService itens;

    public DiscoveryController(RequisitoService requisitos, TarefaDiscoveryService tarefas, ItemTrabalhoService itens) {
        this.requisitos = requisitos;
        this.tarefas = tarefas;
        this.itens = itens;
    }

    // ---- Requisitos ----

    @GetMapping("/projetos/{projetoId}/requisitos")
    public List<RequisitoResponse> listarRequisitos(@PathVariable Long projetoId,
            @RequestParam(required = false) TipoRequisito tipo,
            @RequestParam(required = false) StatusRequisito status,
            @RequestParam(required = false) PrioridadeMoscow prioridade) {
        return requisitos.listar(projetoId, tipo, status, prioridade);
    }

    @PostMapping("/projetos/{projetoId}/requisitos")
    @ResponseStatus(HttpStatus.CREATED)
    public RequisitoResponse criarRequisito(@PathVariable Long projetoId, @Valid @RequestBody RequisitoRequest req) {
        return requisitos.criar(projetoId, req);
    }

    @GetMapping("/requisitos/{id}")
    public RequisitoResponse buscarRequisito(@PathVariable Long id) {
        return requisitos.buscar(id);
    }

    @PutMapping("/requisitos/{id}")
    public RequisitoResponse atualizarRequisito(@PathVariable Long id, @Valid @RequestBody RequisitoRequest req) {
        return requisitos.atualizar(id, req);
    }

    @DeleteMapping("/requisitos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirRequisito(@PathVariable Long id) {
        requisitos.excluir(id);
    }

    // ---- Tarefas (alto nível) ----

    @GetMapping("/projetos/{projetoId}/tarefas")
    public List<TarefaResponse> listarTarefas(@PathVariable Long projetoId) {
        return tarefas.listar(projetoId);
    }

    @PostMapping("/projetos/{projetoId}/tarefas")
    @ResponseStatus(HttpStatus.CREATED)
    public TarefaResponse criarTarefa(@PathVariable Long projetoId, @Valid @RequestBody TarefaRequest req) {
        return tarefas.criar(projetoId, req);
    }

    @GetMapping("/tarefas/{id}")
    public TarefaResponse buscarTarefa(@PathVariable Long id) {
        return tarefas.buscar(id);
    }

    @PutMapping("/tarefas/{id}")
    public TarefaResponse atualizarTarefa(@PathVariable Long id, @Valid @RequestBody TarefaRequest req) {
        return tarefas.atualizar(id, req);
    }

    @DeleteMapping("/tarefas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirTarefa(@PathVariable Long id) {
        tarefas.excluir(id);
    }

    /** Cria um item de trabalho no board de Delivery (coluna "Selecionado") a partir da tarefa. */
    @PostMapping("/tarefas/{id}/enviar-para-delivery")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDetalhe enviarParaDelivery(@PathVariable Long id) {
        return itens.criarDeTarefa(id);
    }
}
