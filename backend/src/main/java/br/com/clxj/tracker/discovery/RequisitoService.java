package br.com.clxj.tracker.discovery;

import java.time.Clock;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.discovery.DiscoveryDtos.RequisitoRequest;
import br.com.clxj.tracker.discovery.DiscoveryDtos.RequisitoResponse;
import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.projeto.ProjetoService;
import br.com.clxj.tracker.shared.NaoEncontradoException;

@Service
@Transactional
public class RequisitoService {

    private final RequisitoRepository requisitos;
    private final ProjetoService projetoService;
    private final Clock clock;

    public RequisitoService(RequisitoRepository requisitos, ProjetoService projetoService, Clock clock) {
        this.requisitos = requisitos;
        this.projetoService = projetoService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<RequisitoResponse> listar(Long projetoId, TipoRequisito tipo, StatusRequisito status,
            PrioridadeMoscow prioridade) {
        projetoService.obter(projetoId);
        return requisitos.findByProjetoIdOrderByTipoAscNumeroAsc(projetoId).stream()
                .filter(r -> tipo == null || r.getTipo() == tipo)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> prioridade == null || r.getPrioridade() == prioridade)
                .map(RequisitoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequisitoResponse buscar(Long id) {
        return RequisitoResponse.de(obter(id));
    }

    public RequisitoResponse criar(Long projetoId, RequisitoRequest req) {
        Projeto projeto = projetoService.obter(projetoId);
        Requisito r = new Requisito(projeto, clock.instant());
        r.numerar(req.tipo(), requisitos.maiorNumero(projetoId, req.tipo()) + 1);
        aplicar(r, req);
        return RequisitoResponse.de(requisitos.save(r));
    }

    public RequisitoResponse atualizar(Long id, RequisitoRequest req) {
        Requisito r = obter(id);
        if (r.getTipo() != req.tipo()) {
            r.numerar(req.tipo(), requisitos.maiorNumero(r.getProjeto().getId(), req.tipo()) + 1);
        }
        aplicar(r, req);
        return RequisitoResponse.de(r);
    }

    public void excluir(Long id) {
        requisitos.delete(obter(id));
    }

    private Requisito obter(Long id) {
        return requisitos.findById(id).orElseThrow(() -> new NaoEncontradoException("Requisito", id));
    }

    private static void aplicar(Requisito r, RequisitoRequest req) {
        r.setTitulo(req.titulo().strip());
        r.setDescricao(req.descricao());
        r.setCategoriaNfr(req.tipo() == TipoRequisito.NAO_FUNCIONAL ? req.categoriaNfr() : null);
        if (req.prioridade() != null) {
            r.setPrioridade(req.prioridade());
        }
        if (req.status() != null) {
            r.setStatus(req.status());
        }
    }
}
