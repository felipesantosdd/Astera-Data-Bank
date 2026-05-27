package com.asteradatabank;

/**
 * Normalização de códigos de idioma para os 12 suportados pelo banco
 * (ar, de, en, es, fr, it, ja, ko, pl, pt, ru, zh).
 *
 * Aceita variantes locale ("pt-BR", "pt_BR", "en-US"...) e devolve só a parte
 * base do idioma — depois de minúsculas e cortando no primeiro "-" ou "_".
 */
public final class LangUtil {

    private static final String DEFAULT = "en";

    public static String normalize(String lang) {
        if (lang == null || lang.isBlank()) return DEFAULT;
        return lang.toLowerCase().split("[-_]")[0];
    }

    private LangUtil() {}
}
