package br.com.clxj.tracker.shared;

public class NaoEncontradoException extends RuntimeException {

    public NaoEncontradoException(String recurso, Long id) {
        super(recurso + " " + id + " não encontrado(a)");
    }
}
