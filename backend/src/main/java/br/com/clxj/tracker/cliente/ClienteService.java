package br.com.clxj.tracker.cliente;

import java.time.Clock;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.clxj.tracker.cliente.ClienteDtos.ClienteRequest;
import br.com.clxj.tracker.cliente.ClienteDtos.ClienteResponse;
import br.com.clxj.tracker.projeto.ProjetoRepository;
import br.com.clxj.tracker.shared.NaoEncontradoException;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clientes;
    private final ProjetoRepository projetos;
    private final Clock clock;

    public ClienteService(ClienteRepository clientes, ProjetoRepository projetos, Clock clock) {
        this.clientes = clientes;
        this.projetos = projetos;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar() {
        return clientes.findAllByOrderByNomeAsc().stream()
                .map(c -> ClienteResponse.de(c, projetos.countByClienteId(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id) {
        Cliente c = obter(id);
        return ClienteResponse.de(c, projetos.countByClienteId(id));
    }

    public ClienteResponse criar(ClienteRequest req) {
        Cliente c = new Cliente(req.nome(), clock.instant());
        aplicar(c, req);
        return ClienteResponse.de(clientes.save(c), 0);
    }

    public ClienteResponse atualizar(Long id, ClienteRequest req) {
        Cliente c = obter(id);
        aplicar(c, req);
        return ClienteResponse.de(c, projetos.countByClienteId(id));
    }

    public void excluir(Long id) {
        clientes.delete(obter(id));
    }

    public Cliente obter(Long id) {
        return clientes.findById(id).orElseThrow(() -> new NaoEncontradoException("Cliente", id));
    }

    private static void aplicar(Cliente c, ClienteRequest req) {
        c.setNome(req.nome().strip());
        c.setEmpresa(req.empresa());
        c.setEmail(req.email());
        c.setTelefone(req.telefone());
        c.setObservacoes(req.observacoes());
    }
}
