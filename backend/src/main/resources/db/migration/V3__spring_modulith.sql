-- V3: Tabelas do Spring Modulith
-- O Spring Modulith usa event_publication para rastrear eventos
-- entre módulos de forma transacional (garantia de entrega).

CREATE TABLE IF NOT EXISTS event_publication (
    id               UUID                     NOT NULL PRIMARY KEY,
    listener_id      TEXT                     NOT NULL,
    event_type       TEXT                     NOT NULL,
    serialized_event TEXT                     NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_date  TIMESTAMP WITH TIME ZONE
);
