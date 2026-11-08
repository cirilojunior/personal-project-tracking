package br.com.clxj.tracker.delivery;

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

import br.com.clxj.tracker.delivery.DeliveryDtos.Board;
import br.com.clxj.tracker.delivery.DeliveryDtos.ImpedimentoRequest;
import br.com.clxj.tracker.delivery.DeliveryDtos.ItemDetalhe;
import br.com.clxj.tracker.delivery.DeliveryDtos.ItemRequest;
import br.com.clxj.tracker.delivery.DeliveryDtos.MoverRequest;
import br.com.clxj.tracker.delivery.DeliveryDtos.SubtarefaRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class DeliveryController {

    private final ItemTrabalhoService service;

    public DeliveryController(ItemTrabalhoService service) {
        this.service = service;
    }

    @GetMapping("/projetos/{projetoId}/board")
    public Board boardDoProjeto(@PathVariable Long projetoId) {
        return service.board(projetoId);
    }

    /** Board consolidado (todos os projetos, ou um via {@code ?projetoId=}). */
    @GetMapping("/board")
    public Board board(@RequestParam(required = false) Long projetoId) {
        return service.board(projetoId);
    }

    @PostMapping("/projetos/{projetoId}/itens")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDetalhe criar(@PathVariable Long projetoId, @Valid @RequestBody ItemRequest req) {
        return service.criar(projetoId, req);
    }

    @GetMapping("/itens/{id}")
    public ItemDetalhe detalhe(@PathVariable Long id) {
        return service.detalhe(id);
    }

    @PutMapping("/itens/{id}")
    public ItemDetalhe atualizar(@PathVariable Long id, @Valid @RequestBody ItemRequest req) {
        return service.atualizar(id, req);
    }

    @DeleteMapping("/itens/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }

    @PostMapping("/itens/{id}/mover")
    public ItemDetalhe mover(@PathVariable Long id, @Valid @RequestBody MoverRequest req) {
        return service.mover(id, req);
    }

    @PutMapping("/itens/{id}/impedimento")
    public ItemDetalhe impedir(@PathVariable Long id, @Valid @RequestBody(required = false) ImpedimentoRequest req) {
        return service.impedir(id, req == null ? null : req.motivo());
    }

    @DeleteMapping("/itens/{id}/impedimento")
    public ItemDetalhe desimpedir(@PathVariable Long id) {
        return service.desimpedir(id);
    }

    @PostMapping("/itens/{id}/subtarefas")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDetalhe adicionarSubtarefa(@PathVariable Long id, @Valid @RequestBody SubtarefaRequest req) {
        return service.adicionarSubtarefa(id, req);
    }

    @PutMapping("/itens/{id}/subtarefas/{subId}")
    public ItemDetalhe atualizarSubtarefa(@PathVariable Long id, @PathVariable Long subId,
            @Valid @RequestBody SubtarefaRequest req) {
        return service.atualizarSubtarefa(id, subId, req);
    }

    @DeleteMapping("/itens/{id}/subtarefas/{subId}")
    public ItemDetalhe excluirSubtarefa(@PathVariable Long id, @PathVariable Long subId) {
        return service.excluirSubtarefa(id, subId);
    }
}
