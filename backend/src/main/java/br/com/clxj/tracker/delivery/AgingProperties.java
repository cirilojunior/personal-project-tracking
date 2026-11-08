package br.com.clxj.tracker.delivery;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Faixas de cor do Aging WIP: idade abaixo de {@code limiteAtencaoDias} é verde, até
 * {@code limiteCriticoDias} é amarela e acima disso é vermelha.
 */
@ConfigurationProperties("tracker.aging")
public record AgingProperties(@DefaultValue("5") int limiteAtencaoDias, @DefaultValue("10") int limiteCriticoDias) {
}
