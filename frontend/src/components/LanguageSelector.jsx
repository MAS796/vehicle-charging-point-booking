import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSelector({ compact = false }) {
  const { i18n, t } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? "0" : "8px",
        color: "#cbd5e1",
      }}
    >
      {!compact && <span style={{ fontSize: "0.9rem" }}>{t("language")}:</span>}
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          padding: compact ? "6px 8px" : "6px 12px",
          borderRadius: "8px",
          background: compact ? "rgba(7, 26, 57, 0.72)" : "#1e293b",
          color: "#fff",
          border: compact ? "1px solid rgba(142, 195, 255, 0.45)" : "1px solid #334155",
          cursor: "pointer",
          minWidth: compact ? "72px" : "auto",
        }}
      >
        <option value="en">{compact ? "EN" : "English (en)"}</option>
        <option value="hi">{compact ? "HI" : "Hindi (hi)"}</option>
        <option value="ta">{compact ? "TA" : "Tamil (ta)"}</option>
        <option value="te">{compact ? "TE" : "Telugu (te)"}</option>
        <option value="kn">{compact ? "KN" : "Kannada (kn)"}</option>
        <option value="ml">{compact ? "ML" : "Malayalam (ml)"}</option>
        <option value="bn">{compact ? "BN" : "Bengali (bn)"}</option>
        <option value="mr">{compact ? "MR" : "Marathi (mr)"}</option>
        <option value="gu">{compact ? "GU" : "Gujarati (gu)"}</option>
        <option value="es">{compact ? "ES" : "Spanish (es)"}</option>
        <option value="fr">{compact ? "FR" : "French (fr)"}</option>
        <option value="ar">{compact ? "AR" : "Arabic (ar)"}</option>
        <option value="ja">{compact ? "JA" : "Japanese (ja)"}</option>
      </select>
    </label>
  );
}
