package br.com.clxj.tracker.shared;

import java.time.Clock;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConfigurationPropertiesScan("br.com.clxj.tracker")
public class AppConfig implements WebMvcConfigurer {

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }

    /** Permite chamadas diretas do frontend em dev (o Next.js normalmente usa proxy/rewrite). */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE");
    }
}
