/**
 * GKV/PKV-Ergebnis — Clean Layout wie Einkommensrechner (BUKTG): Hero, Duell-Karten (GKV/PKV),
 * InfoGrid, Faktoren, Footer. Fünf Ergebnis-Pfade über `resultPath`. Sie-Form.
 */

import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";

const JAEG_MONAT = 6450;

/**
 * @typedef {'pflicht'|'beamte'|'pkv_fokus'|'individuell'|'gkv_familie'} GkvPkvResultPath
 */

function formatIncomeLimitEur() {
  return `${JAEG_MONAT.toLocaleString("de-DE")} €`;
}

/** @param {object} p */
function smartVars(p) {
  const incomeLimit = formatIncomeLimitEur();
  const k = p.kinderImHaushalt;
  let childrenCount = "Ihren Kindern";
  if (k === 1) childrenCount = "einem Kind";
  else if (k === 2) childrenCount = "zwei Kindern";
  else if (k === 3) childrenCount = "drei oder mehr Kindern";
  return { incomeLimit, childrenCount };
}

function tpl(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : `{${key}}`));
}

/**
 * Ermittelt den Ergebnis-Pfad aus den Wizard-Daten (5 Pfade).
 *
 * - **pflicht:** Angestellte unter 6.450 € brutto (JAEG)
 * - **beamte:** alle Beamte
 * - **gkv_familie:** Partner & Kinder, 3+ Kinder im Haushalt
 * - **individuell:** Partner & Kinder, 1–2 Kinder, und (Angestellte ≥ JAEG oder Selbstständige)
 * - **pkv_fokus:** Angestellte ≥ JAEG oder Selbstständige *ohne* den Familien-Pfad oben (ohne Kinder bzw. nicht partner_kinder mit 1–2 Kindern)
 *
 * @param {object} p
 * @returns {GkvPkvResultPath}
 */
export function resolveGkvPkvResultPath(p) {
  if (p.beruf === "beamter") return "beamte";
  if (p.beruf === "angestellt" && p.brutto < JAEG_MONAT) return "pflicht";

  const mitKindern = p.familiensituation === "partner_kinder";
  const k = p.kinderImHaushalt;

  if (mitKindern && k === 3) return "gkv_familie";
  if (
    mitKindern &&
    (k === 1 || k === 2) &&
    ((p.beruf === "angestellt" && p.brutto >= JAEG_MONAT) || p.beruf === "selbst")
  ) {
    return "individuell";
  }

  return "pkv_fokus";
}

const GKV_COLOR = "#059669";

/** Kurzbezeichnung für die Hero-Zeile „Einordnung · …“ */
const PATH_LABEL_SIE = {
  pflicht: "GKV-Pflicht",
  beamte: "Beamte",
  pkv_fokus: "PKV-Fokus",
  individuell: "Familien-Check",
  gkv_familie: "Großfamilie",
};

/**
 * Inhalte je Pfad: kurze H1, Subline, Duell-Karten (Bullets: ok = Vorteil/Check, neg|hinweis = dezenter Punkt).
 * Platzhalter: {incomeLimit}, {childrenCount}
 */
const pathContent = {
  pflicht: {
    heroH1: "GKV-Pflicht",
    heroSubline:
      "Unter {incomeLimit} monatlich brutto sind Sie als Angestellte/r gesetzlich krankenversichert — ein Wechsel in die PKV ist derzeit ausgeschlossen. Mit Zusatzbausteinen werten Sie Ihre Versorgung dennoch auf.",
    tableIntro:
      "Ihr Brutto liegt unter {incomeLimit} — als Angestellte/r ist der PKV-Wechsel derzeit ausgeschlossen. Hier die Einordnung:",
    gkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Gesetzlich garantierte Basisversorgung." },
        { kind: "ok", text: "Beitrag richtet sich nach Ihrem Einkommen." },
        { kind: "ok", text: "Kinder & Partner oft beitragsfrei mitversichert." },
        { kind: "ok", text: "Ihr Arbeitgeber beteiligt sich am GKV-Beitrag (Hälfte des AN-Anteils)." },
      ],
    },
    pkv: {
      tagline: "Nicht möglich",
      badge: "Derzeit nicht möglich",
      border: "caution",
      bullets: [
        { kind: "neg", text: "Wechsel aktuell gesetzlich ausgeschlossen." },
        { kind: "hinweis", text: "Lösung: Private Zusatzbausteine (Zahn/Stationär) möglich." },
        { kind: "hinweis", text: "Ziel: PKV-Leistungsniveau innerhalb der GKV erreichen." },
      ],
    },
  },
  beamte: {
    heroH1: "PKV naheliegend",
    heroSubline:
      "Als Beamte/r prägt Ihr Beihilfe-Anspruch die Kosten — die private Krankenversicherung ist auf die typischen Restkosten zugeschnitten und oft sehr günstig.",
    tableIntro: "Kurzvergleich — Beamtenstatus und Beihilfe-Anspruch",
    gkv: {
      tagline: "Unwirtschaftlich",
      badge: "Unwirtschaftlich",
      border: "muted",
      bullets: [
        { kind: "neg", text: "Sie müssen den vollen Beitrag (ca. 15–20 %) meist allein tragen." },
        { kind: "neg", text: "Keine direkte Beteiligung des Dienstherrn über den Beihilfe-Anspruch möglich." },
        { kind: "neg", text: "Eingeschränkter Leistungskatalog der gesetzlichen Kassen." },
      ],
    },
    pkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Beihilfe-konform — deckt typischerweise nur die Restkosten (ca. 20–50 %)." },
        { kind: "ok", text: "Sehr niedrige Monatsbeiträge dank Beihilfe-Anspruch." },
        { kind: "ok", text: "Lebenslang vertraglich abgesichert: Chefarzt & Einbettzimmer (je nach Tarif)." },
        { kind: "ok", text: "Kinder lassen sich in der Regel kostengünstig mit absichern (Beihilfe)." },
      ],
    },
  },
  pkv_fokus: {
    heroH1: "PKV naheliegend",
    heroSubline:
      "Sie sind nicht GKV-pflichtig bzw. oberhalb der Pflichtgrenze — hier zählen Beitragshöhe, Leistungsumfang und langfristige Stabilität im direkten Vergleich.",
    tableIntro: "Kurzvergleich — ohne Pflicht zur gesetzlichen Krankenversicherung",
    gkv: {
      tagline: "Teuer",
      badge: "GKV-Höchstbeitrag",
      border: "muted",
      bullets: [
        { kind: "neg", text: "Sie zahlen den Höchstbeitrag (ca. 1.050 € inkl. PV)." },
        { kind: "neg", text: "Leistungen können durch den Gesetzgeber gekürzt werden." },
        { kind: "neg", text: "Lange Wartezeiten bei Fachärzten sind häufig." },
      ],
    },
    pkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Beitragsvorteil: Oft deutlich günstiger als der GKV-Höchstbetrag." },
        { kind: "ok", text: "Vertraglich garantierte Leistungen (keine gesetzlichen Kürzungen)." },
        { kind: "ok", text: "Altersrückstellungen für stabilere Beiträge im Alter." },
        { kind: "ok", text: "Freie Wahl von Ärzten und Kliniken je nach Tarif — oft kurze Wartezeiten." },
      ],
    },
  },
  individuell: {
    heroH1: "Individueller Familien-Check",
    heroSubline:
      "Mit {childrenCount} stehen Familienmitversicherung (GKV) und mehrere PKV-Tarife zur Wahl — hier lohnt ein klarer Kosten- und Leistungsabgleich.",
    tableIntro: "Kurzvergleich — mit {childrenCount} im Haushalt",
    gkv: {
      tagline: "Solidarisch",
      badge: "Solidarisch",
      border: "compare",
      bullets: [
        { kind: "ok", text: "Kinder sind beitragsfrei mitversichert (Ersparnis)." },
        { kind: "ok", text: "Einkommensabhängiger Beitrag (flexibel bei Teilzeit)." },
        { kind: "ok", text: "Ein Haushaltsbeitrag statt mehrerer Kinder-Tarife." },
      ],
    },
    pkv: {
      tagline: "Leistungsstark",
      badge: "Leistungsstark",
      border: "compare",
      bullets: [
        { kind: "ok", text: "Sehr gute medizinische Versorgung für die ganze Familie möglich." },
        { kind: "ok", text: "Kostenfaktor: Separater Beitrag pro Kind (oft ca. 150 €)." },
        { kind: "ok", text: "Bevorzugte Termine & moderne Leistungsoptionen je nach Tarif." },
        { kind: "neutral", text: "Gesundheitsprüfung und Risikozuschläge pro Antragsteller möglich." },
      ],
    },
  },
  gkv_familie: {
    heroH1: "GKV-Wirtschaftlich",
    heroSubline:
      "Mit drei oder mehr Kindern ist die Familienversicherung in der GKV meist der stärkste Hebel — ein Haushaltsbeitrag statt vieler PKV-Einzelverträge.",
    tableIntro: "Kurzvergleich — drei oder mehr Kinder im Haushalt",
    gkv: {
      tagline: "Wirtschaftlich",
      badge: "Wirtschaftlich sinnvoll",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Maximale Ersparnis: Alle Kinder kostenfrei mitversichert (sofern die Voraussetzungen erfüllt sind)." },
        { kind: "ok", text: "Beitrag gedeckelt auf den Höchstbetrag — trotz vieler Personen im Haushalt." },
        { kind: "ok", text: "Ideal für Einverdiener-Haushalte." },
        { kind: "ok", text: "Leistungen gesetzlich definiert — Erweiterung über Zusatzversicherungen möglich." },
      ],
    },
    pkv: {
      tagline: "Kostenintensiv",
      badge: "Kostenintensiv",
      border: "caution",
      bullets: [
        { kind: "neg", text: "Hohe monatliche Fixkosten durch viele Einzelverträge." },
        { kind: "neg", text: "Gesamtkosten oft deutlich über dem GKV-Niveau." },
        { kind: "hinweis", text: "Empfehlung: GKV wählen und gezielt Zusatzversicherungen ergänzen." },
      ],
    },
  },
};

/**
 * @param {GkvPkvResultPath} path
 * @param {object} p
 */
function resolvePathCopy(path, p) {
  const raw = pathContent[path] || pathContent.pkv_fokus;
  const v = smartVars(p);
  return {
    heroH1: tpl(raw.heroH1, v),
    heroSubline: tpl(raw.heroSubline, v),
    tableIntro: tpl(raw.tableIntro, v),
    gkv: raw.gkv,
    pkv: raw.pkv,
  };
}

/** Typischer Krankenbeihilfe-Satz zur Einordnung (Bund/Land variieren). */
const BEIHILFE_ANSPRUCH_PROZENT = 70;

function IconClock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 12v.01" />
    </svg>
  );
}

/**
 * InfoGrid: max. 3 Kacheln — Alter (immer), Familie (nur mit Kindern), Berufsstatus.
 * @param {object} p
 * @param {object} R
 */
function buildInfoGrid(p, R) {
  const age = Math.max(0, Math.round(Number(p.alter) || 0));
  const v = { ...smartVars(p), age: String(age), beihilfeProzent: String(BEIHILFE_ANSPRUCH_PROZENT) };

  const cards = [];

  let ageBody;
  if (age < 35) {
    ageBody = tpl(
      "Mit {age} Jahren sichern Sie sich extrem günstige Einstiegstarife und bauen frühzeitig hohe Altersrückstellungen für stabile Beiträge auf.",
      v,
    );
  } else if (age <= 50) {
    ageBody = tpl(
      "Ein Wechsel mit {age} Jahren ist strategisch sinnvoll, um die medizinische Versorgung langfristig auf Premium-Niveau einzufrieren.",
      v,
    );
  } else {
    ageBody = tpl(
      "Aufgrund Ihres Alters ({age} Jahre) ist eine detaillierte Prüfung der Beitragsentwicklung im Rentenalter zwingend erforderlich.",
      v,
    );
  }

  cards.push({
    key: "info-alter",
    focus: "Warum das Alter für die PKV entscheidend ist",
    title: "Eintrittsalter & Beiträge",
    body: ageBody,
    Icon: IconClock,
  });

  if (R.hatKinder) {
    let familyBody;
    if (p.beruf === "beamter") {
      const k = p.kinderImHaushalt;
      const lead =
        k === 1
          ? "Ihr Kind erhält bis zu 80 % Beihilfe."
          : k === 2
            ? "Ihre zwei Kinder erhalten bis zu 80 % Beihilfe."
            : "Ihre Kinder erhalten bis zu 80 % Beihilfe.";
      familyBody = `${lead} Die private Restkostenversicherung kostet daher nur wenige Euro pro Monat.`;
    } else {
      const k = p.kinderImHaushalt;
      const fuer = k === 1 ? "für Ihr Kind" : k === 2 ? "für Ihre zwei Kinder" : "für Ihre Kinder";
      const gkvTeil =
        k === 1
          ? "In der GKV ist es nach den Voraussetzungen meist beitragsfrei mitversichert."
          : "In der GKV sind sie nach den Voraussetzungen meist beitragsfrei mitversichert.";
      familyBody = `Beachten Sie: In der PKV fallen ${fuer} eigene Beiträge an (ca. 150–200 € mtl. pro Kind). ${gkvTeil}`;
    }
    cards.push({
      key: "info-familie",
      focus: "Die Kostenfalle oder der Beihilfe-Bonus",
      title: "Absicherung der Familie",
      body: familyBody,
      Icon: IconUsers,
    });
  }

  let statusBody;
  if (p.beruf === "beamter") {
    statusBody = tpl(
      "Ihr Dienstherr übernimmt dauerhaft {beihilfeProzent} % Ihrer Krankheitskosten. Die PKV ist auf dieses System perfekt zugeschnitten.",
      v,
    );
  } else if (p.beruf === "angestellt" && p.brutto >= JAEG_MONAT) {
    statusBody =
      "Ihr Arbeitgeber beteiligt sich mit 50 % an Ihrem PKV-Beitrag (bis zum gesetzlichen Höchstsatz). Dies macht den Premium-Schutz oft günstiger als die GKV.";
  } else if (p.beruf === "angestellt") {
    statusBody =
      "Unterhalb der Versicherungspflichtgrenze bleiben Sie in der GKV: Ihr Arbeitgeber trägt die Hälfte Ihres Arbeitnehmeranteils am GKV-Beitrag. Ein Wechsel in die PKV ist als Angestellte/r derzeit nicht möglich.";
  } else {
    statusBody =
      "Sie tragen Ihren Beitrag zu 100 % selbst. Dafür sind die Beiträge in der PKV völlig unabhängig von der Höhe Ihres Gewinns.";
  }

  cards.push({
    key: "info-status",
    focus: "Der Geldgeber (Beihilfe vs. Arbeitgeber)",
    title: "Zuschuss & Beteiligung",
    body: statusBody,
    Icon: IconBriefcase,
  });

  return cards.slice(0, 3);
}

function BulletLead({ kind, accent }) {
  const isCheck = kind === "ok";
  if (isCheck) {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden style={{ flexShrink: 0, marginTop: "3px" }}>
        <circle cx="7.5" cy="7.5" r="7.5" fill={accent} />
        <path d="M4.2 7.6 6.4 9.8 10.8 5.4" stroke="#fff" strokeWidth="1.65" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#D1D5DB",
        marginTop: "7px",
        flexShrink: 0,
        display: "inline-block",
      }}
      aria-hidden
    />
  );
}

/** @param {'primary'|'muted'|'compare'|'caution'} border */
function cardBorderStyle(border) {
  switch (border) {
    case "primary":
      return {
        border: "2px solid var(--primary)",
        boxShadow: "0 8px 28px color-mix(in srgb, var(--primary) 14%, transparent)",
      };
    case "compare":
      return {
        border: "2px solid color-mix(in srgb, var(--primary) 28%, transparent)",
        boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 8%, transparent)",
      };
    case "caution":
      return {
        border: "1px solid #E8D4C4",
        boxShadow: "0 4px 16px rgba(192, 57, 43, 0.06)",
      };
    default:
      return { border: "1px solid rgba(17,24,39,0.08)", boxShadow: "none" };
  }
}

/** @param {'primary'|'muted'|'compare'|'caution'} tone */
function badgeStyle(tone) {
  if (tone === "primary") {
    return { background: "var(--primary)", color: "#fff", border: "none" };
  }
  if (tone === "compare") {
    return {
      background: "color-mix(in srgb, var(--primary) 12%, transparent)",
      color: "var(--primary)",
      border: "1px solid color-mix(in srgb, var(--primary) 32%, transparent)",
    };
  }
  if (tone === "caution") {
    return { background: "#FFF6F5", color: "#9A3412", border: "1px solid #F2D4D0" };
  }
  return { background: "#f0f0f0", color: "#666", border: "1px solid #e8e8e8" };
}

function CompareCard({ label, tagline, color, bg, bullets, border, badge, bulletAccent, T }) {
  const b = cardBorderStyle(border);
  const badgeT =
    border === "primary" ? "primary" : border === "compare" ? "compare" : border === "caution" ? "caution" : "muted";
  const bs = badgeStyle(badgeT);

  return (
    <div
      style={{
        position: "relative",
        minWidth: 0,
        ...b,
        borderRadius: "18px",
        padding: "18px 14px 16px",
        background: border === "muted" ? "#f8fafc" : bg,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {badge ? (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            maxWidth: "min(118px, 46%)",
            textAlign: "right",
            fontSize: "9px",
            fontWeight: "700",
            letterSpacing: "0.03em",
            lineHeight: 1.25,
            textTransform: "uppercase",
            padding: "4px 8px",
            borderRadius: "999px",
            ...bs,
          }}
        >
          {badge}
        </div>
      ) : null}
      <div style={{ fontSize: "15px", fontWeight: "800", color, marginBottom: "2px", paddingRight: badge ? "78px" : 0 }}>{label}</div>
      <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", marginBottom: "12px", paddingRight: badge ? "78px" : 0 }}>{tagline}</div>
      {bullets.map((row, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: i < bullets.length - 1 ? "8px" : 0 }}>
          <BulletLead kind={row.kind === "ok" ? "ok" : "dot"} accent={bulletAccent} />
          <span style={{ ...T.compareMuted, overflowWrap: "break-word", wordBreak: "break-word" }}>{row.text}</span>
        </div>
      ))}
    </div>
  );
}

function InfoGridCard({ focus, title, body, Icon, T }) {
  return (
    <div style={T.infoGridShell}>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <div style={T.infoGridIconWrap} aria-hidden>
          <Icon />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={T.infoGridFocus}>{focus}</div>
          <div style={T.infoGridTitle}>{title}</div>
          <div style={T.infoGridBody}>{body}</div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage({ R, p, T, accentColor: C, maklerFirma, goTo, FAKTOREN }) {
  const resultPath = resolveGkvPkvResultPath(p);
  const copy = resolvePathCopy(resultPath, p);
  const infoGrid = buildInfoGrid(p, R);

  const PKV_COLOR = C;

  return (
    <div style={{ ...T.page, "--accent": C, "--primary": C }} className="fade-in">
      <div style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMk}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span style={T.logoTxt}>{maklerFirma}</span>
        </div>
        <span style={T.badge}>Krankenversicherung</span>
      </div>
      <div style={T.prog}>
        <div style={T.progFil(66)} />
      </div>

      <div style={{ paddingBottom: "120px" }}>
        {/* Hero — zentriert wie Einkommensrechner */}
        <div
          style={{
            ...T.resultHero,
            paddingTop: "36px",
            paddingBottom: "28px",
            textAlign: "center",
          }}
        >
          <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>
            Einordnung · {PATH_LABEL_SIE[resultPath]}
          </div>
          <div
            style={{
              ...T.resultH1,
              marginBottom: "12px",
              maxWidth: "22ch",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {copy.heroH1}
          </div>
          <p
            style={{
              ...T.resultBody,
              maxWidth: "38ch",
              margin: "0 auto 12px",
            }}
          >
            {copy.heroSubline}
          </p>
          <div style={{ ...T.resultUnit, marginBottom: "18px", maxWidth: "36ch", marginLeft: "auto", marginRight: "auto" }}>{R.subline}</div>
          {R.unterGrenze ? (
            <div style={{ ...T.statusWarn, margin: "0 auto", width: "fit-content" }}>Einkommensgrenze nicht erreicht</div>
          ) : R.empfehlung === "pkv" ? (
            <div style={{ ...T.statusInfo(C), margin: "0 auto", width: "fit-content" }}>PKV-Zugang gegeben</div>
          ) : (
            <div style={{ ...T.statusOk, margin: "0 auto", width: "fit-content" }}>Erste Einordnung · kein Tarifvergleich</div>
          )}
          <div style={{ ...T.resultSub, marginTop: "16px" }}>Vereinfachte Auswertung · auf Basis Ihrer Angaben · keine Rechtsberatung</div>
        </div>

        {R.unterGrenze && (
          <div style={T.section}>
            <div style={T.warnCard}>
              <div style={T.warnCardTitle}>PKV aktuell nicht möglich</div>
              <div style={T.warnCardText}>
                {tpl(
                  "Die Versicherungspflichtgrenze 2026 liegt bei {incomeLimit} pro Monat brutto. Sie liegen darunter — ein PKV-Wechsel ist für Angestellte erst ab diesem Einkommen möglich.",
                  smartVars(p),
                )}
              </div>
              <div style={T.warnCardNote}>
                Ausnahme: Beamte und Selbstständige sind nicht pflichtversichert.
              </div>
            </div>
          </div>
        )}

        {/* Vergleichs-Grid */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Systemvergleich</div>
          <div style={{ ...T.tableIntro, marginBottom: "14px" }}>{copy.tableIntro}</div>
          <div
            className="gkvpkv-stack-sm"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "12px",
            }}
          >
            <CompareCard
              label="GKV"
              tagline={copy.gkv.tagline}
              color={GKV_COLOR}
              bg="#F0FDF4"
              bullets={copy.gkv.bullets}
              border={copy.gkv.border}
              badge={copy.gkv.badge}
              bulletAccent={GKV_COLOR}
              T={T}
            />
            <CompareCard
              label="PKV"
              tagline={copy.pkv.tagline}
              color={PKV_COLOR}
              bg="#EFF6FF"
              bullets={copy.pkv.bullets}
              border={copy.pkv.border}
              badge={copy.pkv.badge}
              bulletAccent={PKV_COLOR}
              T={T}
            />
          </div>
        </div>

        {/* InfoGrid — direkt unter dem Vergleich */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Einordnung für Sie</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {infoGrid.map((c) => (
              <InfoGridCard key={c.key} focus={c.focus} title={c.title} body={c.body} Icon={c.Icon} T={T} />
            ))}
          </div>
        </div>

        {/* Faktoren-Matrix (kompakt) */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Wichtige Faktoren in Ihrer Situation</div>
          <div style={T.cardPrimary}>
            {FAKTOREN.map(({ label, gkv, pkv, fav }, i, arr) => (
              <div
                key={label}
                style={{
                  padding: "14px 20px",
                  borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <div style={T.matrixMuted}>{label}</div>
                <div
                  className="gkvpkv-stack-sm"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 148px), 1fr))",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      padding: "10px",
                      background: fav === "gkv" ? "#F0FDF4" : "#f8fafc",
                      borderRadius: "10px",
                      border: fav === "gkv" ? "1px solid #BBF7D0" : "1px solid #e8e8e8",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: fav === "gkv" ? GKV_COLOR : "#888",
                        marginBottom: "4px",
                      }}
                    >
                      GKV
                    </div>
                    <div style={{ ...T.matrixCellText, overflowWrap: "break-word", wordBreak: "break-word" }}>{gkv}</div>
                  </div>
                  <div
                    style={{
                      minWidth: 0,
                      padding: "10px",
                      background: fav === "pkv" ? "#EFF6FF" : "#f8fafc",
                      borderRadius: "10px",
                      border: fav === "pkv" ? "1px solid #BFDBFE" : "1px solid #e8e8e8",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: fav === "pkv" ? PKV_COLOR : "#888",
                        marginBottom: "4px",
                      }}
                    >
                      PKV
                    </div>
                    <div style={{ ...T.matrixCellText, overflowWrap: "break-word", wordBreak: "break-word" }}>{pkv}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "24px" }}>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Einordnung auf Basis Ihrer Angaben. Keine konkreten Beiträge — diese hängen von Tarif, Kasse und individuellem
              Gesundheitszustand ab.
              <span style={{ color: "#b8884a" }}> Grundlage: §241 SGB V, §257 SGB V, §9 SGB V.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>
      </div>

      <div style={T.footer}>
        <button type="button" style={T.btnPrim(false)} onClick={() => goTo(3)}>
          Strategie-Check anfordern
        </button>
        <button type="button" style={T.btnSec} onClick={() => goTo(1)}>
          Neue Berechnung starten
        </button>
      </div>
    </div>
  );
}
