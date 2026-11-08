package br.com.clxj.tracker;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.jayway.jsonpath.JsonPath;

/** Fluxo ponta a ponta pela API: cliente → projeto → Discovery → Delivery → dashboard. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiFluxoCompletoTest {

    @Autowired
    MockMvc mvc;

    @Test
    void fluxoCompleto() throws Exception {
        long clienteId = id(enviar(post("/api/clientes"), """
                {"nome": "Carla Dias", "empresa": "Delta SA", "email": "carla@delta.example"}
                """).andExpect(status().isCreated()));

        long projetoId = id(enviar(post("/api/projetos"), """
                {"nome": "Portal de Pedidos", "tema": "Indústria", "clienteId": %d}
                """.formatted(clienteId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DISCOVERY"))
                .andExpect(jsonPath("$.clienteNome").value("Carla Dias")));

        long rf1 = id(enviar(post("/api/projetos/" + projetoId + "/requisitos"), """
                {"titulo": "Cadastrar pedido", "tipo": "FUNCIONAL", "prioridade": "MUST"}
                """).andExpect(jsonPath("$.codigo").value("RF-001")));
        enviar(post("/api/projetos/" + projetoId + "/requisitos"), """
                {"titulo": "Consultar pedidos", "tipo": "FUNCIONAL"}
                """).andExpect(jsonPath("$.codigo").value("RF-002"));
        enviar(post("/api/projetos/" + projetoId + "/requisitos"), """
                {"titulo": "Resposta em até 2s", "tipo": "NAO_FUNCIONAL", "categoriaNfr": "DESEMPENHO"}
                """)
                .andExpect(jsonPath("$.codigo").value("RNF-001"))
                .andExpect(jsonPath("$.status").value("RASCUNHO"));

        mvc.perform(get("/api/projetos/" + projetoId + "/requisitos").param("tipo", "FUNCIONAL"))
                .andExpect(jsonPath("$", hasSize(2)));

        long tarefaId = id(enviar(post("/api/projetos/" + projetoId + "/tarefas"), """
                {"titulo": "Módulo de pedidos", "prioridade": "ALTA", "requisitoIds": [%d]}
                """.formatted(rf1))
                .andExpect(jsonPath("$.requisitos[0].codigo").value("RF-001"))
                .andExpect(jsonPath("$.itemTrabalho").value(nullValue())));

        long itemId = id(mvc.perform(post("/api/tarefas/" + tarefaId + "/enviar-para-delivery"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SELECIONADO"))
                .andExpect(jsonPath("$.tarefaOrigemId").value(tarefaId)));

        mvc.perform(post("/api/tarefas/" + tarefaId + "/enviar-para-delivery"))
                .andExpect(status().isUnprocessableContent());

        mvc.perform(get("/api/tarefas/" + tarefaId))
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"))
                .andExpect(jsonPath("$.itemTrabalho.id").value(itemId));

        enviar(post("/api/itens/" + itemId + "/subtarefas"), """
                {"titulo": "Criar endpoint"}
                """).andExpect(jsonPath("$.subtarefas", hasSize(1)));

        enviar(post("/api/itens/" + itemId + "/mover"), """
                {"status": "EM_IMPLEMENTACAO", "ordem": 0}
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_IMPLEMENTACAO"))
                .andExpect(jsonPath("$.idadeWipDias").value(0))
                .andExpect(jsonPath("$.nivelAging").value("VERDE"))
                .andExpect(jsonPath("$.historico", hasSize(2)));

        enviar(put("/api/itens/" + itemId + "/impedimento"), """
                {"motivo": "Aguardando acesso ao ambiente"}
                """).andExpect(jsonPath("$.impedido").value(true));

        mvc.perform(get("/api/projetos/" + projetoId + "/board"))
                .andExpect(jsonPath("$.colunas", hasSize(9)))
                .andExpect(jsonPath("$.colunas[3].status").value("EM_IMPLEMENTACAO"))
                .andExpect(jsonPath("$.colunas[3].impedidos").value(1))
                .andExpect(jsonPath("$.colunas[3].itens[0].subtarefasTotal").value(1));

        mvc.perform(get("/api/projetos/" + projetoId))
                .andExpect(jsonPath("$.contagens.requisitos").value(3))
                .andExpect(jsonPath("$.contagens.itensWip").value(1))
                .andExpect(jsonPath("$.contagens.itensImpedidos").value(1));

        mvc.perform(delete("/api/itens/" + itemId + "/impedimento"))
                .andExpect(jsonPath("$.impedido").value(false));

        mvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totais.itensWip").value(1))
                .andExpect(jsonPath("$.requisitosPorTipo.NAO_FUNCIONAL").value(1));
    }

    @Test
    void validacaoENaoEncontrado() throws Exception {
        enviar(post("/api/clientes"), """
                {"nome": "", "email": "invalido"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome").value("Nome é obrigatório"))
                .andExpect(jsonPath("$.erros.email").value("E-mail inválido"));

        mvc.perform(get("/api/projetos/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"));
    }

    private ResultActions enviar(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req, String json)
            throws Exception {
        return mvc.perform(req.contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static long id(ResultActions r) throws Exception {
        Number id = JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.id");
        return id.longValue();
    }
}
