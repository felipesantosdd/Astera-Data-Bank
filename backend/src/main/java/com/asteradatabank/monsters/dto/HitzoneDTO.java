package com.asteradatabank.monsters.dto;

/**
 * Representa uma zona de acerto (parte do corpo) de um monstro.
 * Cada valor indica o multiplicador de dano (0–100) naquela parte.
 *
 * Exemplo: head.fire = 45 significa que fogo faz 45% de dano na cabeça.
 */
public record HitzoneDTO(
        String  part,     // nome da parte (ex: "Head", "Body", "Tail")

        // Tipos físicos
        Integer cut,      // corte (espada, lança...)
        Integer impact,   // impacto (martelo, cabeçada...)
        Integer shot,     // projétil (arco, bestas...)

        // Tipos elementais
        Integer fire,
        Integer water,
        Integer thunder,
        Integer ice,
        Integer dragon,

        // KO (atordoamento — só relevante na cabeça)
        Integer ko
) {}
