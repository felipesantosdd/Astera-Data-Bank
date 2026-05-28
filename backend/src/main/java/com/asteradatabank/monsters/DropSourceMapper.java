package com.asteradatabank.monsters;

/**
 * Mapeia a condição em inglês para uma categoria estável usada no agrupamento da UI.
 *
 * Categorias:
 *   carve         — corte do monstro morto (Body/Tail/Horn/etc Carve)
 *   break         — quebra/ferida de parte específica (Break X, Wound X)
 *   questReward   — recompensa de missão (Hunt, Investigation, Appraisal)
 *   shiny         — drops cintilantes
 *   guidingLands  — Guiding Lands (endgame Iceborne)
 *   siege         — Kulve Taroth, Safi'jiiva
 *   palico        — Plunderblade, Palico Bonus, Bandit Mantle
 *   mining        — minerar partes do monstro (Back Mining etc.)
 *   tracking      — Track
 *   other         — qualquer outro
 */
public final class DropSourceMapper {

    public static String fromEnglishCondition(String englishCondition) {
        if (englishCondition == null) return "other";
        String c = englishCondition;

        if (c.startsWith("Break") || c.startsWith("Wound")) return "break";
        if (c.contains("Carve"))                            return "carve";
        if (c.startsWith("Hunt")
                || c.startsWith("Investigation")
                || c.startsWith("Appraisal"))               return "questReward";
        if (c.contains("Shiny") || c.contains("Crystal Mining")) return "shiny";
        if (c.startsWith("Guiding Lands"))                  return "guidingLands";
        if (c.startsWith("Siege"))                          return "siege";
        if (c.equals("Plunderblade")
                || c.equals("Palico Bonus")
                || c.equals("Bandit Mantle"))               return "palico";
        if (c.endsWith("Mining"))                           return "mining";
        if (c.equals("Track"))                              return "tracking";

        return "other";
    }

    private DropSourceMapper() {}
}
