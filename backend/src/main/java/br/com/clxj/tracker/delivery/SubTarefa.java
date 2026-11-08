package br.com.clxj.tracker.delivery;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "subtarefa")
public class SubTarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false, updatable = false)
    private ItemTrabalho item;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private boolean concluida;

    @Column(nullable = false)
    private int ordem;

    protected SubTarefa() {
    }

    public SubTarefa(ItemTrabalho item, String titulo, int ordem) {
        this.item = item;
        this.titulo = titulo;
        this.ordem = ordem;
    }

    public Long getId() { return id; }
    public ItemTrabalho getItem() { return item; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }
    public int getOrdem() { return ordem; }
    public void setOrdem(int ordem) { this.ordem = ordem; }
}
