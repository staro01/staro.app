"use client";

import { useState } from "react";
import { colors, card, sectionTitle, sectionSubtitle, sectionHeader } from "./theme";

export function LossCalculator() {
  const [missedCallsPerWeek, setMissedCallsPerWeek] = useState(5);
  const [avgClientValue, setAvgClientValue] = useState(50);

  // Hypothèse transparente : on suppose qu'un appel manqué sur deux
  // aurait été un client (estimation prudente, affichée clairement).
  const conversionAssumption = 0.5;
  const estimatedAnnualLoss = Math.round(
    missedCallsPerWeek * 52 * avgClientValue * conversionAssumption
  );

  return (
    <div style={sectionHeader}>
      <h2 style={sectionTitle}>Combien vous coûtent vos appels manqués ?</h2>
      <p style={sectionSubtitle}>Une estimation simple, à partir de vos propres chiffres.</p>

      <div style={{ ...card, maxWidth: 560, margin: "32px auto 0", padding: 32, textAlign: "left" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ color: colors.text, fontWeight: 700, fontSize: 14 }}>
              Appels manqués par semaine, environ
            </label>
            <span style={{ color: colors.purple2, fontWeight: 900, fontSize: 16 }}>{missedCallsPerWeek}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={missedCallsPerWeek}
            onChange={(e) => setMissedCallsPerWeek(Number(e.target.value))}
            style={{ width: "100%", accentColor: colors.purple2 }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ color: colors.text, fontWeight: 700, fontSize: 14 }}>
              Valeur moyenne d&apos;un client pour vous
            </label>
            <span style={{ color: colors.purple2, fontWeight: 900, fontSize: 16 }}>{avgClientValue}€</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={avgClientValue}
            onChange={(e) => setAvgClientValue(Number(e.target.value))}
            style={{ width: "100%", accentColor: colors.purple2 }}
          />
        </div>

        <div style={{ textAlign: "center", padding: "20px 0 8px", borderTop: `1px solid ${colors.border}` }}>
          <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>Perte estimée par an</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: colors.text }}>
            {estimatedAnnualLoss.toLocaleString("fr-FR")}€
          </div>
          <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
            Estimation basée sur l&apos;hypothèse prudente qu&apos;un appel manqué sur deux
            aurait été un client. Le coût réel peut être supérieur.
          </p>
        </div>
      </div>
    </div>
  );
}
