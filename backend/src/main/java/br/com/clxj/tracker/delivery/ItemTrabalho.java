package br.com.clxj.tracker.delivery;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import br.com.clxj.tracker.discovery.TarefaDiscovery;
import br.com.clxj.tracker.projeto.Projeto;
import br.com.clxj.tracker.shared.Prioridade;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;

@Entity
public class ItemTrabalho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projeto_id", nullable = false, updatable = false)
    private Projeto projeto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarefa_origem_id")
    private TarefaDiscovery tarefaOrigem;

    @Column(nullable = false)
    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridade prioridade = Prioridade.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusItem status = StatusItem.SELECIONADO;

    @Column(nullable = false)
    private int ordem;

    @Column(nullable = false)
    private boolean impedido;

    private String motivoImpedimento;
    private Instant impedidoDesde;
    private Instant inicioWip;
    private Instant concluidoEm;

    @Column(nullable = false)
    private Instant statusDesde;

    @Column(nullable = false, updatable = false)
    private Instant criadoEm;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem asc, id asc")
    private List<SubTarefa> subtarefas = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ocorridoEm asc, id asc")
    private List<HistoricoStatus> historico = new ArrayList<>();

    protected ItemTrabalho() {
    }

    public ItemTrabalho(Projeto projeto, String titulo, Instant criadoEm) {
        this.projeto = projeto;
        this.titulo = titulo;
        this.criadoEm = criadoEm;
        this.statusDesde = criadoEm;
    }

    public Long getId() { return id; }
    public Projeto getProjeto() { return projeto; }
    public TarefaDiscovery getTarefaOrigem() { return tarefaOrigem; }
    public void setTarefaOrigem(TarefaDiscovery tarefaOrigem) { this.tarefaOrigem = tarefaOrigem; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }
    public StatusItem getStatus() { return status; }
    void setStatus(StatusItem status) { this.status = status; }
    public int getOrdem() { return ordem; }
    public void setOrdem(int ordem) { this.ordem = ordem; }
    public boolean isImpedido() { return impedido; }
    void setImpedido(boolean impedido) { this.impedido = impedido; }
    public String getMotivoImpedimento() { return motivoImpedimento; }
    void setMotivoImpedimento(String motivoImpedimento) { this.motivoImpedimento = motivoImpedimento; }
    public Instant getImpedidoDesde() { return impedidoDesde; }
    void setImpedidoDesde(Instant impedidoDesde) { this.impedidoDesde = impedidoDesde; }
    public Instant getInicioWip() { return inicioWip; }
    void setInicioWip(Instant inicioWip) { this.inicioWip = inicioWip; }
    public Instant getConcluidoEm() { return concluidoEm; }
    void setConcluidoEm(Instant concluidoEm) { this.concluidoEm = concluidoEm; }
    public Instant getStatusDesde() { return statusDesde; }
    void setStatusDesde(Instant statusDesde) { this.statusDesde = statusDesde; }
    public Instant getCriadoEm() { return criadoEm; }
    public List<SubTarefa> getSubtarefas() { return subtarefas; }
    public List<HistoricoStatus> getHistorico() { return historico; }
}
