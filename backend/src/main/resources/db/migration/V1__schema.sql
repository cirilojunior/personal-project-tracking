CREATE TABLE cliente (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(150)  NOT NULL,
    empresa      VARCHAR(150),
    email        VARCHAR(150),
    telefone     VARCHAR(40),
    observacoes  VARCHAR(4000),
    criado_em    TIMESTAMP(6) WITH TIME ZONE NOT NULL
);

CREATE TABLE projeto (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(150)  NOT NULL,
    tema         VARCHAR(150)  NOT NULL,
    descricao    VARCHAR(4000),
    cliente_id   BIGINT,
    status       VARCHAR(30)   NOT NULL,
    data_inicio  DATE,
    criado_em    TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_projeto_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id) ON DELETE SET NULL
);

CREATE TABLE requisito (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    projeto_id    BIGINT        NOT NULL,
    numero        INT           NOT NULL,
    codigo        VARCHAR(20)   NOT NULL,
    titulo        VARCHAR(200)  NOT NULL,
    descricao     VARCHAR(4000),
    tipo          VARCHAR(20)   NOT NULL,
    categoria_nfr VARCHAR(30),
    prioridade    VARCHAR(10)   NOT NULL,
    status        VARCHAR(20)   NOT NULL,
    criado_em     TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_requisito_projeto FOREIGN KEY (projeto_id) REFERENCES projeto (id) ON DELETE CASCADE
);

CREATE TABLE tarefa_discovery (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    projeto_id   BIGINT        NOT NULL,
    titulo       VARCHAR(200)  NOT NULL,
    descricao    VARCHAR(4000),
    prioridade   VARCHAR(10)   NOT NULL,
    status       VARCHAR(20)   NOT NULL,
    criado_em    TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_tarefa_projeto FOREIGN KEY (projeto_id) REFERENCES projeto (id) ON DELETE CASCADE
);

CREATE TABLE tarefa_requisito (
    tarefa_id    BIGINT NOT NULL,
    requisito_id BIGINT NOT NULL,
    PRIMARY KEY (tarefa_id, requisito_id),
    CONSTRAINT fk_tr_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefa_discovery (id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_requisito FOREIGN KEY (requisito_id) REFERENCES requisito (id) ON DELETE CASCADE
);

CREATE TABLE item_trabalho (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    projeto_id          BIGINT        NOT NULL,
    tarefa_origem_id    BIGINT,
    titulo              VARCHAR(200)  NOT NULL,
    descricao           VARCHAR(4000),
    prioridade          VARCHAR(10)   NOT NULL,
    status              VARCHAR(40)   NOT NULL,
    ordem               INT           NOT NULL DEFAULT 0,
    impedido            BOOLEAN       NOT NULL DEFAULT FALSE,
    motivo_impedimento  VARCHAR(1000),
    impedido_desde      TIMESTAMP(6) WITH TIME ZONE,
    inicio_wip          TIMESTAMP(6) WITH TIME ZONE,
    concluido_em        TIMESTAMP(6) WITH TIME ZONE,
    status_desde        TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    criado_em           TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_item_projeto FOREIGN KEY (projeto_id) REFERENCES projeto (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_tarefa FOREIGN KEY (tarefa_origem_id) REFERENCES tarefa_discovery (id) ON DELETE SET NULL
);

CREATE TABLE subtarefa (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id    BIGINT        NOT NULL,
    titulo     VARCHAR(200)  NOT NULL,
    concluida  BOOLEAN       NOT NULL DEFAULT FALSE,
    ordem      INT           NOT NULL DEFAULT 0,
    CONSTRAINT fk_subtarefa_item FOREIGN KEY (item_id) REFERENCES item_trabalho (id) ON DELETE CASCADE
);

CREATE TABLE historico_status (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id          BIGINT       NOT NULL,
    status_anterior  VARCHAR(40),
    status_novo      VARCHAR(40)  NOT NULL,
    ocorrido_em      TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_historico_item FOREIGN KEY (item_id) REFERENCES item_trabalho (id) ON DELETE CASCADE
);

CREATE INDEX idx_projeto_cliente ON projeto (cliente_id);
CREATE INDEX idx_requisito_projeto ON requisito (projeto_id);
CREATE INDEX idx_tarefa_projeto ON tarefa_discovery (projeto_id);
CREATE INDEX idx_item_projeto_status ON item_trabalho (projeto_id, status, ordem);
CREATE INDEX idx_historico_item ON historico_status (item_id, ocorrido_em);
