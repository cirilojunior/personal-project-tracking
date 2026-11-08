package br.com.clxj.tracker.discovery;

public enum TipoRequisito {
    FUNCIONAL("RF"), NAO_FUNCIONAL("RNF");

    private final String prefixo;

    TipoRequisito(String prefixo) {
        this.prefixo = prefixo;
    }

    public String codigo(int numero) {
        return "%s-%03d".formatted(prefixo, numero);
    }
}
