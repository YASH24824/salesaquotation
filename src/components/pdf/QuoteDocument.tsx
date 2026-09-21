


import type { Style } from "@react-pdf/types";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  Link,
} from "@react-pdf/renderer";
import { FullQuote, Stat } from "@/lib/types";
import { computeTotals, formatCurrency } from "@/lib/calc";

/* ================================================================== */
/* fonts                                                              */
/* ================================================================== */

Font.register({
  family: "Noto Sans",
  fonts: [
    { src: "/fonts/NotoSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSans-Bold.ttf", fontWeight: "bold" },
  ],
});

// Optional: drop a serif next to your sans for the "QUOTATION" plate and the
// footer sign-off, then set DISPLAY_FAMILY to "Noto Serif".
// Font.register({
//   family: "Noto Serif",
//   fonts: [
//     { src: "/fonts/NotoSerif-Regular.ttf", fontWeight: "normal" },
//     { src: "/fonts/NotoSerif-Bold.ttf", fontWeight: "bold" },
//   ],
// });
const SANS = "Noto Sans";
const DISPLAY_FAMILY = SANS; // -> "Noto Serif" once registered above

// Never auto-hyphenate. Long strings are broken deliberately by <SplitText/>
// below, so react-pdf must not insert its own hyphens.
Font.registerHyphenationCallback((word) => [word]);

/* ================================================================== */
/* geometry + color helpers                                           */
/* ================================================================== */

const PAGE_PAD_X = 19;
const CONTENT_W = 595.28 - PAGE_PAD_X * 2; // ~557pt of usable width
const FOOTER_H = 60; // reserved space for the (variable-height) footer bar

function clampHex(hex: string | undefined, fallback: string) {
  const h = (hex ?? "").trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h) ? h : fallback;
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(f.slice(0, 2), 16),
    parseInt(f.slice(2, 4), 16),
    parseInt(f.slice(4, 6), 16),
  ];
}

/** Blend toward white and return a solid hex — PDF viewers handle opaque
 *  fills far more predictably than rgba(). */
function tint(hex: string, amount: number) {
  const [r, g, b] = toRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Shrink a font size when the string is longer than the space allows.
 *  Used for names, totals and anything else that must stay on one line. */
function fitSize(text: string | undefined, base: number, comfortableChars: number, min = 6.5) {
  const len = (text ?? "").length;
  if (len <= comfortableChars) return base;
  return Math.max(min, Math.round(base * (comfortableChars / len) * 10) / 10);
}

/* ================================================================== */
/* long-text handling                                                 */
/* ================================================================== */

/** react-pdf's own style prop type. Do not hand-roll this as `object`, and do
 *  not derive it via ComponentProps<typeof Text> — Text is overloaded (regular
 *  vs SVG text), so the derived union satisfies neither overload. */
type PdfTextStyle = Style | Style[];

const BREAK_AFTER = "@._-/+,";

/** Splits a string after @ . _ - / + so it can wrap.
 *  Rendered as sibling <Text> nodes inside a wrapping row, which means Yoga
 *  does the wrapping — no zero-width spaces, no font-dependent glyphs, no
 *  hyphens. Use for emails, websites, GSTINs, quote numbers, long names. */
function splitLong(value: string, maxChunk = 12) {
  const parts: string[] = [];
  let cur = "";
  for (const ch of value) {
    cur += ch;
    if (BREAK_AFTER.includes(ch) || cur.length >= maxChunk) {
      parts.push(cur);
      cur = "";
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

function SplitText({
  children,
  style,
  align = "flex-start",
}: {
  children?: string | null;
  style?: PdfTextStyle;
  align?: "flex-start" | "flex-end" | "center";
}) {
  const value = (children ?? "").toString();
  if (!value) return null;
  // Strings with spaces already have break opportunities, and short strings
  // never need one — only unbroken runs get split.
  if (/\s/.test(value) || value.length <= 18) {
    return <Text style={style}>{value}</Text>;
  }
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        flexShrink: 1,
        justifyContent: align,
      }}
    >
      {splitLong(value).map((p, i) => (
        <Text key={i} style={style}>
          {p}
        </Text>
      ))}
    </View>
  );
}

/* ================================================================== */
/* icons — hand-drawn with react-pdf SVG primitives                   */
/* ================================================================== */

type IconName =
  | "user"
  | "phone"
  | "mail"
  | "globe"
  | "clipboard"
  | "calendar"
  | "hourglass"
  | "pin"
  | "search"
  | "monitor"
  | "megaphone"
  | "pen"
  | "file"
  | "cart"
  | "share"
  | "package"
  | "users"
  | "star"
  | "award";

function Icon({
  name,
  size = 14,
  color = "#ffffff",
  weight = 1.7,
  fill = "none",
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: number;
  fill?: string;
}) {
  const p = { stroke: color, strokeWidth: weight, fill, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "user" && (
        <>
          <Circle cx="12" cy="8" r="3.6" {...p} />
          <Path d="M4.6 20.2 C4.6 16.4 7.9 14.4 12 14.4 C16.1 14.4 19.4 16.4 19.4 20.2" {...p} />
        </>
      )}
      {name === "phone" && (
        <Path
          d="M6.4 3.4 L9.8 3.4 L11.3 7.2 L9.1 8.7 C10.1 11 13 13.9 15.3 14.9 L16.8 12.7 L20.6 14.2 L20.6 17.6 C20.6 18.8 19.6 19.7 18.4 19.5 C10.6 18.4 5.6 13.4 4.5 5.6 C4.3 4.4 5.2 3.4 6.4 3.4 Z"
          {...p}
        />
      )}
      {name === "mail" && (
        <>
          <Rect x="3" y="5.2" width="18" height="13.6" {...p} />
          <Path d="M3.4 6 L12 12.6 L20.6 6" {...p} />
        </>
      )}
      {name === "globe" && (
        <>
          <Circle cx="12" cy="12" r="9" {...p} />
          <Line x1="3" y1="12" x2="21" y2="12" {...p} />
          <Path d="M12 3 C15.2 6.6 15.2 17.4 12 21 C8.8 17.4 8.8 6.6 12 3 Z" {...p} />
        </>
      )}
      {name === "clipboard" && (
        <>
          <Path d="M9 4.4 H6.4 C5.6 4.4 5 5 5 5.8 V19.6 C5 20.4 5.6 21 6.4 21 H17.6 C18.4 21 19 20.4 19 19.6 V5.8 C19 5 18.4 4.4 17.6 4.4 H15" {...p} />
          <Rect x="9" y="2.6" width="6" height="3.6" {...p} />
          <Line x1="8.4" y1="11" x2="15.6" y2="11" {...p} />
          <Line x1="8.4" y1="15" x2="13.6" y2="15" {...p} />
        </>
      )}
      {name === "calendar" && (
        <>
          <Rect x="3.2" y="5" width="17.6" height="16" {...p} />
          <Line x1="3.2" y1="10" x2="20.8" y2="10" {...p} />
          <Line x1="8" y1="2.8" x2="8" y2="6.4" {...p} />
          <Line x1="16" y1="2.8" x2="16" y2="6.4" {...p} />
        </>
      )}
      {name === "hourglass" && (
        <>
          <Line x1="6.6" y1="3" x2="17.4" y2="3" {...p} />
          <Line x1="6.6" y1="21" x2="17.4" y2="21" {...p} />
          <Path d="M8 3 V5.4 C8 8.4 12 9.4 12 12 C12 14.6 8 15.6 8 18.6 V21" {...p} />
          <Path d="M16 3 V5.4 C16 8.4 12 9.4 12 12 C12 14.6 16 15.6 16 18.6 V21" {...p} />
        </>
      )}
      {name === "pin" && (
        <>
          <Path d="M12 21.4 C12 21.4 18.2 14.6 18.2 10.1 C18.2 6.4 15.5 3.5 12 3.5 C8.5 3.5 5.8 6.4 5.8 10.1 C5.8 14.6 12 21.4 12 21.4 Z" {...p} />
          <Circle cx="12" cy="10" r="2.5" {...p} />
        </>
      )}
      {name === "search" && (
        <>
          <Circle cx="10.6" cy="10.6" r="6.2" {...p} />
          <Line x1="15.2" y1="15.2" x2="20.4" y2="20.4" {...p} />
        </>
      )}
      {name === "monitor" && (
        <>
          <Rect x="2.6" y="4" width="18.8" height="12.6" {...p} />
          <Line x1="12" y1="16.6" x2="12" y2="20.4" {...p} />
          <Line x1="8.4" y1="20.4" x2="15.6" y2="20.4" {...p} />
          <Line x1="6" y1="8" x2="13" y2="8" {...p} />
        </>
      )}
      {name === "megaphone" && (
        <>
          <Path d="M3.4 10 V14 H6.6 L16 19 V5 L6.6 10 Z" {...p} />
          <Path d="M19 9 C20.4 10.4 20.4 13.6 19 15" {...p} />
          <Path d="M6.8 14.4 V19.4 H9.8 V16" {...p} />
        </>
      )}
      {name === "pen" && (
        <>
          <Path d="M15.4 3.4 L20.6 8.6 L8.6 20.6 L2.8 21.2 L3.4 15.4 Z" {...p} />
          <Line x1="13.4" y1="5.4" x2="18.6" y2="10.6" {...p} />
        </>
      )}
      {name === "file" && (
        <>
          <Path d="M6 2.8 H14 L18.6 7.4 V21.2 H6 Z" {...p} />
          <Path d="M14 2.8 V7.4 H18.6" {...p} />
          <Line x1="8.8" y1="12.4" x2="15.6" y2="12.4" {...p} />
          <Line x1="8.8" y1="16" x2="13.6" y2="16" {...p} />
        </>
      )}
      {name === "cart" && (
        <>
          <Path d="M2.6 3.4 H5.4 L7.8 15 H18.4 L20.6 6.6 H6.4" {...p} />
          <Circle cx="9" cy="19.4" r="1.6" {...p} />
          <Circle cx="17.4" cy="19.4" r="1.6" {...p} />
        </>
      )}
      {name === "share" && (
        <>
          <Circle cx="18" cy="5.4" r="2.6" {...p} />
          <Circle cx="6" cy="12" r="2.6" {...p} />
          <Circle cx="18" cy="18.6" r="2.6" {...p} />
          <Line x1="8.3" y1="10.8" x2="15.7" y2="6.6" {...p} />
          <Line x1="8.3" y1="13.2" x2="15.7" y2="17.4" {...p} />
        </>
      )}
      {name === "users" && (
        <>
          <Circle cx="9" cy="8" r="3.3" {...p} />
          <Path d="M2.6 20 C2.6 16.2 5.4 14.2 9 14.2 C12.6 14.2 15.4 16.2 15.4 20" {...p} />
          <Circle cx="17.2" cy="9" r="2.6" {...p} />
          <Path d="M16.8 14.4 C19.6 14.6 21.6 16.4 21.6 19.6" {...p} />
        </>
      )}
      {name === "star" && (
        <Path d="M12 2.8 L14.9 8.9 L21.4 9.7 L16.6 14.2 L17.9 20.8 L12 17.5 L6.1 20.8 L7.4 14.2 L2.6 9.7 L9.1 8.9 Z" {...p} />
      )}
      {name === "award" && (
        <>
          <Circle cx="12" cy="9" r="5.8" {...p} />
          <Path d="M8.7 13.6 L7.2 21.4 L12 18.9 L16.8 21.4 L15.3 13.6" {...p} />
          <Path d="M12 6.4 L12.9 8.2 L14.9 8.5 L13.4 9.9 L13.8 11.9 L12 10.9 L10.2 11.9 L10.6 9.9 L9.1 8.5 L11.1 8.2 Z" {...p} />
        </>
      )}
      {name === "package" && (
        <>
          <Path d="M12 2.6 L20.6 7.2 V16.8 L12 21.4 L3.4 16.8 V7.2 Z" {...p} />
          <Path d="M3.4 7.2 L12 11.8 L20.6 7.2" {...p} />
          <Line x1="12" y1="11.8" x2="12" y2="21.4" {...p} />
        </>
      )}
    </Svg>
  );
}

/** The item data has no icon field, so derive one from the service name. */
function serviceIcon(name: string): IconName {
  const n = (name || "").toLowerCase();
  if (/\bseo\b|search engine|keyword|ranking/.test(n)) return "search";
  if (/website|web dev|landing|page|app|development/.test(n)) return "monitor";
  if (/social|instagram|facebook|smm/.test(n)) return "share";
  if (/ads?|advertis|ppc|campaign|marketing/.test(n)) return "megaphone";
  if (/design|brand|logo|creative|graphic/.test(n)) return "pen";
  if (/content|blog|copy|writing|article/.test(n)) return "file";
  if (/ecommerce|e-commerce|shop|store|catalog/.test(n)) return "cart";
  return "package";
}

/* ================================================================== */
/* styles                                                             */
/* ================================================================== */

function makeStyles(navy: string, accent: string) {
  const iconTint = tint(accent, 0.1);
  const frameSoft = tint(navy, 0.35);
  const frameMid = tint(navy, 0.55);

  return StyleSheet.create({
    page: {
      fontSize: 9,
      fontFamily: SANS,
      color: "#1e293b",
      paddingTop: 15,
      paddingHorizontal: PAGE_PAD_X,
      paddingBottom: FOOTER_H + 30,
    },

    /* frame */
    frameOuter: { position: "absolute", top: 7, left: 7, right: 7, bottom: 7, borderWidth: 0.75, borderColor: frameSoft },
    frameInner: { position: "absolute", top: 13, left: 13, right: 13, bottom: 13, borderWidth: 0.75, borderColor: frameMid },
    corner: { position: "absolute", width: 26, height: 26, borderColor: navy },

    /* header */
    header: { height: 118, position: "relative" },
    headerRow: { position: "absolute", top: 0, left: 0, right: 0, height: 118, flexDirection: "row" },
    brandBox: { width: "43%", paddingLeft: 12, paddingTop: 26, justifyContent: "flex-start" },
    logo: { height: 68, width: 180, objectFit: "contain", objectPositionX: 0 },
    brandName: { fontFamily: SANS, fontWeight: "bold", color: navy, lineHeight: 1.15 },
    brandSite: { fontSize: 7.5, fontFamily: SANS, fontWeight: "bold", color: accent, marginTop: 3 },
    plate: { flex: 1, paddingTop: 22, paddingRight: 14, alignItems: "center" },
    plateTitle: { fontFamily: DISPLAY_FAMILY, fontWeight: "bold", fontSize: 27, letterSpacing: 2.4, color: "#ffffff" },
    plateSubRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    plateRule: { width: 26, height: 0.9, backgroundColor: accent },
    plateSub: { fontSize: 7, letterSpacing: 1.9, color: "#ffffff", marginHorizontal: 7 },

    /* meta strip */
    meta: { flexDirection: "row", borderBottomWidth: 0.75, borderBottomColor: "#e2e8f0", paddingTop: 14, paddingBottom: 14, paddingHorizontal: 6 },
    metaColL: { width: "31%", paddingRight: 12 },
    metaColC: { width: "36%", paddingHorizontal: 14, borderLeftWidth: 0.75, borderRightWidth: 0.75, borderColor: "#e2e8f0" },
    metaColR: { width: "33%", paddingLeft: 14 },
    capRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    cap: { fontSize: 7.5, fontFamily: SANS, fontWeight: "bold", color: accent, letterSpacing: 0.6, marginLeft: 8 },
    circle: { width: 22, height: 22, borderRadius: 11, backgroundColor: navy, alignItems: "center", justifyContent: "center" },
    partyName: { fontFamily: SANS, fontWeight: "bold", color: "#0f172a", lineHeight: 1.2 },
    partyLine: { fontSize: 8.5, color: "#475569", marginTop: 2 },
    contactRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 4 },
    contactText: { fontSize: 8.5, color: "#334155", marginLeft: 6 },

    metaRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: 0.75, borderBottomColor: "#e2e8f0", borderStyle: "dashed" },
    metaRowLast: { borderBottomWidth: 0 },
    metaIcon: { width: 17, height: 17, borderRadius: 3, backgroundColor: iconTint, alignItems: "center", justifyContent: "center" },
    metaKey: { width: 52, fontSize: 8.5, fontFamily: SANS, fontWeight: "bold", color: "#1e293b", marginLeft: 7, marginTop: 2 },
    metaVal: { flex: 1, fontSize: 8.5, color: "#475569", marginTop: 2 },

    /* table */
    tHead: { flexDirection: "row", alignItems: "center", backgroundColor: navy, paddingVertical: 7 },
    tHeadCell: { fontSize: 7.5, fontFamily: SANS, fontWeight: "bold", color: "#ffffff", letterSpacing: 1 },
    tRow: { flexDirection: "row", borderBottomWidth: 0.75, borderBottomColor: "#e2e8f0", minHeight: 44 },
    svcCell: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 10 },
    svcIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: iconTint, alignItems: "center", justifyContent: "center", marginRight: 9 },
    svcName: { fontSize: 10, fontFamily: SANS, fontWeight: "bold", color: navy, lineHeight: 1.25 },
    svcDesc: { fontSize: 7.5, color: "#64748b", lineHeight: 1.5, marginTop: 2.5 },
    numCell: { justifyContent: "center", alignItems: "center", paddingHorizontal: 4, borderLeftWidth: 0.75, borderLeftColor: "#e2e8f0" },
    numText: { fontSize: 9, fontFamily: SANS, fontWeight: "bold", color: "#1e293b", textAlign: "center" },
    lineTotal: { fontFamily: SANS, fontWeight: "bold", color: accent, textAlign: "center" },

    remarksCell: { justifyContent: "center", paddingVertical: 8, paddingHorizontal: 8, borderLeftWidth: 0.75, borderLeftColor: "#e2e8f0" },
    remarksText: { fontSize: 8, color: "#475569", lineHeight: 1.45 },

    colSvc: { width: "40%" },
    colPrice: { width: "15%" },
    colTotal: { width: "20%" },
    colRemarks: { width: "25%" },

    /* totals */
    totalsWrap: { flexDirection: "row" },
    notesBox: { width: "45%", paddingHorizontal: 10, paddingTop: 12, paddingBottom: 8 },
    notesCap: { fontSize: 7.5, fontFamily: SANS, fontWeight: "bold", color: accent, letterSpacing: 0.6, marginBottom: 4 },
    notesText: { fontSize: 8.5, color: "#475569", lineHeight: 1.5 },
    totalsCol: { width: "55%", borderLeftWidth: 0.75, borderLeftColor: "#e2e8f0" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 0.75, borderBottomColor: "#e2e8f0" },
    totalsLabel: { fontSize: 9, color: "#334155" },
    totalsVal: { fontSize: 9, fontFamily: SANS, fontWeight: "bold", color: "#0f172a" },
    totalsNeg: { fontSize: 9, fontFamily: SANS, fontWeight: "bold", color: "#dc2626" },
    grandWrap: { height: 40, position: "relative", justifyContent: "center" },
    grandInner: { position: "absolute", top: 0, left: 0, right: 0, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
    grandLabel: { fontSize: 11.5, fontFamily: SANS, fontWeight: "bold", color: "#ffffff", letterSpacing: 0.5 },
    grandVal: { fontFamily: SANS, fontWeight: "bold", color: "#ffffff" },

    /* why choose us — full-width, large */
    why: { marginTop: 14, marginHorizontal: 10, backgroundColor: tint(accent, 0.08), borderLeftWidth: 4, borderLeftColor: accent, paddingVertical: 12, paddingHorizontal: 16 },
    whyCap: { fontSize: 11.5, fontFamily: SANS, fontWeight: "bold", color: accent, letterSpacing: 1.2 },
    whyRule: { width: 30, height: 2, backgroundColor: accent, marginTop: 4, marginBottom: 8 },
    whyTrusted: { fontSize: 15.5, fontFamily: SANS, fontWeight: "bold", color: "#0f172a", lineHeight: 1.25 },
    whyGrow: { fontSize: 12, fontFamily: SANS, fontWeight: "bold", color: navy, lineHeight: 1.3, marginTop: 5 },
    whyExpertise: { fontSize: 10.5, color: "#475569", lineHeight: 1.4, marginTop: 5 },

    /* page 2 — information | credentials table */
    detailsTitleRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 12, paddingHorizontal: 10 },
    detailsTitle: { fontSize: 17, fontFamily: SANS, fontWeight: "bold", color: navy, letterSpacing: 1.4 },
    detailsRule: { flex: 1, height: 1.5, backgroundColor: accent, marginLeft: 12 },
    detailsTable: { marginHorizontal: 10, borderWidth: 0.75, borderColor: "#cbd5e1", flexDirection: "row" },
    detailsCol: { width: "50%" },
    detailsColDivider: { borderLeftWidth: 0.75, borderLeftColor: "#cbd5e1" },
    detailsHead: { backgroundColor: navy, paddingVertical: 9, paddingHorizontal: 14 },
    detailsHeadText: { fontSize: 12.5, fontFamily: SANS, fontWeight: "bold", color: "#ffffff", letterSpacing: 1.6 },
    detailsCell: { paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 0.75, borderBottomColor: "#e2e8f0" },
    detailsCellLast: { borderBottomWidth: 0 },
    detailsLabel: { fontSize: 9, fontFamily: SANS, fontWeight: "bold", color: accent, letterSpacing: 0.9 },
    /* page 2 - statistics */
    statsWrap: { marginTop: 20 },
    statsTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingHorizontal: 10 },
    statsTitle: { fontSize: 9, fontFamily: SANS, fontWeight: "bold", color: "#64748b", letterSpacing: 1.6 },
    statsTitleRule: { flex: 1, height: 0.75, backgroundColor: "#cbd5e1", marginLeft: 10 },
    statsRow: { flexDirection: "row", marginHorizontal: 5 },
    statCard: { flex: 1, marginHorizontal: 5, borderWidth: 0.75, borderColor: "#e2e8f0", borderTopWidth: 2, borderTopColor: accent, backgroundColor: tint(accent, 0.04), alignItems: "center", paddingVertical: 10, paddingHorizontal: 8 },
    statIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: navy, alignItems: "center", justifyContent: "center" },
    statValue: { fontSize: 22, fontFamily: SANS, fontWeight: "bold", color: navy, marginTop: 5 },
    statSlot: { height: 9, marginTop: 3, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    statRule: { width: 18, height: 1.5, backgroundColor: accent },
    statLabel: { fontSize: 7.5, fontFamily: SANS, fontWeight: "bold", color: accent, letterSpacing: 0.9, marginTop: 4, textAlign: "center" },
    statCaption: { fontSize: 7.5, color: "#64748b", lineHeight: 1.35, marginTop: 2, textAlign: "center" },

    detailsValue: { fontSize: 11.5, fontFamily: SANS, fontWeight: "bold", color: "#0f172a", lineHeight: 1.35, marginTop: 4 },

    /* footer — three equal columns (address / email / website) for an even start-medium-end spread */
    footer: { position: "absolute", left: PAGE_PAD_X, right: PAGE_PAD_X, bottom: 19 },
    footerBar: { backgroundColor: navy, flexDirection: "row", paddingHorizontal: 18, paddingVertical: 10 },
    footerAccent: { height: 3, backgroundColor: accent },
    footerCol: { width: "33.33%", paddingRight: 10 },
    footerItem: { flexDirection: "row", alignItems: "flex-start" },
    footerRing: { width: 21, height: 21, borderRadius: 10.5, borderWidth: 0.9, borderColor: "#ffffff", alignItems: "center", justifyContent: "center", marginRight: 7, marginTop: 1, flexShrink: 0 },
    footerTextWrap: { flex: 1 },
    footerText: { fontSize: 8.5, color: "#ffffff", lineHeight: 1.35 },
  });
}

/* ================================================================== */
/* information | credentials table                                    */
/* ================================================================== */

type DetailRow = { label: string; value?: string };

/** One half of the page-2 table: a navy header cell, then label-over-value
 *  cells. Label-over-value (instead of label | value on one line) keeps long
 *  values like the account name and address readable at a large size. */
function DetailsColumn({
  title,
  rows,
  divider,
  styles: s,
}: {
  title: string;
  rows: DetailRow[];
  divider?: boolean;
  styles: ReturnType<typeof makeStyles>;
}) {
  const visible = rows.filter((r) => r.value && r.value.trim());
  return (
    <View style={divider ? [s.detailsCol, s.detailsColDivider] : s.detailsCol}>
      <View style={s.detailsHead}>
        <Text style={s.detailsHeadText}>{title}</Text>
      </View>
      {visible.map((r, i) => (
        <View
          key={r.label}
          style={i === visible.length - 1 ? [s.detailsCell, s.detailsCellLast] : s.detailsCell}
        >
          <Text style={s.detailsLabel}>{r.label}</Text>
          <SplitText style={s.detailsValue}>{r.value}</SplitText>
        </View>
      ))}
    </View>
  );
}

/** One statistic card: icon, big figure, a divider (five stars for the review
 *  card), then label and caption. All cards share this shape so they line up. */
function StatCard({
  stat,
  icon,
  stars,
  accent,
  styles: s,
}: {
  stat: Stat;
  icon: IconName;
  stars?: boolean;
  accent: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  const body = (
    <>
      <View style={s.statIcon}>
        <Icon name={icon} size={14} />
      </View>
      <Text style={s.statValue}>{stat.value}</Text>
      <View style={s.statSlot}>
        {stars ? (
          [0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ marginHorizontal: 1 }}>
              <Icon name="star" size={8} color={accent} fill={accent} weight={0.5} />
            </View>
          ))
        ) : (
          <View style={s.statRule} />
        )}
      </View>
      <Text style={s.statLabel}>{stat.label.toUpperCase()}</Text>
      <Text style={s.statCaption}>{stat.caption}</Text>
    </>
  );

  // The card's own style goes on the wrapper so the flex layout is identical
  // whether or not it is a link.
  return stat.href ? (
    <Link src={stat.href} style={[s.statCard, { textDecoration: "none" }]}>
      {body}
    </Link>
  ) : (
    <View style={s.statCard}>{body}</View>
  );
}

/* ================================================================== */
/* document                                                           */
/* ================================================================== */

export function QuoteDocument({
  quote,
  logoOk,
  headerTagline = "BUSINESS CONSULTANCY",
  whyChooseUsHeading = "WHY CHOOSE US?",
  trustedPartnerLine = "Your Business's Trusted Partner",
  growLine = "NEXT-GEN BUSINESS CONSULTANCY, Let's Grow India Together",
  expertiseLine = "Where your vision meets our expertise.",
}: {
  quote: FullQuote;
  logoOk: boolean;
  headerTagline?: string;
  whyChooseUsHeading?: string;
  trustedPartnerLine?: string;
  growLine?: string;
  expertiseLine?: string;
}) {
  const { company, customer, salesperson, items, meta, notes, quoteDiscount } = quote;
  const totals = computeTotals(items, quoteDiscount);
  const byId = new Map(totals.items.map((b) => [b.lineId, b]));

  const navy = clampHex(company.brandPrimaryColor, "#0C2A5E");
  const accent = clampHex(company.brandAccentColor, "#1E74D4");
  const s = makeStyles(navy, accent);

  const hasGstin = Boolean(company.gstin);
  const grandText = formatCurrency(totals.grandTotal);

  const informationRows: DetailRow[] = [
    { label: "COMPANY NAME", value: company.legalName || company.name },
    { label: "ADDRESS", value: company.address },
    { label: "EMAIL", value: company.email },
    { label: "WEBSITE", value: company.website },
  ];
  const credentialRows: DetailRow[] = [
    { label: "GSTIN", value: company.gstin },
    { label: "BANK NAME", value: company.bankName },
    { label: "ACCOUNT NAME", value: company.accountName },
    { label: "ACCOUNT NO.", value: company.accountNo },
    { label: "IFSC CODE", value: company.ifsc },
    { label: "SWIFT CODE", value: company.swift },
    { label: "BRANCH", value: company.branch },
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ---------- frame (repeats on every page) ---------- */}
        <View style={s.frameOuter} fixed />
        <View style={s.frameInner} fixed />
        <View style={[s.corner, { top: 7, left: 7, borderLeftWidth: 2, borderTopWidth: 2 }]} fixed />
        <View style={[s.corner, { top: 7, right: 7, borderRightWidth: 2, borderTopWidth: 2 }]} fixed />
        <View style={[s.corner, { bottom: 7, left: 7, borderLeftWidth: 2, borderBottomWidth: 2 }]} fixed />
        <View style={[s.corner, { bottom: 7, right: 7, borderRightWidth: 2, borderBottomWidth: 2 }]} fixed />

        {/* ---------- header ---------- */}
        <View style={s.header}>
          <Svg
            width={CONTENT_W}
            height={118}
            viewBox={`0 0 ${CONTENT_W} 118`}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <Path d={`M239 0 L${CONTENT_W} 0 L${CONTENT_W} 101 L215 115 Z`} fill={accent} />
            <Path d={`M246 0 L${CONTENT_W} 0 L${CONTENT_W} 92 L222 106 Z`} fill="#ffffff" />
            <Path d={`M253 0 L${CONTENT_W} 0 L${CONTENT_W} 82 L229 96 Z`} fill={navy} />
          </Svg>

          <View style={s.headerRow}>
            <View style={s.brandBox}>
              {logoOk ? (
                /* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an <img> */
                <Image src={company.logo} style={s.logo} />
              ) : (
                <View>
                  <Text style={[s.brandName, { fontSize: fitSize(company.name, 15, 20, 9) }]}>
                    {company.name}
                  </Text>
                  {company.website ? (
                    <SplitText style={s.brandSite}>{company.website}</SplitText>
                  ) : null}
                </View>
              )}
            </View>

            <View style={s.plate}>
              <Text style={s.plateTitle}>QUOTATION</Text>
              <View style={s.plateSubRow}>
                <View style={s.plateRule} />
                <Text style={s.plateSub}>{headerTagline}</Text>
                <View style={s.plateRule} />
              </View>
            </View>
          </View>
        </View>

        {/* ---------- meta strip ---------- */}
        <View style={s.meta}>
          {/* quotation for */}
          <View style={s.metaColL}>
            <View style={s.capRow}>
              <View style={s.circle}>
                <Icon name="user" size={12} />
              </View>
              <Text style={s.cap}>QUOTATION FOR</Text>
            </View>
            {customer.clientName ? (
              <Text style={[s.partyName, { fontSize: fitSize(customer.clientName, 14, 18, 8.5) }]}>
                {customer.clientName}
              </Text>
            ) : null}
            <Text
              style={
                customer.clientName
                  ? s.partyLine
                  : [s.partyName, { fontSize: fitSize(customer.name, 14, 18, 8.5) }]
              }
            >
              {customer.name || "-"}
            </Text>
            {customer.companyName ? (
              <Text style={s.partyLine}>{customer.companyName}</Text>
            ) : null}
            {customer.phone ? (
              <View style={s.contactRow}>
                <Icon name="phone" size={10} color={accent} />
                <Text style={s.contactText}>{customer.phone}</Text>
              </View>
            ) : null}
            {customer.email ? (
              <View style={s.contactRow}>
                <Icon name="mail" size={10} color={accent} />
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <SplitText style={{ fontSize: 8.5, color: "#334155" }}>
                    {customer.email}
                  </SplitText>
                </View>
              </View>
            ) : null}
            {customer.address ? (
              <Text style={[s.partyLine, { color: "#64748b" }]}>{customer.address}</Text>
            ) : null}
          </View>

          {/* quote meta */}
          <View style={s.metaColC}>
            <View style={s.metaRow}>
              <View style={s.metaIcon}>
                <Icon name="clipboard" size={10} color={accent} />
              </View>
              <Text style={s.metaKey}>Quote #</Text>
              <View style={{ flex: 1, marginTop: 2 }}>
                <SplitText style={{ fontSize: 8.5, color: "#475569" }}>
                  {meta.quoteNumber}
                </SplitText>
              </View>
            </View>
            <View style={s.metaRow}>
              <View style={s.metaIcon}>
                <Icon name="calendar" size={10} color={accent} />
              </View>
              <Text style={s.metaKey}>Date</Text>
              <Text style={s.metaVal}>{meta.issueDate}</Text>
            </View>
            <View style={[s.metaRow, ...(hasGstin ? [] : [s.metaRowLast])]}>
              <View style={s.metaIcon}>
                <Icon name="hourglass" size={10} color={accent} />
              </View>
              <Text style={s.metaKey}>Valid Until</Text>
              <Text style={s.metaVal}>{meta.expiryDate}</Text>
            </View>
            {hasGstin ? (
              <View style={[s.metaRow, s.metaRowLast]}>
                <View style={s.metaIcon}>
                  <Icon name="file" size={10} color={accent} />
                </View>
                <Text style={s.metaKey}>GSTIN</Text>
                <View style={{ flex: 1, marginTop: 2 }}>
                  <SplitText style={{ fontSize: 8.5, color: "#475569" }}>
                    {company.gstin}
                  </SplitText>
                </View>
              </View>
            ) : null}
          </View>

          {/* prepared by */}
          <View style={s.metaColR}>
            <View style={s.capRow}>
              <View style={s.circle}>
                <Icon name="user" size={12} />
              </View>
              <Text style={s.cap}>PREPARED BY</Text>
            </View>
            <Text style={[s.partyName, { fontSize: fitSize(salesperson.name, 13, 18, 8.5) }]}>
              {salesperson.name || "-"}
            </Text>
            {salesperson.phone ? (
              <View style={s.contactRow}>
                <Icon name="phone" size={10} color={accent} />
                <Text style={s.contactText}>{salesperson.phone}</Text>
              </View>
            ) : null}
            {salesperson.email ? (
              <View style={s.contactRow}>
                <Icon name="mail" size={10} color={accent} />
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <SplitText style={{ fontSize: 8.5, color: "#334155" }}>
                    {salesperson.email}
                  </SplitText>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* ---------- items ---------- */}
        <View style={{ marginTop: 12 }}>
          <View style={s.tHead} fixed>
            <Text style={[s.tHeadCell, s.colSvc, { paddingLeft: 10 }]}>SERVICE</Text>
            <Text style={[s.tHeadCell, s.colPrice, { textAlign: "center" }]}>PRICE</Text>
            <Text style={[s.tHeadCell, s.colTotal, { textAlign: "center" }]}>TOTAL</Text>
            <Text style={[s.tHeadCell, s.colRemarks, { paddingLeft: 8 }]}>REMARKS</Text>
          </View>

          {items.map((item) => {
            const line = byId.get(item.lineId);
            const totalText = formatCurrency(line?.total ?? 0);
            return (
              <View key={item.lineId} style={s.tRow} wrap={false}>
                <View style={[s.colSvc, s.svcCell]}>
                  <View style={s.svcIcon}>
                    <Icon name={serviceIcon(item.name)} size={14} color={navy} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.svcName, { fontSize: fitSize(item.name, 10, 34, 8) }]}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text style={s.svcDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={[s.colPrice, s.numCell]}>
                  <Text style={[s.numText, { fontSize: fitSize(formatCurrency(item.unitPrice), 9, 10, 6.5) }]}>
                    {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <View style={[s.colTotal, s.numCell]}>
                  <Text style={[s.lineTotal, { fontSize: fitSize(totalText, 10, 11, 7) }]}>
                    {totalText}
                  </Text>
                </View>
                <View style={[s.colRemarks, s.remarksCell]}>
                  <SplitText style={s.remarksText}>{item.remarks}</SplitText>
                </View>
              </View>
            );
          })}
        </View>

        {/* ---------- notes + totals ---------- */}
        <View style={s.totalsWrap} wrap={false}>
          <View style={s.notesBox}>
            {notes ? (
              <>
                <Text style={s.notesCap}>NOTES</Text>
                <Text style={s.notesText}>{notes}</Text>
              </>
            ) : null}
          </View>

          <View style={s.totalsCol}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsVal}>{formatCurrency(totals.subtotal)}</Text>
            </View>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Total Discount</Text>
              {totals.totalDiscount > 0 ? (
                <Text style={s.totalsNeg}>- {formatCurrency(totals.totalDiscount)}</Text>
              ) : (
                <Text style={s.totalsVal}>{formatCurrency(0)}</Text>
              )}
            </View>

            <View style={s.grandWrap}>
              <Svg
                width={CONTENT_W * 0.55}
                height={40}
                viewBox={`0 0 ${CONTENT_W * 0.55} 40`}
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <Rect x="0" y="0" width={CONTENT_W * 0.55} height="40" fill={navy} />
                <Path
                  d={`M148 0 L${CONTENT_W * 0.55} 0 L${CONTENT_W * 0.55} 40 L133 40 Z`}
                  fill={accent}
                />
                <Path d="M146 0 L153 0 L136 40 L129 40 Z" fill="#ffffff" />
              </Svg>
              <View style={s.grandInner}>
                <Text style={s.grandLabel}>GRAND TOTAL</Text>
                <Text style={[s.grandVal, { fontSize: fitSize(grandText, 16, 11, 9) }]}>
                  {grandText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ---------- why choose us ---------- */}
        <View style={s.why} wrap={false}>
          <Text style={s.whyCap}>{whyChooseUsHeading}</Text>
          <View style={s.whyRule} />
          <Text style={s.whyTrusted}>{trustedPartnerLine}</Text>
          <Text style={s.whyGrow}>{growLine}</Text>
          <Text style={s.whyExpertise}>{expertiseLine}</Text>
        </View>

        {/* ---------- page 2: information | credentials ---------- */}
        <View break>
          <View style={s.detailsTitleRow}>
            <Text style={s.detailsTitle}>COMPANY DETAILS</Text>
            <View style={s.detailsRule} />
          </View>

          <View style={s.detailsTable} wrap={false}>
            <DetailsColumn title="INFORMATION" rows={informationRows} styles={s} />
            <DetailsColumn title="CREDENTIALS" rows={credentialRows} styles={s} divider />
          </View>

          {company.stats ? (
            <View style={s.statsWrap} wrap={false}>
              <View style={s.statsTitleRow}>
                <Text style={s.statsTitle}>OUR TRACK RECORD</Text>
                <View style={s.statsTitleRule} />
              </View>
              <View style={s.statsRow}>
                <StatCard stat={company.stats.employees} icon="users" accent={accent} styles={s} />
                <StatCard stat={company.stats.googleReviews} icon="star" stars accent={accent} styles={s} />
                <StatCard stat={company.stats.award} icon="award" accent={accent} styles={s} />
              </View>
            </View>
          ) : null}
        </View>

        {/* ---------- footer (pinned, repeats on every page) ---------- */}
        <View style={s.footer} fixed>
          <View style={s.footerBar}>
            <View style={s.footerCol}>
              {company.address ? (
                <View style={s.footerItem}>
                  <View style={s.footerRing}>
                    <Icon name="pin" size={11} />
                  </View>
                  <View style={s.footerTextWrap}>
                    <Text style={s.footerText}>{company.address}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={s.footerCol}>
              {company.email ? (
                <View style={s.footerItem}>
                  <View style={s.footerRing}>
                    <Icon name="mail" size={11} />
                  </View>
                  <View style={s.footerTextWrap}>
                    <SplitText style={s.footerText}>{company.email}</SplitText>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={[s.footerCol, { paddingRight: 0 }]}>
              {company.website ? (
                <View style={s.footerItem}>
                  <View style={s.footerRing}>
                    <Icon name="globe" size={11} />
                  </View>
                  <View style={s.footerTextWrap}>
                    <SplitText style={s.footerText}>{company.website}</SplitText>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
          <View style={s.footerAccent} />
        </View>
      </Page>
    </Document>
  );
}