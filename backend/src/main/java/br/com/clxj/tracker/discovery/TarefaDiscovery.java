package br.com.clxj.tracker.discovery;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.shared.Prioridade;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity
public class TarefaDiscovery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projeto_id", nullable = false, updatable = false)
    private Projeto projeto;

    @Column(nullable = false)
    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridade prioridade = Prioridade.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTarefa status = StatusTarefa.A_FAZER;

    @ManyToMany
    @JoinTable(name = "tarefa_requisito",
            joinColumns = @JoinColumn(name = "tarefa_id"),
            inverseJoinColumns = @JoinColumn(name = "requisito_id"))
    private Set<Requisito> requisitos = new LinkedHashSet<>();

    @Column(nullable = false, updatable = false)
    private Instant criadoEm;

    protected TarefaDiscovery() {
    }

    public TarefaDiscovery(Projeto projeto, String titulo, Instant criadoEm) {
        this.projeto = projeto;
        this.titulo = titulo;
        this.criadoEm = criadoEm;
    }

    public Long getId() { return id; }
    public Projeto getProjeto() { return projeto; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }
    public StatusTarefa getStatus() { return status; }
    public void setStatus(StatusTarefa status) { this.status = status; }
    public Set<Requisito> getRequisitos() { return requisitos; }
    public Instant getCriadoEm() { return criadoEm; }
}
