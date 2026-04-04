import { useEffect, useMemo, useRef, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { trackEvent } from "@/lib/trackEvent";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CheckConfigLoadingShell } from "@/components/checks/CheckConfigLoadingShell";
import { StandaloneWrapper } from "@/components/checks/StandaloneWrapper";
import { textOnAccent } from "@/lib/utils";
import { checkStandardT } from "@/lib/checkStandardT";
import { CheckHeader } from "@/components/checks/CheckHeader";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { SliderCard } from "@/components/ui/CheckComponents";
import { CheckKitResultGrid } from "@/components/checks/CheckKitResultGrid";
import { CHECKKIT2026 } from "@/lib/checkKitStandard2026";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();

const formatBedarfEuro = (n) => `${Math.round(Number(n)).toLocaleString("de-DE")} €`;

const BEDARF_PAKET_DEFAULT_KEYS = ["komfort"];
const BEDARF_PAKET_LABELS = { basis: "Basis", komfort: "Komfort", premium: "Premium" };

// ─── SCORING_MAPPING + Paket-Engine ───────────────────────────────────────────
const SCORING_MAPPING = {
  PH: { base: 999, name: "Privathaftpflicht" },
  BU: { base: 800, name: "Berufsunfähigkeit" },
  RLV: { base: 0, name: "Risikoleben" },
  KTG: { base: 0, name: "Krankentagegeld" },
  AV: { base: 400, name: "Altersvorsorge" },
  PFLEGE: { base: 250, name: "Pflegevorsorge" },
  UNFALL: { base: 200, name: "Unfallschutz" },
  HAUSRAT: { base: 150, name: "Hausrat" },
  ZAHN: { base: 100, name: "Zahnzusatz" },
  RECHT: { base: 50, name: "Rechtsschutz" },
};

const SCORING_KEY_TO_ID = {
  PH: "privathaftpflicht",
  BU: "berufsunfaehigkeit",
  RLV: "risikoleben",
  KTG: "krankentagegeld",
  AV: "altersvorsorge",
  PFLEGE: "pflegezusatz",
  UNFALL: "unfall",
  HAUSRAT: "hausrat",
  ZAHN: "zahnzusatz",
  RECHT: "rechtsschutz",
};

const ID_TO_SCORING_KEY = Object.fromEntries(
  Object.entries(SCORING_KEY_TO_ID).map(([k, id]) => [id, k]),
);

const SCORING_ICONS = {
  PH: "🛡️",
  BU: "💼",
  RLV: "❤️",
  KTG: "🏥",
  AV: "🌱",
  PFLEGE: "🤲",
  UNFALL: "⚠️",
  HAUSRAT: "🛋️",
  ZAHN: "🦷",
  RECHT: "⚖️",
};

const SCORING_SHORT = {
  PH: "Haftpflicht",
  BU: "BU",
  RLV: "Risikoleben",
  KTG: "KTG",
  AV: "Altersvorsorge",
  PFLEGE: "Pflege",
  UNFALL: "Unfall",
  HAUSRAT: "Hausrat",
  ZAHN: "Zahn",
  RECHT: "Recht",
};

const COVERED_NAME_FALLBACK = {
  erwerbsunfaehigkeit: "Erwerbsunfähigkeit",
  wohngebaeude: "Wohngebäude",
  pkv: "PKV",
  krankenhauszusatz: "Krankenhauszusatz",
  ambulante_zusatz: "Ambulante Zusatz",
  sparen_investieren: "Sparen & Investieren",
};

function applyScoringRules(profile) {
  const out = {};
  for (const [key, meta] of Object.entries(SCORING_MAPPING)) {
    out[key] = { name: meta.name, base: meta.base };
  }

  const emp = profile.employmentStatus;
  const isStudent = emp === "ausbildung_studium";

  if (isStudent) {
    out.PH.base = profile.age > 25 ? 999 : 0;
    out.BU.base = 900;
    out.AV.base = 350;
  }

  if (profile.familyStatus === "mit_kindern") {
    out.RLV.base = Math.max(out.RLV.base, 950);
  }
  if (profile.housingStatus === "eigentuemer") {
    out.RLV.base = Math.max(out.RLV.base, 720);
  }

  if (!["angestellt", "selbstständig", "ausbildung_studium", "verbeamtet"].includes(emp)) {
    out.KTG.base = 0;
  } else if (emp === "angestellt" || emp === "verbeamtet") {
    out.KTG.base = Math.max(out.KTG.base, 380);
  } else if (emp === "ausbildung_studium") {
    out.KTG.base = Math.max(out.KTG.base, 260);
  }

  if (emp === "selbstständig") {
    out.KTG.base = 980;
    out.PH.base = 999;
    if (profile.jobType === "koerperlich") {
      out.UNFALL.base = 600;
    }
  }

  if (!isStudent && (emp === "sonstiges" || profile.age > 60)) {
    out.BU.base = 0;
  }

  if (profile.age > 45) {
    out.PFLEGE.base += 300;
  }

  if (profile.age < 35) {
    out.PFLEGE.base = 0;
  }

  // Altersvorsorge: ab 40/50 im Ranking zurückstufen — kürzerer Ansparhorizont, Fokus eher auf andere Sparten.
  if (profile.age > 62) {
    out.AV.base = 0;
  } else if (profile.age >= 50) {
    out.AV.base = Math.round(out.AV.base * 0.5);
  } else if (profile.age >= 40) {
    out.AV.base = Math.round(out.AV.base * 0.72);
  }
  if (profile.healthStatus === "pkv") {
    out.ZAHN.base = 0;
  }
  if (profile.housingStatus === "eltern_wg") {
    out.HAUSRAT.base = 0;
  }

  return out;
}

function idToCoveredName(id) {
  const key = ID_TO_SCORING_KEY[id];
  if (key && SCORING_MAPPING[key]) return SCORING_MAPPING[key].name;
  return COVERED_NAME_FALLBACK[id] || id;
}

/**
 * Liegt für diese Scoring-Sparte (Paket-ID) bereits Absicherung vor?
 * EU zählt wie BU (gleiches Bedürfnisfeld im Wizard).
 */
function existingCoversScoringId(existingSet, scoringId) {
  if (existingSet.has(scoringId)) return true;
  if (scoringId === "berufsunfaehigkeit" && existingSet.has("erwerbsunfaehigkeit")) return true;
  return false;
}

function buildPackageScoringResult(profil, existing) {
  const existingSet = new Set(existing);
  const scored = applyScoringRules(profil);

  const allRanked = Object.keys(SCORING_MAPPING)
    .map((key) => ({
      key,
      id: SCORING_KEY_TO_ID[key],
      name: scored[key].name,
      shortLabel: SCORING_SHORT[key] || scored[key].name,
      icon: SCORING_ICONS[key] || "📌",
      score: scored[key].base,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const topFour = allRanked.slice(0, 4);
  const weightTopFour = topFour.reduce((s, r) => s + r.score, 0);
  const weightCoveredInTopFour = topFour.reduce(
    (s, r) => s + (existingCoversScoringId(existingSet, r.id) ? r.score : 0),
    0,
  );
  const schutzProzent =
    weightTopFour > 0
      ? Math.min(100, Math.max(0, Math.round((100 * weightCoveredInTopFour) / weightTopFour)))
      : 0;

  const topVierAnzahl = topFour.length;
  const abgedecktInTopVier = topFour.filter((r) => existingCoversScoringId(existingSet, r.id)).length;
  const anzahlLuecken = topFour.filter((r) => !existingCoversScoringId(existingSet, r.id)).length;

  const ranked = allRanked.filter((r) => !existingCoversScoringId(existingSet, r.id));

  const basis = ranked.slice(0, 2);
  const komfort = ranked.slice(0, 3);
  const premium = ranked.slice(0, 4);

  const incomeMap = {
    under_1500: 1200,
    "1500_2500": 2000,
    "2500_4000": 3200,
    "4000_6000": 5000,
    over_6000: 7000,
  };
  const nettoSchatz = incomeMap[profil.netIncome] || 2000;
  const empfBU = Math.round((nettoSchatz * 0.7) / 50) * 50;

  return {
    basis,
    komfort,
    premium,
    ranked,
    schutzProzent,
    topVierAnzahl,
    abgedecktInTopVier,
    alreadyCovered: existing.map((id) => ({ id, name: idToCoveredName(id) })),
    showKinderHint: profil.familyStatus === "mit_kindern",
    nettoSchatz,
    empfBU,
    anzahlLuecken,
  };
}

function Opts({ k, opts, profil, set, C, T, cols = 1 }) {
  const sel = profil[k];
  const mark = textOnAccent(C);
  return (
    <div style={cols > 1 ? T.optsGrid : T.opts}>
      {opts.map(([v, l, sub]) => {
        const active = sel === v;
        const iconChar = Array.from(l)[0] ?? l[0];
        const labelText = l.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, "");
        return (
          <button type="button" key={v} onClick={() => set(k, v)} style={cols > 1 ? T.optGrid(active) : T.opt(active)}>
            <div style={cols > 1 ? T.optGridIcon(active) : T.optIcon(active)}>
              <span style={{ fontSize: cols > 1 ? 20 : 22, lineHeight: 1, color: active ? C : "#98A2B3" }}>{iconChar}</span>
            </div>
            {cols > 1 ? (
              <div style={T.optGridLabel}>{labelText}</div>
            ) : (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={T.optLabel}>{labelText}</div>
                  {sub ? <div style={T.optSub}>{sub}</div> : null}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `1.5px solid ${active ? C : "#E5E7EB"}`, background: active ? C : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke={mark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Vereinfachte Optionen (1 Frage pro Screen) ───────────────────────────────
const EMP_OPTS=[
  ["angestellt","💼 Angestellt","Festanstellung oder ähnlich"],
  ["selbstständig","🧑‍💻 Selbstständig","Freiberuflich oder Gewerbe"],
  ["verbeamtet","🏛️ Beamter","Beamtenverhältnis"],
  ["ausbildung_studium","🎓 In Ausbildung / Studium","Studium oder Ausbildung"],
];
const FAM_OPTS=[
  ["ledig","🧍 Nur für mich selbst","Ich bin aktuell allein verantwortlich"],
  ["partnerschaft","🤝 Partner / Beziehung","Wir tragen gemeinsam Verantwortung"],
  ["mit_kindern","👨‍👩‍👧 Familie mit Kindern","Ich habe Kinder, die abgesichert sein müssen"],
];
const HSG_OPTS=[
  ["mieter","🔑 Zur Miete","Ich miete meine Wohnung"],
  ["eigentuemer","🏡 Eigentum","Ich besitze eine Immobilie"],
  ["eltern_wg","🏠 Bei Eltern / WG","Ich wohne noch zu Hause oder in einer WG"],
];
const INC_OPTS=[
  ["1500_2500","Unter 2.000 €"],
  ["2500_4000","2.000 – 3.500 €"],
  ["4000_6000","3.500 – 5.000 €"],
  ["over_6000","Über 5.000 €"],
];
/** Entspricht jobType im Profil / Scoring-Engine: buero | koerperlich | medizinisch_sozial | sonstiges */
const JOB_OPTS=[
  ["buero","💼 Büro / Verwaltung","Überwiegend sitzend, wenig körperliche Belastung"],
  ["koerperlich","🔧 Handwerk & körperlich","Körperlich fordernde Tätigkeit"],
  ["medizinisch_sozial","🩺 Sozial / Medizin","Pflege, Medizin, Bildung, soziale Berufe"],
  ["sonstiges","📌 Sonstiges","Andere oder gemischte Tätigkeit"],
];
const EX_GROUPS=[
  {label:"Sachen & Wohnen",items:[{id:"privathaftpflicht",name:"Privathaftpflicht"},{id:"hausrat",name:"Hausrat"},{id:"wohngebaeude",name:"Wohngebäude"},{id:"rechtsschutz",name:"Rechtsschutz"}]},
  {label:"Einkommen & Zukunft",items:[{id:"berufsunfaehigkeit",name:"Berufsunfähigkeit (BU)"},{id:"erwerbsunfaehigkeit",name:"Erwerbsunfähigkeit (EU)"},{id:"krankentagegeld",name:"Krankentagegeld"},{id:"altersvorsorge",name:"Private Altersvorsorge"}]},
  {label:"Gesundheit",items:[{id:"pkv",name:"Private Krankenversicherung"},{id:"zahnzusatz",name:"Zahnzusatz"},{id:"krankenhauszusatz",name:"Krankenhauszusatz"},{id:"ambulante_zusatz",name:"Ambulante Zusatz"},{id:"pflegezusatz",name:"Pflegezusatz"}]},
  {label:"Familie & Vermögen",items:[{id:"unfall",name:"Unfallversicherung"},{id:"risikoleben",name:"Risikolebensversicherung"},{id:"sparen_investieren",name:"Sparen & Investieren"}]},
];

const WIZARD_MICRO_EMP_LABEL = {
  angestellt: "Angestellte/r",
  selbstständig: "Selbstständige/r",
  verbeamtet: "Beamte/r",
  ausbildung_studium: "Studierende/r oder Auszubildende/r",
};

const WIZARD_MICRO_JOB_PHRASE = {
  buero: "Büro & Verwaltung",
  koerperlich: "Handwerk & körperlich fordernde Tätigkeit",
  medizinisch_sozial: "Sozial & Medizin",
  sonstiges: "gemischter oder anderer Tätigkeit",
};

const WIZARD_MICRO_NET_LABEL = {
  "1500_2500": "unter 2.000 € Netto",
  "2500_4000": "2.000 – 3.500 € Netto",
  "4000_6000": "3.500 – 5.000 € Netto",
  over_6000: "über 5.000 € Netto",
};

const WIZARD_MICRO_STORY_MS = 3600;

function wizardMicroStoryEmployment(profil) {
  const emp =
    WIZARD_MICRO_EMP_LABEL[profil.employmentStatus] || "in Ihrer beruflichen Situation";
  const job = WIZARD_MICRO_JOB_PHRASE[profil.jobType] || "Ihrer Tätigkeit";
  return `Verstanden. Als ${emp} im Bereich „${job}“ tragen Sie ein spezifisches Haftungsrisiko. Das berücksichtigen wir.`;
}

function wizardMicroStoryAge(age) {
  if (age <= 24) {
    return "Perfekter Zeitpunkt. Der Faktor Zeit ist Ihr größter Verbündeter beim Vermögensaufbau.";
  }
  if (age >= 50) {
    return "Fokus auf Stabilität. Wir priorisieren den Schutz Ihres bereits Erreichten.";
  }
  return "Guter Zeitpunkt — wir gewichten Vorsorge und Risiko passend zu Ihrer Lebensphase.";
}

function wizardMicroStoryIncome(profil) {
  const band = WIZARD_MICRO_NET_LABEL[profil.netIncome] || "Ihrem Nettoeinkommen";
  return `Kalkuliere … Bei ${band} monatlich ist die Absicherung Ihrer Arbeitskraft das Fundament Ihrer Freiheit.`;
}

function WizardMicroMomentBanner({ text, C }) {
  return (
    <div style={{ padding: "0 24px 14px" }} className="fade-in" role="status" aria-live="polite">
      <p
        style={{
          fontSize: "15px",
          fontWeight: "500",
          color: "#374151",
          lineHeight: 1.6,
          textAlign: "center",
          maxWidth: "min(400px, 100%)",
          margin: "0 auto",
          padding: "14px 18px",
          background: `${C}14`,
          border: `1px solid ${C}38`,
          borderRadius: "14px",
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Phase 1: Wizard (7 Screens) ─────────────────────────────────────────────
const WIZARD_TOTAL = 7;

const STEPS = ["Über Sie", "Bestand", "Ergebnis", "Kontakt"];

function Phase1({profil,set,existing,toggle,onWeiter,C,T,firma,telefon,result}){
  const[scr,setScr]=useState(1);
  const[microTransition,setMicroTransition]=useState(null);
  const jobTypeSectionRef = useRef(null);
  const prevEmploymentRef = useRef(profil.employmentStatus);
  useCheckScrollToTop([scr,microTransition]);

  useEffect(() => {
    if (scr !== 2) {
      prevEmploymentRef.current = profil.employmentStatus;
      return;
    }
    const prev = prevEmploymentRef.current;
    const cur = profil.employmentStatus;
    if (!cur || cur === prev) return;
    prevEmploymentRef.current = cur;
    const id = requestAnimationFrame(() => {
      jobTypeSectionRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [scr, profil.employmentStatus]);
  const mark=textOnAccent(C);
  const canNext =
    scr === 1 || scr === WIZARD_TOTAL
      ? true
      : scr === 2
        ? !!(profil.employmentStatus && profil.jobType)
        : scr === 3
          ? profil.age >= 18 && profil.age <= 67
          : scr === 4
            ? !!profil.familyStatus
            : scr === 5
              ? !!profil.housingStatus
              : !!profil.netIncome;

  useEffect(() => {
    if (!microTransition) return undefined;
    const id = window.setTimeout(() => {
      setScr(microTransition.toScr);
      setMicroTransition(null);
    }, WIZARD_MICRO_STORY_MS);
    return () => window.clearTimeout(id);
  }, [microTransition]);

  const dimDuringMicro =
    microTransition && microTransition.fromScr === scr
      ? { opacity: 0.42, pointerEvents: "none", transition: "opacity 0.25s ease" }
      : {};

  const goForward = () => {
    if (microTransition) return;
    if (scr === 2 && canNext) {
      setMicroTransition({ fromScr: 2, toScr: 3, text: wizardMicroStoryEmployment(profil) });
      return;
    }
    if (scr === 3 && canNext) {
      setMicroTransition({ fromScr: 3, toScr: 4, text: wizardMicroStoryAge(profil.age) });
      return;
    }
    if (scr === 6 && canNext) {
      setMicroTransition({ fromScr: 6, toScr: 7, text: wizardMicroStoryIncome(profil) });
      return;
    }
    if (scr < WIZARD_TOTAL) setScr((s) => s + 1);
    else onWeiter();
  };

  const back = () => {
    if (microTransition) {
      setMicroTransition(null);
      return;
    }
    if (scr > 1) setScr((s) => s - 1);
  };
  const blockForward = microTransition !== null;
  const sectionLbl = { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" };
  const step = scr <= 6 ? 0 : 1;
  return(
    <div className="check-root fade-in" style={{ ...T.page, ...T.fadeIn }}>
      <CheckHeader firma={firma} telefon={telefon} steps={STEPS} currentStep={step} accent={C} />

      {scr===1&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>In wenigen Schritten</div>
          <div style={T.h1}>Wie gut sind Sie aktuell abgesichert?</div>
          <div style={T.hint}>Wir schauen gemeinsam an, wo Ihr Schutz ausreicht — und wo Lücken bestehen.</div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(false)} onClick={goForward}>Check starten</button></div>
      </>}

      {scr===2&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Beruflicher Rahmen</div>
          <div style={T.h1}>Wie arbeiten Sie?</div>
          <div style={T.hint}>Wählen Sie zuerst Ihren Status, dann Ihre Tätigkeitsart — beides fließt in die Einschätzung ein.</div>
        </div>
        {microTransition?.fromScr === 2 ? <WizardMicroMomentBanner text={microTransition.text} C={C} /> : null}
        <div style={dimDuringMicro}>
          <div style={T.section}>
            <div style={sectionLbl}>Rechtlicher Status</div>
            <Opts k="employmentStatus" opts={EMP_OPTS} profil={profil} set={set} C={C} T={T} />
          </div>
          <div ref={jobTypeSectionRef} style={{ ...T.section, scrollMarginTop: "72px" }}>
            <div style={sectionLbl}>Tätigkeitsart</div>
            <Opts k="jobType" opts={JOB_OPTS} cols={2} profil={profil} set={set} C={C} T={T} />
          </div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(!canNext || blockForward)} disabled={!canNext || blockForward} onClick={goForward}>{blockForward ? "Einen Moment …" : "Weiter →"}</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===3&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihr Alter</div>
          <div style={T.h1}>Wie alt sind Sie?</div>
        </div>
        {microTransition?.fromScr === 3 ? <WizardMicroMomentBanner text={microTransition.text} C={C} /> : null}
        <div style={dimDuringMicro}>
          <div style={{ textAlign: "center", padding: "8px 24px 0" }}>
            <div style={{ fontSize: "52px", fontWeight: "800", color: C, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "6px" }}>{profil.age}</div>
            <div style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "20px" }}>Jahre</div>
          </div>
          <div style={T.section}>
            <SliderCard
              label="Ihr Alter"
              value={profil.age}
              min={18}
              max={67}
              step={1}
              unit="Jahre"
              display={`${profil.age} Jahre`}
              accent={C}
              onChange={(v) => set("age", v)}
            />
          </div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(!canNext || blockForward)} disabled={!canNext || blockForward} onClick={goForward}>{blockForward ? "Einen Moment …" : "Weiter →"}</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===4&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Verantwortung</div>
          <div style={T.h1}>Für wen tragen Sie aktuell Verantwortung?</div>
        </div>
        <div style={T.section}>
          <Opts k="familyStatus" opts={FAM_OPTS} profil={profil} set={set} C={C} T={T} />
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(!canNext || blockForward)} disabled={!canNext || blockForward} onClick={goForward}>Weiter →</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===5&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Wohnsituation</div>
          <div style={T.h1}>Wie wohnen Sie aktuell?</div>
        </div>
        <div style={T.section}>
          <Opts k="housingStatus" opts={HSG_OPTS} profil={profil} set={set} C={C} T={T} />
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(!canNext || blockForward)} disabled={!canNext || blockForward} onClick={goForward}>Weiter →</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===6&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihr Einkommen</div>
          <div style={T.h1}>Wie hoch ist Ihr monatliches Nettoeinkommen?</div>
        </div>
        {microTransition?.fromScr === 6 ? <WizardMicroMomentBanner text={microTransition.text} C={C} /> : null}
        <div style={{ ...T.section, ...dimDuringMicro }}>
          <Opts k="netIncome" opts={INC_OPTS} cols={2} profil={profil} set={set} C={C} T={T} />
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(!canNext || blockForward)} disabled={!canNext || blockForward} onClick={goForward}>{blockForward ? "Einen Moment …" : "Weiter →"}</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===7&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Bestehende Absicherung</div>
          <div style={T.h1}>Was haben Sie bereits abgesichert?</div>
          <div style={T.hint}>Alles antippen, was bereits vorhanden ist — was fehlt, sehen Sie im Ergebnis.</div>
        </div>
        {EX_GROUPS.map(group=>(
          <div key={group.label} style={T.section}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px"}}>{group.label}</div>
            <div style={T.multiList}>
              {group.items.map((item,i)=>{
                const checked=existing.includes(item.id);
                const isLast=i===group.items.length-1;
                return(
                  <div key={item.id} role="button" tabIndex={0}
                    onClick={()=>toggle(item.id)}
                    onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(item.id);}}}
                    style={isLast?T.multiRowLast:T.multiRow}>
                    <span style={T.multiLabel}>{item.name}</span>
                    <div style={T.checkbox(checked)}>
                      {checked?(<svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden><path d="M1 4L3.5 6.5L9 1" stroke={mark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>):null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {result && result.anzahlLuecken > 0 && (
          <div style={{ padding: "0 24px", marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "rgba(31,41,55,0.03)",
                border: "1px solid rgba(31,41,55,0.08)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Erkannte Lücken (Top 4)</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#B83232", letterSpacing: "-0.3px" }}>
                {result.anzahlLuecken}
              </div>
            </div>
          </div>
        )}
        <div style={{padding:"0 24px",marginBottom:"8px"}}><div style={T.infoBlue}>Nicht sicher? Einfach weitergehen — im Ergebnis sehen Sie was fehlt.</div></div>
        <div style={{height:"120px"}}/>
        <div style={T.footer} data-checkkit-footer>
          <button style={T.btnPrim(false)} onClick={onWeiter}>Mein Ergebnis ansehen{existing.length>0?` · ${existing.length} vorhanden`:""}</button>
          <button style={T.btnSec} onClick={back}>Zurück</button>
        </div>
      </>}
    </div>
  );
}

// ── Story: Übergang vor Paketen ──────────────────────────────────────────────
function BedarfStoryScreen({ profil, onContinue, C, T, firma, telefon }) {
  let body =
    "Wir haben Ihre Angaben mit typischen Risiken abgeglichen. Als Nächstes zeigen wir Ihre drei Pakete — von Basis bis Premium.";
  if (profil.employmentStatus === "ausbildung_studium") {
    body =
      "In Ihrer Phase zählt vor allem ein günstiger Einstieg und der Schutz Ihrer Zukunft. Wir haben die Tarife für junge Leute priorisiert.";
  } else if (profil.familyStatus === "mit_kindern") {
    body =
      "Die Sicherheit Ihrer Liebsten steht an erster Stelle. Wir haben Ihren Bedarf so kalkuliert, dass Ihre Familie in jedem Szenario stabil bleibt.";
  } else if (profil.employmentStatus === "selbstständig") {
    body =
      "Da Sie Ihr eigenes Netz bauen, liegt unser Fokus auf der lückenlosen Einkommenssicherung ab dem ersten Krankheitstag.";
  }

  return (
    <div className="check-root fade-in" style={{ ...T.page, ...T.fadeIn }}>
      <CheckHeader firma={firma} telefon={telefon} steps={STEPS} currentStep={0} showProgressBar={false} accent={C} />
      <div style={{ ...CHECKKIT2026.storyRoot, background: "#ffffff" }}>
        <div style={{ ...CHECKKIT2026.storySection, background: "transparent" }}>
          <div style={CHECKKIT2026.storyContentWrap}>
            <div
              style={{
                ...CHECKKIT2026.storyEyebrow,
                color: C,
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: 14,
              }}
            >
              Ihre Analyse ist bereit.
            </div>
            <h1 style={{ ...CHECKKIT2026.storyH1, color: "#111827" }}>Wir haben Ihren Schutzbedarf ermittelt.</h1>
            <p style={{ ...CHECKKIT2026.storyBody, marginBottom: 28 }}>{body}</p>
            <button type="button" style={T.btnPrim(false)} onClick={onContinue}>
              Meine Pakete ansehen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Phase 3: Ergebnis — 3 Pakete (Level-up, Anker-Reihenfolge) ────────────────
function Phase3({ result, onCTA, onReset, isDemo, C, T, firma, telefon, gewaehltePakete, onTogglePaket }) {
  const phase = 3;
  const step = phase === 1 ? 0 : phase === 3 ? 2 : phase === 4 ? 3 : 0;
  const { basis, komfort, premium, alreadyCovered, showKinderHint, schutzProzent, topVierAnzahl, abgedecktInTopVier, empfBU, anzahlLuecken } = result;

  const alreadyHasBuOrEu = alreadyCovered.some(
    (item) => item.id === "berufsunfaehigkeit" || item.id === "erwerbsunfaehigkeit",
  );
  const showEmpfBuCard = !alreadyHasBuOrEu;

  const columns = [
    {
      key: "basis",
      emoji: "🛡️",
      title: "Basis",
      count: 2,
      tagline: "Das Existenzielle",
      badge: null,
      items: basis,
    },
    {
      key: "komfort",
      emoji: "⭐",
      title: "Komfort",
      count: 3,
      tagline: "",
      badge: "Empfehlung",
      items: komfort,
    },
    {
      key: "premium",
      emoji: "👑",
      title: "Premium",
      count: 4,
      tagline: "Maximaler Schutz",
      badge: null,
      items: premium,
    },
  ];

  return (
    <div className="check-root fade-in" style={{ ...T.page, ...T.fadeIn }}>
      <CheckHeader firma={firma} telefon={telefon} steps={STEPS} currentStep={step} accent={C} />

      <div style={{ ...CHECKKIT2026.storySection, textAlign: "center", background: "#ffffff" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#6B7280", letterSpacing: "0.04em", marginBottom: "10px" }}>
          Ihre Absicherung im Überblick
        </div>
        <div style={{ fontSize: "56px", fontWeight: "800", color: C, letterSpacing: "-3px", lineHeight: 1, marginBottom: "6px" }}>
          {schutzProzent}%
        </div>
        <div style={{ fontSize: "14px", color: "#374151", fontWeight: "600", marginBottom: "4px" }}>geschätzt abgedeckt</div>
        <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5 }}>
          {topVierAnzahl > 0
            ? `${abgedecktInTopVier} von ${topVierAnzahl} wichtigen Themen abgedeckt`
            : "Keine priorisierten Schwerpunkte im Modell."}
        </div>
      </div>

      <div style={{ padding: "0 20px", marginBottom: "16px" }}>
        <div style={{ ...T.dynamicCard, padding: "20px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "500",
              color: "#9CA3AF",
              letterSpacing: "0.3px",
              marginBottom: "10px",
            }}
          >
            Auf Basis Ihrer Angaben
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: showEmpfBuCard ? "1fr 1fr" : "1fr",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "#FFF7F7",
                border: "1px solid #F2CFCF",
                borderRadius: "14px",
                padding: "14px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#B83232",
                  letterSpacing: "-0.6px",
                }}
              >
                {anzahlLuecken}
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "500", marginTop: "3px" }}>wichtige Lücken</div>
            </div>
            {showEmpfBuCard ? (
              <div
                style={{
                  background: "#F5F8FF",
                  border: "1px solid rgba(26,58,92,0.14)",
                  borderRadius: "14px",
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: C,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {formatBedarfEuro(empfBU)}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "500", marginTop: "3px" }}>Empfohlene BU-Rente</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {alreadyCovered.length > 0 ? (
        <div style={{ padding: "0 20px", marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#1E7A46",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5" fill="#F6FCF7" stroke="#CBE9D4" />
              <path
                d="M3.5 6l2 2 3-3"
                stroke="#1E7A46"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Bereits abgesichert
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {alreadyCovered.map((item) => (
              <span
                key={item.id}
                style={{
                  fontSize: "12px",
                  color: "#237446",
                  background: "#F6FCF7",
                  border: "1px solid #CBE9D4",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontWeight: "500",
                }}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ ...T.section, paddingTop: "4px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#6B7280",
            marginBottom: "10px",
            lineHeight: 1.45,
          }}
        >
          Für die Beratung ein Paket auswählen — antippen zum Wechseln.
        </div>
        <CheckKitResultGrid className="check-paket-grid">
          {columns.map((col) => {
            const paketAn = gewaehltePakete.includes(col.key);
            const baseStyle = {
              ...CHECKKIT2026.resultColumnStack,
              background: "#ffffff",
              minHeight: 0,
              ...(col.badge ? { position: "relative" } : {}),
            };
            const selectedStyle = {
              border: `2px solid ${C}`,
              boxShadow: `0 0 0 1px ${C}29, 0 4px 12px rgba(0,0,0,0.08)`,
            };
            const finalWrapStyle = {
              ...baseStyle,
              ...(paketAn ? selectedStyle : {}),
            };
            return (
              <button
                key={col.key}
                type="button"
                aria-pressed={paketAn}
                aria-label={`Paket ${col.title}, ${paketAn ? "ausgewählt" : "nicht ausgewählt"}. Antippen zum Auswählen.`}
                onClick={() => onTogglePaket(col.key)}
                style={{
                  ...finalWrapStyle,
                  width: "100%",
                  margin: 0,
                  textAlign: "left",
                }}
              >
                {col.badge ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "-11px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#F59E0B",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "800",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)",
                      pointerEvents: "none",
                    }}
                  >
                    {col.badge}
                  </div>
                ) : null}
                <div
                  style={{
                    marginBottom: "12px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid rgba(17,24,39,0.08)",
                  }}
                >
                  {paketAn ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: C,
                        marginBottom: "6px",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : null}
                  <div style={{ fontSize: "18px", lineHeight: 1.2, marginBottom: "4px" }} aria-hidden>
                    {col.emoji}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#1F2937" }}>{col.title}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: "600", marginTop: "4px" }}>
                    Top {col.count} · {col.key === "basis" ? col.tagline : col.key === "premium" ? col.tagline : "Meistgewählt"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  {col.items.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#9CA3AF" }}>—</div>
                  ) : (
                    col.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          ...CHECKKIT2026.resultCard,
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "22px", lineHeight: 1 }} aria-hidden>
                          {item.icon}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                          {item.shortLabel}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </button>
            );
          })}
        </CheckKitResultGrid>
      </div>

      {showKinderHint ? (
        <div style={{ padding: "0 24px", marginBottom: "8px" }}>
          <div
            style={{
              padding: "14px 16px",
              background: "#F0F9FF",
              border: "1px solid #BAE6FD",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#0369A1",
              lineHeight: 1.5,
            }}
          >
            💡 Hinweis: Prüfen Sie zusätzlich eine Invaliditätsabsicherung für Ihr Kind.
          </div>
        </div>
      ) : null}

      <div style={{ padding: "0 24px", marginBottom: "120px" }}>
        <CheckBerechnungshinweis t={T}>
          <>
            Wir bewerten Ihre Situation anhand von Alter, Beruf und familiärer Lage und ordnen die wichtigsten
            Absicherungsthemen nach Priorität. Das Ergebnis gibt Ihnen einen ersten Überblick — kein Ersatz für ein
            persönliches Gespräch.
          </>
        </CheckBerechnungshinweis>
        <div
          style={{
            marginTop: "10px",
            fontSize: "11px",
            color: "#9CA3AF",
            lineHeight: 1.55,
          }}
        >
          {CHECK_LEGAL_DISCLAIMER_FOOTER}
        </div>
      </div>

      <div style={T.footer} data-checkkit-footer>
        {isDemo ? (
          <button style={T.btnPrim(false)} onClick={() => window.parent.postMessage({ type: "openConfig", slug: "bedarfscheck" }, "*")}>
            Anpassen & kaufen
          </button>
        ) : (
          <button style={T.btnPrim(gewaehltePakete.length === 0)} disabled={gewaehltePakete.length === 0} onClick={onCTA}>
            {gewaehltePakete.length === 0
              ? "Paket wählen"
              : `${BEDARF_PAKET_LABELS[gewaehltePakete[0]] ?? "Paket"}-Paket besprechen`}
          </button>
        )}
        <button style={T.btnSec} onClick={onReset}>Neue Einschätzung starten</button>
      </div>
    </div>
  );
}

// Phase 4: Kontakt
function Phase4({ onAbsenden, onZurueck, isDemo, makler, C, T, firma, gewaehltePakete = [], leadHighlights = [] }) {
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[consent,setConsent]=useState(false);
  const valid=fd.name.trim()&&fd.email.trim()&&consent;
  const phase = 4;
  const step = phase === 1 ? 0 : phase === 3 ? 2 : phase === 4 ? 3 : 0;
  return(<div className="check-root fade-in" style={{ ...T.page, ...T.fadeIn }}>
    <CheckHeader firma={firma} telefon={makler.telefon} steps={STEPS} currentStep={step} accent={C} />
    <div style={T.hero}>
      <div style={T.eyebrow}>Fast geschafft</div>
      <div style={T.h1}>Wo können wir Sie erreichen?</div>
      <div style={T.hint}>Wir melden uns innerhalb von 24 Stunden mit Ihrem Ergebnis.</div>
    </div>
    {!isDemo && gewaehltePakete.length > 0 ? (
      <div style={{ padding: "0 24px", marginBottom: "12px" }}>
        <div
          style={{
            padding: "14px 16px",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#6B7280",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Deine Paketauswahl
          </div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            {gewaehltePakete.map((k) => BEDARF_PAKET_LABELS[k] ?? k).join(", ")}
          </div>
        </div>
      </div>
    ) : null}
    {isDemo ? (
      <>
        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
            Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.
          </div>
          <button
            type="button"
            style={{ ...T.btnPrim(false) }}
            onClick={() =>
              window.parent.postMessage(
                { type: "openConfig", slug: "bedarfscheck" },
                "*",
              )
            }
          >
            Anpassen & kaufen
          </button>
        </div>
        <div style={T.footer} data-checkkit-footer><button type="button" style={T.btnSec} onClick={onZurueck}>Zurück</button></div>
      </>
    ) : (
    <>
    <div style={T.section}>
      <CheckKontaktLeadLine />
      <div style={T.card}>
      {[{k:"name",l:"Ihr Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Ihre E-Mail",t:"email",ph:"ihre@email.de",req:true},{k:"tel",l:"Ihre Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
        <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.input,marginTop:"4px"}}/>{hint&&<div style={T.fldHint}>{hint}</div>}</div>
      ))}
    </div>
    <div style={{marginTop:"14px",marginBottom:"100px"}}>
      <CheckKontaktBeforeSubmitBlock maklerName={makler.name} consent={consent} onConsentChange={setConsent} />
    </div>
    </div>
    <div style={T.footer} data-checkkit-footer><button style={T.btnPrim(!valid)} disabled={!valid} onClick={()=>valid&&onAbsenden(fd, leadHighlights)}>{valid?"Ergebnis gemeinsam durchgehen":"Bitte alle Angaben machen"}</button><button style={T.btnSec} onClick={onZurueck}>Zurück</button></div>
    </>
    )}
  </div>);}

// Danke
function DankeScreen({ name, onReset, makler, C, T, firma }) {
  return(<div className="check-root fade-in" style={{ ...T.page, ...T.fadeIn }}>
    <CheckHeader firma={firma} telefon={makler.telefon} steps={STEPS} currentStep={STEPS.length} accent={C} />
    <div style={T.dankeScreen}>
      <div style={T.dankeRing(C)}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={T.dankeH}>{name?`Vielen Dank, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={T.dankeBody}>Wir prüfen Ihr Ergebnis und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
      <div style={T.maklerCard}>
        <div style={T.maklerTop}>
          <div style={T.maklerName}>{makler.name}</div>
          <div style={T.maklerFirma}>{makler.firma}</div>
        </div>
        <div style={T.maklerLinks}>
          <a href={`tel:${makler.telefon}`} style={T.maklerLink(C)}>{makler.telefon}</a>
          <a href={`mailto:${makler.email}`} style={T.maklerLink(C)}>{makler.email}</a>
        </div>
      </div>
      <button type="button" onClick={onReset} style={{...T.btnSec,marginTop:"16px"}}>Neuen Check starten</button>
    </div></div>);}

// Root
export default function Bedarfscheck(){
  const isDemo = isCheckDemoMode();
  const makler = useCheckConfig();
  const { isReady } = makler;
  const C = makler.primaryColor;
  const T = useMemo(() => checkStandardT(C), [C]);
  const firma = makler.firma;
  const telefon = makler.telefon;
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[loading,setLoading]=useState(false);const[storyScreen,setStoryScreen]=useState(false);const[kontaktName,setKontaktName]=useState("");
  const emptyProfil = () => ({
    age: 18,
    employmentStatus: "",
    jobType: "",
    netIncome: "",
    familyStatus: "",
    housingStatus: "",
    healthStatus: "gkv",
  });
  const[profil,setProfil]=useState(emptyProfil);
  const[existing,setExisting]=useState([]);
  const [gewaehltePakete, setGewaehltePakete] = useState(() => [...BEDARF_PAKET_DEFAULT_KEYS]);
  const set=(k,v)=>setProfil(x=>({...x,[k]:v}));
  const toggle=(id)=>setExisting(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const togglePaket = (key) => {
    setGewaehltePakete([key]);
  };
  const slug = "bedarfscheck";
  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 3) {
      const t = new URLSearchParams(window.location.search).get("token") ?? undefined;
      if (t) void trackEvent({ event_type: "check_completed", slug, token: t, firma: makler.firma });
    }
  };
  useCheckScrollToTop([phase, ak, danke, loading, storyScreen]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? undefined;
    if (!token) return;
    void trackEvent({ event_type: "check_started", slug, token, firma: makler.firma });
  }, []);

  if (!isReady) return <CheckConfigLoadingShell />;

  const withStandalone = (el) => (
    <StandaloneWrapper makler={makler}>{el}</StandaloneWrapper>
  );

  const reset=()=>{setPhase(1);setAk(k=>k+1);setDanke(false);setLoading(false);setStoryScreen(false);setProfil(emptyProfil());setExisting([]);setKontaktName("");setGewaehltePakete([...BEDARF_PAKET_DEFAULT_KEYS]);};
  const profilReady=
    profil.employmentStatus &&
    profil.jobType &&
    profil.age >= 18 &&
    profil.age <= 67 &&
    profil.netIncome &&
    profil.familyStatus &&
    profil.housingStatus;
  const result=profilReady?buildPackageScoringResult(profil,existing):null;
  if(danke)return withStandalone(<DankeScreen name={kontaktName} onReset={reset} makler={makler} C={C} T={T} firma={firma}/>);
  if(loading)return withStandalone(<div className="check-root" style={T.page} key={ak}><CheckHeader firma={firma} telefon={telefon} steps={STEPS} currentStep={0} showProgressBar={false} accent={C} /><CheckLoader type="bedarf" checkmarkColor={C} bedarfContext={{ age:profil.age,jobType:profil.jobType,familyStatus:profil.familyStatus,employmentStatus:profil.employmentStatus }} onComplete={()=>{setLoading(false);setStoryScreen(true);}}/></div>);
  if(storyScreen&&result)return withStandalone(<BedarfStoryScreen key={`${ak}-story`} profil={profil} onContinue={()=>{setStoryScreen(false);goTo(3);}} C={C} T={T} firma={firma} telefon={telefon}/>);
  if(phase===4){
    const leadHighlights=result?[
      {label:"Schutzquote (Top 4)",value:`${result.schutzProzent}%`},
      {label:"Lücken in Top 4",value:String(result.anzahlLuecken)},
      {label:"Empf. BU-Rente (Orient.)",value:formatBedarfEuro(result.empfBU)},
      {label:"Abgedeckt in Top 4",value:`${result.abgedecktInTopVier} von ${result.topVierAnzahl}`},
    ]:[];
    return withStandalone(<Phase4 key={ak} isDemo={isDemo} gewaehltePakete={gewaehltePakete} leadHighlights={leadHighlights} onAbsenden={async (fd,highlights)=>{const token=new URLSearchParams(window.location.search).get("token");if(token){const res=await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug,kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||"",gewaehltePakete,highlights:highlights||[]})}).catch(()=>null);if(res?.ok)void trackEvent({event_type:"lead_submitted",slug,token,firma:makler.firma});}setKontaktName(fd.name);setDanke(true);}} onZurueck={()=>goTo(3)} makler={makler} C={C} T={T} firma={firma}/>);
  }
  if(phase===3&&result)    return withStandalone(<Phase3 key={ak} isDemo={isDemo} result={result} gewaehltePakete={gewaehltePakete} onTogglePaket={togglePaket} onCTA={()=>goTo(4)} onReset={reset} C={C} T={T} firma={firma} telefon={telefon}/>);
  return withStandalone(<Phase1 key={ak} profil={profil} set={set} existing={existing} toggle={toggle} onWeiter={()=>setLoading(true)} C={C} T={T} firma={firma} telefon={telefon} result={result}/>);
}
