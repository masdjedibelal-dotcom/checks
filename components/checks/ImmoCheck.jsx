"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard, SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckKitResultGrid } from "@/components/checks/CheckKitResultGrid";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";

(() => {
  const s = document.createElement("style");
  s.textContent = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;
  document.head.appendChild(s);
})();

/** Traum-Realitäts-Check: Zwischen Weiche und Risiko-Scanner */
const PATH_INTRO_STORY = {
  suche:
    "Der erste Schritt zum Eigenheim ist getan. Wir berechnen jetzt Ihre finanzielle Belastbarkeit, damit Ihr Traum auf einem sicheren Fundament steht.",
  bau: "Baustellen sind dynamisch – und risikoreich. Wir scannen jetzt die Haftungsfallen für Sie und Ihre Helfer, damit Sie sich auf das Wesentliche konzentrieren können.",
  bestand:
    "Ihr Zuhause ist Ihr wertvollster Besitz. Wir prüfen jetzt, ob Ihr Schutz noch zu den aktuellen Baukosten und Ihrer Lebensplanung passt.",
};

const IMMO_TUV_MESSAGES = [
  "Abgleich der Kreditauflagen mit der Risikovorsorge...",
  "Kalkulation des Wiederaufbauwerts (Neubauwert 2026)...",
  "Haftungs-Scan für Grundstück und Bauphase...",
  "Raten-Resilienz bei Einkommensausfall prüfen...",
];

const IMMO_FAMILY_SCAN_LINE = "Prüfe Erbschaftsschutz und Familiensicherheit...";

const IMMO_SCAN_MS = 3000;
const IMMO_FINAL_MS = 650;

/** Schematisch: sinkende Restschuld vs. wachsender Schutzraum (Risikoleben) */
function ImmoCreditSchutzGraph({ accent, progress }) {
  const t = Math.min(1, progress / 100);
  const schuldW = 28 + 62 * (1 - t);
  return (
    <div style={{ width: "min(168px, 100%)", margin: "20px auto 0" }}>
      <div style={{ fontSize: "10px", fontWeight: "600", color: "#6B7280", marginBottom: "8px", textAlign: "center" }}>
        Kredit und Absicherung (schematisch)
      </div>
      <div style={{ fontSize: "9px", color: "#9CA3AF", marginBottom: "4px" }}>Restschuld</div>
      <div
        style={{
          height: "10px",
          borderRadius: "6px",
          background: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${schuldW}%`,
            height: "100%",
            background: "linear-gradient(90deg, #9CA3AF, #D1D5DB)",
            borderRadius: "6px",
            transition: "width 0.08s linear",
          }}
        />
      </div>
      <div style={{ fontSize: "9px", color: "#9CA3AF", marginTop: "10px", marginBottom: "4px" }}>Schutzraum Risikoleben</div>
      <div
        style={{
          height: "10px",
          borderRadius: "6px",
          background: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${100 * t}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${accent}99, ${accent}55)`,
            borderRadius: "6px",
            transition: "width 0.08s linear",
          }}
        />
      </div>
    </div>
  );
}

function ImmoTuvScanLoader({ accent, onComplete, familyContext = false, showCreditGraph = false }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const messages = useMemo(() => {
    const m = [...IMMO_TUV_MESSAGES];
    if (familyContext) m.splice(2, 0, IMMO_FAMILY_SCAN_LINE);
    return m;
  }, [familyContext]);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const n = messages.length;
    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / IMMO_SCAN_MS) * 100);
      setProgress(p);
      const idx = Math.min(n - 1, Math.floor((elapsed / IMMO_SCAN_MS) * n));
      setMsgIdx(idx);
      if (elapsed < IMMO_SCAN_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setShowFinal(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [messages]);

  useEffect(() => {
    if (!showFinal) return;
    const t = window.setTimeout(() => onCompleteRef.current?.(), IMMO_FINAL_MS);
    return () => clearTimeout(t);
  }, [showFinal]);

  const line = showFinal
    ? "Ihre Immobilien-Schutz-Strategie ist fertig."
    : messages[msgIdx];

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "calc(100vh - 58px)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "36px 24px 32px",
        fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: accent,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Sicherheits-Architektur
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: "800",
          color: "#111827",
          textAlign: "center",
          lineHeight: 1.35,
          marginBottom: "28px",
          maxWidth: "300px",
          letterSpacing: "-0.3px",
        }}
      >
        Prüfung Ihres Immobilien-Projekts
      </div>

      <div
        style={{
          width: 100,
          height: 108,
          margin: "0 auto 28px",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 6,
            height: `${Math.max(0, progress)}%`,
            maxHeight: "88px",
            background: `linear-gradient(to top, ${accent}66, ${accent}18)`,
            borderTop: `3px solid ${accent}`,
            borderRadius: "6px 6px 0 0",
            boxShadow: `0 -4px 20px ${accent}33`,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "56px",
            lineHeight: 1,
            paddingBottom: 4,
            filter: showFinal ? "none" : "grayscale(0.15)",
          }}
          aria-hidden
        >
          🏠
        </div>
      </div>

      {showCreditGraph && !showFinal && <ImmoCreditSchutzGraph accent={accent} progress={progress} />}

      <div
        key={showFinal ? "f" : msgIdx}
        className="fade-in"
        style={{
          fontSize: "14px",
          fontWeight: showFinal ? "700" : "600",
          color: showFinal ? accent : "#374151",
          textAlign: "center",
          lineHeight: 1.55,
          maxWidth: "320px",
          minHeight: "4.5em",
        }}
      >
        {line}
      </div>
      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "14px", textAlign: "center" }}>
        Technischer Abgleich · keine rechtsverbindliche Bewertung
      </div>
    </div>
  );
}

const PATHS = [
  {
    id: "suche",
    icon: "🔍",
    label: "Ich plane / suche noch",
    sub: "Fokus: Finanzierungsschutz & Nebenkosten-Check.",
  },
  {
    id: "bau",
    icon: "🏗️",
    label: "Ich baue oder saniere gerade",
    sub: "Fokus: Haftung auf der Baustelle & Bauwesen.",
  },
  {
    id: "bestand",
    icon: "🏡",
    label: "Ich besitze bereits / ziehe ein",
    sub: "Fokus: Gebäudeversicherung & Instandhaltung.",
  },
];

/** Scoring + Spalten (Immobilienabsicherung): Bank & Existenz | Objektschutz | Zukunft & Recht */
function buildImmoEmpfehlungen(path, a) {
  const bauphase = path === "bau";
  const fin = a.finanzierung === true;
  const rate = Math.round(a.monatsrate || 0);
  const rateStr = rate > 0 ? String(rate) : "…";

  const bank = [];
  const existenz = [];
  const werterhalt = [];

  const push = (col, item) => {
    if (col === "bank") bank.push(item);
    else if (col === "existenz") existenz.push(item);
    else werterhalt.push(item);
  };

  if (fin) {
    const rlvScore = 999;
    const rlvBase =
      "Schutz vor Zwangsversteigerung durch Einkommensverlust: Bei Tod oder dauerhaftem Wegfall des Einkommens droht der Verlust der Immobilie — die Restschuld bleibt für Angehörige bestehen.";
    const rlvFam =
      a.haushaltAbgesichert
        ? " Mit Kindern oder Partner im Haushalt steigt die Bedeutung einer klaren Kreditschutz-Lösung."
        : "";
    push("bank", {
      key: "rlv",
      score: rlvScore,
      title: "Risikolebensversicherung (Kreditschutz)",
      text: rlvBase + rlvFam,
    });
    let buScore = 960;
    if (a.haushaltAbgesichert) buScore += 140;
    const buRateText =
      rate > 0
        ? `Sichert die monatliche Kreditrate von ca. ${rateStr} € auch bei Krankheit ab.`
        : "Sichert Ihre Ratenfähigkeit auch bei Krankheit ab.";
    push("bank", {
      key: "bu",
      score: buScore,
      title: "Berufsunfähigkeitsversicherung (Raten-Garantie)",
      text: `${buRateText} Als Ratenabsicherung (BU): Fällt Ihr Einkommen dauerhaft weg, ist das Haus langfristig gefährdet.`,
    });
  }

  if (path === "suche" || path === "bestand" || path === "bau") {
    push("bank", {
      key: "wg",
      score: fin ? 640 : 420,
      title: bauphase ? "Wohngebäudeversicherung (Feuer / Rohbau)" : "Wohngebäudeversicherung",
      text: bauphase
        ? "Für Rohbau und Fertigstellung: Feuer, Leitungswasser, Sturm — typische Bankauflage und Kernschutz fürs entstehende Gebäude."
        : "Pflichtschutz fürs Eigenheim — Versicherungssumme und Elementarschutz regelmäßig mit Wiederherstellungskosten abstimmen.",
    });
  }

  if (bauphase) {
    push("existenz", {
      key: "bauherr",
      score: 999,
      title: "Bauherrenhaftpflicht",
      text: "Haftung auf der Baustelle (Passanten, Nachbarn, fremdes Eigentum) — ohne eigenen Baustellen-Schutz drohen hohe Schadenssummen.",
    });
  }

  push("existenz", {
    key: "gh",
    score: path === "bestand" || path === "bau" ? 520 : 280,
    title: "Haus- & Grundbesitzerhaftpflicht",
    text: "Schäden von Grundstück und Gebäude (z. B. Eisglätte, Ast auf fremdem Auto) — eng mit Eigentum verknüpft.",
  });

  push("existenz", {
    key: "elementar",
    score: path === "bestand" || bauphase ? 480 : 220,
    title: "Elementarschaden-Zusatz",
    text: "Starkregen, Überschwemmung, Rückstau — Standarddeckung reicht oft nicht; ZÜRS-Gefahrenlage beachten.",
  });

  if (a.pvWallbox) {
    push("existenz", {
      key: "pv",
      score: 460,
      title: "Photovoltaik-Schutz & Elektronik",
      text: "PV-Module, Wechselrichter, Wallbox — oft Zusatzbaustein oder Anpassung der Gebäude-/Hausratlogik nötig.",
    });
  }

  if (bauphase && a.eigenleistung) {
    push("existenz", {
      key: "bauhelfer",
      score: 550,
      title: "Bauhelfer-Unfallversicherung",
      text: "Wenn Sie oder Helfer am Bau mitarbeiten: Gesetzliche Unfalldeckung greift oft nicht wie bei gewerblichen Betrieben.",
    });
  }

  const showPflege =
    a.erbeGeplant === true || a.altersvorsorgeImmobilie === true || a.age >= 40;
  if (showPflege) {
    let ps = 480;
    if (a.erbeGeplant) ps += 220;
    if (a.altersvorsorgeImmobilie) ps += 160;
    if (a.age >= 50) ps += 80;
    if (path === "bestand") ps += 60;
    else if (bauphase) ps += 30;
    push("existenz", {
      key: "pflege",
      score: ps,
      title: "Pflegezusatzversicherung (Vermögenserhalt)",
      text: "Schützt Ihr Eigenheim davor, im Pflegefall zur Deckung der Heimkosten veräußert werden zu müssen — Erhalt der Immobilie für die Erben. Das Haus ist im Alter oft das einzige nennenswerte Vermögen; im Pflegefall droht, dass es für Heimkosten „aufgefressen“ wird.",
    });
  }

  if (bauphase || path === "bestand") {
    push("werterhalt", {
      key: "rs",
      score: 420,
      title: "Rechtsschutz für Eigentümer & Vermieter",
      text: "Schutz bei Rechtsstreitigkeiten rund um Baugenehmigungen, Handwerkerpfusch oder Nachbarschaftsrecht.",
    });
  }

  const sortDesc = (arr) => [...arr].sort((x, y) => y.score - x.score);
  return {
    bank: sortDesc(bank),
    existenz: sortDesc(existenz),
    werterhalt: sortDesc(werterhalt),
  };
}

/** Phase 3: drei Dringlichkeitsstufen (intern nach Gewichtung) */
function bucketImmoEmpfehlungenByScore(emp) {
  const all = [...emp.bank, ...emp.existenz, ...emp.werterhalt];
  const seen = new Set();
  const unique = all.filter((it) => {
    if (seen.has(it.key)) return false;
    seen.add(it.key);
    return true;
  });
  const pflicht = unique.filter((i) => i.score > 700).sort((a, b) => b.score - a.score);
  const standard = unique.filter((i) => i.score >= 300 && i.score <= 700).sort((a, b) => b.score - a.score);
  const optional = unique.filter((i) => i.score < 300).sort((a, b) => b.score - a.score);
  return { pflicht, standard, optional };
}

/** Kurz „Warum?“ für Info-Icon an Empfehlungskarten (Phase 3) */
const IMMO_WHY_HINTS = {
  rlv: "Warum Risikoleben? Die Bank verlangt oft eine Absicherung des Kredits — ohne Police bleibt die Restschuld im Todesfall bei Angehörigen.",
  bu: "Warum BU? Ohne Einkommen werden Raten schnell zur Belastung — die Immobilie und der Kreditvertrag stehen dann unter Druck.",
  wg: "Warum Wohngebäude? Schäden am Gebäude treffen Eigenkapital und Bankvorgaben — die Summe sollte zu Wiederherstellungskosten passen.",
  bauherr: "Warum Bauherren-Haftpflicht? Auf der Baustelle haften Sie schnell für Schäden an Dritten — ohne eigenen Schutz drohen hohe Forderungen.",
  gh: "Warum Haus- & Grundbesitzer-Haftpflicht? Schäden, die von Ihrem Grundstück ausgehen, können Sie persönlich treffen.",
  elementar: "Warum Elementar? Starkregen, Überschwemmung und Rückstau sind oft eingeschränkt abgedeckt — der Zusatz schützt Ihr gebautes Kapital.",
  pv: "Warum PV/Wallbox-Schutz? Module, Wechselrichter und Wallbox sind technische Sonderrisiken — oft braucht es Zusatzdeckung oder Anpassung.",
  bauhelfer: "Warum Bauhelfer-Unfall? Bei Eigen- und Freiwilligenarbeit greift die gesetzliche Unfallversicherung meist anders als auf der gewerblichen Baustelle.",
  pflege: "Warum Pflegezusatz? Im Pflegefall kann Vermögen und Immobilie angezapft werden — der Zusatz hilft, das Eigenheim für die Familie zu erhalten.",
  rs: "Warum Eigentümer-Rechtsschutz? Streit mit Behörden, Handwerkern oder Nachbarn kostet Geld und Nerven — und kann den Werterhalt gefährden.",
};

function ImmoResultProductCard({ item, accent }) {
  const [open, setOpen] = useState(false);
  const why = IMMO_WHY_HINTS[item.key];

  return (
    <div style={CHECKKIT2026.resultCard}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: 1.3, flex: 1 }}>{item.title}</div>
        {why && (
          <button
            type="button"
            aria-expanded={open}
            aria-label="Kurz erklärt: Warum diese Empfehlung?"
            title={why}
            onClick={() => setOpen((v) => !v)}
            style={{
              flexShrink: 0,
              width: "26px",
              height: "26px",
              borderRadius: "999px",
              border: `1.5px solid ${accent}55`,
              background: `${accent}10`,
              color: accent,
              fontSize: "13px",
              fontWeight: "800",
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            i
          </button>
        )}
      </div>
      {open && why && (
        <div
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#4B5563",
            lineHeight: 1.55,
            marginBottom: "10px",
            padding: "10px 12px",
            borderRadius: "10px",
            background: `${accent}0d`,
            border: `1px solid ${accent}22`,
          }}
        >
          {why}
        </div>
      )}
      <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.6 }}>{item.text}</div>
    </div>
  );
}

function makeImmoCheckT(C) {
  return {
    page: {
      minHeight: "100vh",
      background: "#fff",
      fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    header: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid #e8e8e8",
      padding: "0 24px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoMk: {
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      background: C,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      fontSize: "11px",
      fontWeight: "500",
      color: "#888",
      letterSpacing: "0.3px",
      textTransform: "uppercase",
    },
    prog: { height: "2px", background: "#f0f0f0" },
    progFil: (w) => ({
      height: "100%",
      width: `${w}%`,
      background: C,
      transition: "width 0.4s ease",
    }),
    hero: { padding: "32px 24px 16px" },
    eyebrow: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#999",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: "6px",
    },
    h1: {
      fontSize: "22px",
      color: "#111",
      lineHeight: 1.25,
      ...CHECKKIT_HERO_TITLE_TYPO,
    },
    body: { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
    section: { padding: "0 24px", marginBottom: "20px" },
    card: { border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" },
    row: { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
    rowLast: { padding: "14px 16px" },
    fldLbl: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#444",
      display: "block",
      marginBottom: "8px",
    },
    fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
    footer: {
      position: "sticky",
      bottom: 0,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderTop: "1px solid #e8e8e8",
      padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))",
    },
    btnPrim: (d) => ({
      width: "100%",
      padding: "13px 20px",
      background: d ? "#e8e8e8" : C,
      color: d ? "#aaa" : "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: d ? "default" : "pointer",
    }),
    btnSec: {
      width: "100%",
      padding: "10px",
      color: "#aaa",
      fontSize: "13px",
      marginTop: "6px",
      cursor: "pointer",
    },
    infoBox: {
      padding: "12px 14px",
      background: "#f9f9f9",
      borderRadius: "8px",
      fontSize: "12px",
      color: "#666",
      lineHeight: 1.6,
    },
    inputEl: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e8e8e8",
      borderRadius: "6px",
      fontSize: "14px",
      color: "#111",
      background: "#fff",
      outline: "none",
    },
    resultHeroWarm: {
      padding: "36px 24px 28px",
      textAlign: "center",
      background: "#ffffff",
      borderBottom: "1px solid rgba(17,24,39,0.06)",
    },
    resultBadge: (accent) => ({
      display: "inline-block",
      fontSize: "11px",
      fontWeight: "700",
      color: accent,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginBottom: "12px",
      padding: "6px 14px",
      borderRadius: "999px",
      background: `${accent}18`,
      border: `1px solid ${accent}40`,
    }),
    resultH1: {
      fontSize: "23px",
      color: "#111827",
      lineHeight: 1.2,
      marginBottom: "10px",
      maxWidth: "400px",
      marginLeft: "auto",
      marginRight: "auto",
      ...CHECKKIT_HERO_TITLE_TYPO,
    },
    resultNum: (accent) => ({
      fontSize: "48px",
      fontWeight: "800",
      color: accent,
      letterSpacing: "-2px",
      lineHeight: 1,
      marginBottom: "8px",
    }),
    resultLead: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: 1.55,
      maxWidth: "360px",
      margin: "0 auto 8px",
    },
    sectionLbl: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#6B7280",
      marginBottom: "12px",
    },
  };
}

function BoolRow({ label, hint, value, onChange, accent }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>{label}</div>
      {hint && (
        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "8px", lineHeight: 1.45 }}>{hint}</div>
      )}
      <div style={{ display: "flex", gap: "10px" }}>
        {[
          { v: true, l: "Ja" },
          { v: false, l: "Nein" },
        ].map(({ v, l }) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "10px",
              border: `2px solid ${value === v ? accent : "#e5e7eb"}`,
              background: value === v ? `${accent}12` : "#fff",
              color: value === v ? accent : "#6b7280",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ImmoCheck() {
  const MAKLER = useCheckConfig();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => makeImmoCheckT(C), [C]);
  const isDemo = isCheckDemoMode();

  const [phase, setPhase] = useState(1);
  const [scr2, setScr2] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Nach Weg-Wahl: Story-Screen vor Phase 2 */
  const [pathIntroDone, setPathIntroDone] = useState(false);
  const [fd, setFd] = useState({ name: "", email: "", tel: "" });
  const [kontaktConsent, setKontaktConsent] = useState(false);

  const [path, setPath] = useState("");
  const [finanzierung, setFinanzierung] = useState(null);
  const [pvWallbox, setPvWallbox] = useState(null);
  const [eigenleistung, setEigenleistung] = useState(null);
  const [haushaltAbgesichert, setHaushaltAbgesichert] = useState(null);
  const [erbeGeplant, setErbeGeplant] = useState(null);
  const [altersvorsorgeImmobilie, setAltersvorsorgeImmobilie] = useState(null);
  const [age, setAge] = useState(42);
  const [monatsrate, setMonatsrate] = useState(1450);

  const goTo = (ph, scr2Init = 1) => {
    setAk((k) => k + 1);
    setPhase(ph);
    setScr2(scr2Init);
    if (ph === 1) {
      setLoading(false);
      setPathIntroDone(false);
    }
  };

  const bauphase = path === "bau";
  const answers = useMemo(
    () => ({
      finanzierung,
      pvWallbox,
      eigenleistung,
      haushaltAbgesichert,
      erbeGeplant,
      altersvorsorgeImmobilie,
      age,
      monatsrate,
    }),
    [
      finanzierung,
      pvWallbox,
      eigenleistung,
      haushaltAbgesichert,
      erbeGeplant,
      altersvorsorgeImmobilie,
      age,
      monatsrate,
    ],
  );

  const empfehlungen = useMemo(
    () => (path ? buildImmoEmpfehlungen(path, answers) : { bank: [], existenz: [], werterhalt: [] }),
    [path, answers],
  );

  const empfehlungBuckets = useMemo(() => bucketImmoEmpfehlungenByScore(empfehlungen), [empfehlungen]);

  const totalEmpf =
    empfehlungen.bank.length + empfehlungen.existenz.length + empfehlungen.werterhalt.length;

  const step2CompleteScr1 =
    finanzierung !== null &&
    pvWallbox !== null &&
    (!bauphase || eigenleistung !== null);
  const step2CompleteScr2 =
    haushaltAbgesichert !== null &&
    erbeGeplant !== null &&
    altersvorsorgeImmobilie !== null;
  const step2Complete = scr2 === 1 ? step2CompleteScr1 : step2CompleteScr2;

  const totalSteps = 5;
  const curStep =
    phase === 1
      ? pathIntroDone
        ? 2
        : 1
      : phase === 2
        ? 2 + scr2
        : 5;

  useCheckScrollToTop([phase, ak, danke, scr2, loading, pathIntroDone]);

  const Header = () => (
    <>
      <div style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMk}>
            <MaklerFirmaAvatarInitials firma={MAKLER.firma} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{MAKLER.firma}</span>
        </div>
        <span style={T.badge}>Immobilienabsicherung</span>
      </div>
      <div style={T.prog}>
        <div style={T.progFil(Math.round((curStep / totalSteps) * 100))} />
      </div>
    </>
  );

  const nextP2 = () => {
    if (scr2 < 2) {
      setAk((k) => k + 1);
      setScr2(2);
    } else setLoading(true);
  };
  const backP2 = () => {
    if (scr2 > 1) {
      setAk((k) => k + 1);
      setScr2(1);
    } else {
      setAk((k) => k + 1);
      setPhase(1);
      setScr2(1);
      setPathIntroDone(true);
    }
  };

  const ResultCol = ({ emoji, wallTitle, pillarTitle, wallDesc, bg, items }) => (
    <div style={{ ...CHECKKIT2026.resultColumnStack, background: bg }}>
      <div>
        <div style={{ fontSize: "14px", fontWeight: "800", color: "#1F2937", lineHeight: 1.3 }}>
          {emoji} {wallTitle}
        </div>
        <div style={{ fontSize: "11px", fontWeight: "700", color: C, marginTop: "6px", letterSpacing: "0.02em" }}>{pillarTitle}</div>
        <div style={{ fontSize: "11px", fontWeight: "500", color: "#6B7280", marginTop: "6px", lineHeight: 1.5 }}>{wallDesc}</div>
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#9CA3AF", fontStyle: "italic", padding: "6px 4px" }}>Keine Priorität in dieser Säule.</div>
      ) : (
        items.map((it) => <ImmoResultProductCard key={it.key} item={it} accent={C} />)
      )}
    </div>
  );

  if (danke) {
    return (
      <div style={{ ...T.page, "--accent": C }}>
        <Header />
        <div style={{ padding: "48px 24px", textAlign: "center" }} className="fade-in">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: `1.5px solid ${C}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#111", marginBottom: "8px" }}>
            {fd.name ? `Danke, ${fd.name.split(" ")[0]}.` : "Anfrage gesendet."}
          </div>
          <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, marginBottom: "32px" }}>
            Wir melden uns mit den nächsten Schritten zu Ihrem Immobilien-Schutz.
          </div>
          <button
            type="button"
            onClick={() => {
              setDanke(false);
              setPath("");
              setFinanzierung(null);
              setPvWallbox(null);
              setEigenleistung(null);
              setHaushaltAbgesichert(null);
              setErbeGeplant(null);
              setAltersvorsorgeImmobilie(null);
              goTo(1);
            }}
            style={{ marginTop: "20px", fontSize: "13px", color: "#aaa", cursor: "pointer", background: "none", border: "none" }}
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak}>
        <Header />
        <ImmoTuvScanLoader
          accent={C}
          familyContext={haushaltAbgesichert === true}
          showCreditGraph={finanzierung === true}
          onComplete={() => {
            setLoading(false);
            goTo(3);
          }}
        />
      </div>
    );
  }

  if (phase === 4) {
    const valid = fd.name.trim() && fd.email.trim() && kontaktConsent;
    const pathLabel = PATHS.find((p) => p.id === path);
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />
        <div style={T.hero}>
          <div style={T.eyebrow}>Kontakt</div>
          <div style={T.h1}>Immobilienabsicherung besprechen</div>
          <div style={T.body}>Wir gehen Ihre Prioritäten mit Ihnen durch — unverbindlich.</div>
        </div>
        {isDemo ? (
          <>
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>Live-Vorschau</div>
              <button
                type="button"
                style={{ ...T.btnPrim(false) }}
                onClick={() => window.parent.postMessage({ type: "openConfig", slug: "immobilien-check" }, "*")}
              >
                Anpassen & kaufen
              </button>
            </div>
            <div style={T.footer}>
              <button type="button" style={T.btnSec} onClick={() => goTo(3)}>
                Zurück
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={T.section}>
              <CheckKontaktLeadLine />
              <div style={T.card}>
                {[
                  { k: "name", l: "Ihr Name", t: "text", ph: "Vor- und Nachname", req: true },
                  { k: "email", l: "E-Mail", t: "email", ph: "ihre@email.de", req: true },
                  { k: "tel", l: "Telefon", t: "tel", ph: "Optional", req: false, hint: "Optional" },
                ].map(({ k, l, t, ph, req, hint }, i, arr) => (
                  <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
                    <label style={T.fldLbl}>
                      {l}
                      {req ? " *" : ""}
                    </label>
                    <input
                      type={t}
                      placeholder={ph}
                      value={fd[k]}
                      onChange={(e) => setFd((f) => ({ ...f, [k]: e.target.value }))}
                      style={{ ...T.inputEl, marginTop: "4px" }}
                    />
                    {hint && <div style={T.fldHint}>{hint}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "14px", marginBottom: "100px" }}>
                <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
              </div>
            </div>
            <div style={T.footer}>
              <button
                type="button"
                style={T.btnPrim(!valid)}
                disabled={!valid}
                onClick={async () => {
                  if (!valid) return;
                  const token = new URLSearchParams(window.location.search).get("token");
                  if (token) {
                    await fetch("/api/lead", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        token,
                        slug: "immobilien-check",
                        kundenName: fd.name,
                        kundenEmail: fd.email,
                        kundenTel: fd.tel || "",
                        highlights: [
                          ...(pathLabel
                            ? [{ label: "Situation", value: `${pathLabel.icon} ${pathLabel.label}` }]
                            : []),
                          { label: "Anzahl Empfehlungen", value: String(totalEmpf) },
                        ],
                      }),
                    }).catch(() => {});
                  }
                  setDanke(true);
                }}
              >
                {valid ? "Termin sichern" : "Bitte ausfüllen"}
              </button>
              <button type="button" style={T.btnSec} onClick={() => goTo(3)}>
                Zurück
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === 3) {
    const pathLabel = PATHS.find((p) => p.id === path);
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />
        <div style={T.resultHeroWarm}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              margin: "0 auto 14px",
              background: `${C}16`,
              border: `2px solid ${C}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              lineHeight: 1,
            }}
            aria-hidden
          >
            🛡️
          </div>
          <div style={T.resultBadge(C)}>Immobilienabsicherung · Priorisierte Empfehlungen</div>
          <div style={T.resultH1}>Ihr Plan für ein sorgenfreies Zuhause.</div>
          <div style={T.resultNum(C)}>{totalEmpf}</div>
          <div style={T.resultLead}>
            Empfehlungen in drei Spalten: Existenz und Pflicht, wichtiger Standard sowie optionaler Plus-Schutz — abgeleitet aus Ihren Angaben im Risiko-Scanner.
          </div>
          {pathLabel && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                background: "#fff",
                borderRadius: "999px",
                border: "1px solid rgba(17,24,39,0.1)",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              <span>{pathLabel.icon}</span>
              <span>{pathLabel.label}</span>
            </div>
          )}
        </div>

        <div style={{ ...T.section, marginTop: "10px" }}>
          <CheckKitResultGrid>
            <ResultCol
              emoji="🔴"
              wallTitle="Existenz / Pflicht"
              pillarTitle="Unverzichtbare Bausteine"
              wallDesc="Höchste Dringlichkeit — ohne diese Bausteine drohen die größten Lücken."
              bg={CHECKKIT2026.colExistenz}
              items={empfehlungBuckets.pflicht}
            />
            <ResultCol
              emoji="🟡"
              wallTitle="Wichtiger Standard"
              pillarTitle="Zeitnah sinnvoll"
              wallDesc="Solide Absicherung, die in vielen Fällen bald relevant wird."
              bg={CHECKKIT2026.colStandard}
              items={empfehlungBuckets.standard}
            />
            <ResultCol
              emoji="⚪"
              wallTitle="Optional / Plus"
              pillarTitle="Nach Bedarf"
              wallDesc="Ergänzungen je nach Lebenslage — weniger dringend, aber klug abzuwägen."
              bg={CHECKKIT2026.colPlus}
              items={empfehlungBuckets.optional}
            />
          </CheckKitResultGrid>
        </div>

        <div style={{ padding: "0 24px", marginBottom: "120px" }}>
          <CheckBerechnungshinweis>
            <>
              Priorisierung nach Dringlichkeit: Bei Finanzierung Risikoleben und eine starke BU (Ratenabsicherung); in der Bauphase die Bauherrenhaftpflicht; bei PV/Wallbox der Photovoltaik-Schutz; bei Erbe, Altersvorsorge-Immobilie oder höherem Alter die Pflege-Vorsorge; bei Bau oder Bestand der Eigentümer-Rechtsschutz unter <strong>Zukunft &amp; Recht</strong>. Keine individuelle Rechtsberatung.{" "}
              <span style={{ color: "#b8884a" }}>Orientierung für Ihr Gespräch mit dem Makler.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "12px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>
        <div style={T.footer}>
          <button type="button" style={T.btnPrim(false)} onClick={() => goTo(4)}>
            Gemeinsam vertiefen
          </button>
          <button type="button" style={T.btnSec} onClick={() => goTo(1)}>
            Zurück
          </button>
        </div>
      </div>
    );
  }

  if (phase === 2) {
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />
        {scr2 === 1 ? (
          <>
            <div style={T.hero}>
              <div style={T.eyebrow}>Risiko-Scanner</div>
              <div style={T.h1}>Kritische Eckpunkte</div>
              <div style={T.body}>Diese Antworten steuern Ihre Empfehlungen.</div>
            </div>
            <div style={{ padding: "0 20px", marginBottom: "120px" }}>
              <div style={T.card}>
                <div style={T.rowLast}>
                  <BoolRow
                    label="Wird die Immobilie finanziert?"
                    hint="Bei Ja priorisieren wir Risikoleben (Kreditschutz) und BU als Ratenabsicherung."
                    value={finanzierung}
                    onChange={setFinanzierung}
                    accent={C}
                  />
                  {finanzierung === true && (
                    <div style={{ marginTop: "8px" }}>
                      <label style={T.fldLbl}>Ungefähre monatliche Kreditrate (für den Hinweistext)</label>
                      <SliderCard
                        label="Rate / Monat"
                        value={monatsrate}
                        min={400}
                        max={6000}
                        step={50}
                        unit="€"
                        display={`${monatsrate} €`}
                        accent={C}
                        onChange={setMonatsrate}
                      />
                    </div>
                  )}
                  <BoolRow
                    label="PV-Anlage oder Wallbox am Objekt?"
                    hint="Bei Ja rücken Photovoltaik- und Elektronik-Themen in den Fokus."
                    value={pvWallbox}
                    onChange={setPvWallbox}
                    accent={C}
                  />
                  {bauphase && (
                    <BoolRow
                      label="Packen Sie oder Freunde bei Bau/Sanierung selbst mit an?"
                      hint="Bei Ja empfehlen wir den Hinweis Bauhelfer-Unfall."
                      value={eigenleistung}
                      onChange={setEigenleistung}
                      accent={C}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={T.hero}>
              <div style={T.eyebrow}>Vorsorge</div>
              <div style={T.h1}>Familie & Vermögensziel</div>
              <div style={T.body}>Damit wir Risikoleben, BU und Pflege sinnvoll gewichten.</div>
            </div>
            <div style={{ padding: "0 20px", marginBottom: "120px" }}>
              <div style={T.card}>
                <div style={T.rowLast}>
                  <BoolRow
                    label="Werden im Haushalt Kinder oder Partner durch Ihr Einkommen mit abgesichert?"
                    hint="Bei Ja erhöhen wir das Gewicht von Risikoleben und BU in der Einordnung."
                    value={haushaltAbgesichert}
                    onChange={setHaushaltAbgesichert}
                    accent={C}
                  />
                  <BoolRow
                    label="Ist das Haus als Erbe / für die nächste Generation vorgesehen?"
                    hint="Bei Ja stärken wir die Pflege-Vorsorge (Vermögenserhalt) — Verkauf des Erbes im Pflegefall vermeiden."
                    value={erbeGeplant}
                    onChange={setErbeGeplant}
                    accent={C}
                  />
                  <BoolRow
                    label="Ist die Immobilie Teil Ihrer Altersvorsorge (z. B. schuldenfreies Wohnen im Alter)?"
                    hint="Bei Ja fließt die Pflege-Zusatzversicherung stärker in die Empfehlung ein (Vermögensschutz)."
                    value={altersvorsorgeImmobilie}
                    onChange={setAltersvorsorgeImmobilie}
                    accent={C}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <label style={T.fldLbl}>Ihr Alter (Jahre)</label>
                    <SliderCard
                      label="Alter"
                      value={age}
                      min={18}
                      max={78}
                      step={1}
                      unit=""
                      display={`${age} Jahre`}
                      accent={C}
                      onChange={setAge}
                    />
                    <div style={T.fldHint}>Ab ca. 40 Jahren mit Immobilie wird Pflegezusatz stärker empfohlen.</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div style={T.footer}>
          <button type="button" style={T.btnPrim(!step2Complete)} disabled={!step2Complete} onClick={nextP2}>
            {scr2 === 1 ? "Weiter" : "Auswertung starten"}
          </button>
          <button type="button" style={T.btnSec} onClick={backP2}>
            Zurück
          </button>
        </div>
      </div>
    );
  }

  if (phase === 1 && pathIntroDone && path) {
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />
        <div style={T.hero}>
          <div style={T.eyebrow}>Traum-Realitäts-Check</div>
          <div style={T.h1}>Gut aufgestellt</div>
          <div style={T.body}>Ein kurzer Moment — dann geht es mit dem Risiko-Scanner weiter.</div>
        </div>
        <div style={{ padding: "0 24px", marginBottom: "120px" }}>
          <p style={CHECKKIT2026.storyBody}>{PATH_INTRO_STORY[path]}</p>
        </div>
        <div style={T.footer}>
          <button type="button" style={T.btnPrim(false)} onClick={() => goTo(2)}>
            Weiter zum Risiko-Scanner
          </button>
          <button
            type="button"
            style={T.btnSec}
            onClick={() => {
              setAk((k) => k + 1);
              setPathIntroDone(false);
            }}
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header />
      <div style={T.hero}>
        <div style={T.eyebrow}>Immobilienabsicherung</div>
        <div style={T.h1}>Wo stehen Sie?</div>
        <div style={T.body}>Wählen Sie Ihre Situation — wir passen Risiko-Scanner und Empfehlungen an.</div>
      </div>
      <div style={{ padding: "0 20px", marginBottom: "120px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PATHS.map((p) => (
            <SelectionCard
              key={p.id}
              value={p.id}
              label={p.label}
              description={p.sub}
              icon={<span style={{ fontSize: "22px", lineHeight: 1 }}>{p.icon}</span>}
              selected={path === p.id}
              accent={C}
              onClick={() => setPath(p.id)}
            />
          ))}
        </div>
      </div>
      <div style={T.footer}>
        <button
          type="button"
          style={T.btnPrim(!path)}
          disabled={!path}
          onClick={() => {
            setAk((k) => k + 1);
            setPathIntroDone(true);
          }}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
