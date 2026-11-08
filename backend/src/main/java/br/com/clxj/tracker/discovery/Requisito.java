package br.com.clxj.tracker.discovery;

import java.time.Instant;

import br.com.clxj.tracker.projeto.Projeto;
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

@Entity
public class Requisito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projeto_id", nullable = false, updatable = false)
    private Projeto projeto;

    @Column(nullable = false)
    private int numero;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoRequisito tipo;

    @Enumerated(EnumType.STRING)
    private CategoriaNfr categoriaNfr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadeMoscow prioridade = PrioridadeMoscow.SHOULD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusRequisito status = StatusRequisito.RASCUNHO;

    @Column(nullable = false, updatable = false)
    private Instant criadoEm;

    protected Requisito() {
    }

    public Requisito(Projeto projeto, Instant criadoEm) {
        this.projeto = projeto;
        this.criadoEm = criadoEm;
    }

    /** Define tipo e numeração sequencial (por projeto e tipo), gerando o código (ex.: RF-001). */
    public void numerar(TipoRequisito tipo, int numero) {
        this.tipo = tipo;
        this.numero = numero;
        this.codigo = tipo.codigo(numero);
    }

    public Long getId() { return id; }
    public Projeto getProjeto() { return projeto; }
    public int getNumero() { return numero; }
    public String getCodigo() { return codigo; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public TipoRequisito getTipo() { return tipo; }
    public CategoriaNfr getCategoriaNfr() { return categoriaNfr; }
    public void setCategoriaNfr(CategoriaNfr categoriaNfr) { this.categoriaNfr = categoriaNfr; }
    public PrioridadeMoscow getPrioridade() { return prioridade; }
    public void setPrioridade(PrioridadeMoscow prioridade) { this.prioridade = prioridade; }
    public StatusRequisito getStatus() { return status; }
    public void setStatus(StatusRequisito status) { this.status = status; }
    public Instant getCriadoEm() { return criadoEm; }
}
