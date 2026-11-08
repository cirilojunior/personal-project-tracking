package br.com.clxj.tracker.delivery;

import java.time.Instant;

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
public class HistoricoStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false, updatable = false)
    private ItemTrabalho item;

    @Enumerated(EnumType.STRING)
    private StatusItem statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusItem statusNovo;

    @Column(nullable = false)
    private Instant ocorridoEm;

    protected HistoricoStatus() {
    }

    public HistoricoStatus(ItemTrabalho item, StatusItem statusAnterior, StatusItem statusNovo, Instant ocorridoEm) {
        this.item = item;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.ocorridoEm = ocorridoEm;
    }

    public Long getId() { return id; }
    public ItemTrabalho getItem() { return item; }
    public StatusItem getStatusAnterior() { return statusAnterior; }
    public StatusItem getStatusNovo() { return statusNovo; }
    public Instant getOcorridoEm() { return ocorridoEm; }
}
