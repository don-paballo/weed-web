import { loadFont as loadBree } from "@remotion/google-fonts/BreeSerif";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: bree } = loadBree();

// ─── Helpers ────────────────────────────────────────────────────────────────

function fadeInOut(
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
) {
  if (frame <= inStart) return 0;
  if (frame < inEnd)
    return interpolate(frame, [inStart, inEnd], [0, 1], {
      easing: Easing.out(Easing.cubic),
    });
  if (frame <= outStart) return 1;
  if (frame < outEnd)
    return interpolate(frame, [outStart, outEnd], [1, 0], {
      easing: Easing.in(Easing.cubic),
    });
  return 0;
}

function easeIn(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── Animated Grid Background ───────────────────────────────────────────────

const GridBg: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.4) % 60;

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #020209 0%, #060618 50%, #020209 100%)",
      }}
    >
      {/* perspective grid */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity }}
      >
        <defs>
          <pattern
            id="grid"
            x={shift}
            y={shift}
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#00c8ff"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, #020209 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Horizontal scan line ────────────────────────────────────────────────────

const ScanLine: React.FC<{ yFraction: number; opacity: number }> = ({
  yFraction,
  opacity,
}) => {
  const { height, width } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: yFraction * height,
        left: 0,
        width,
        height: 2,
        background: "linear-gradient(90deg, transparent, #00c8ff, transparent)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Staggered letter animation ──────────────────────────────────────────────

const KineticWord: React.FC<{
  text: string;
  fontSize: number;
  color?: string;
  letterDelay?: number; // frames between each letter
  style?: React.CSSProperties;
}> = ({ text, fontSize, color = "#ffffff", letterDelay = 1.5, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", ...style }}>
      {text.split("").map((char, i) => {
        const delay = i * letterDelay;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 180, mass: 0.6 },
          durationInFrames: 18,
        });
        return (
          <span
            key={i}
            style={{
              fontSize,
              fontFamily: bree,
              color,
              fontWeight: 900,
              textTransform: "uppercase",
              display: "inline-block",
              letterSpacing: "0.04em",
              opacity: interpolate(s, [0, 0.3, 1], [0, 1, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
            }}
          >
            {char === " " ? " " : char}
          </span>
        );
      })}
    </div>
  );
};

// ─── Slide-in line ───────────────────────────────────────────────────────────

const SlideIn: React.FC<{
  text: string;
  fontSize: number;
  color?: string;
  from?: "left" | "right" | "bottom";
  delay?: number;
  style?: React.CSSProperties;
}> = ({ text, fontSize, color = "#fff", from = "bottom", delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.8 },
    durationInFrames: 22,
  });

  const tx =
    from === "left"
      ? interpolate(s, [0, 1], [-300, 0])
      : from === "right"
        ? interpolate(s, [0, 1], [300, 0])
        : 0;
  const ty = from === "bottom" ? interpolate(s, [0, 1], [80, 0]) : 0;

  return (
    <div
      style={{
        fontFamily: bree,
        fontSize,
        color,
        textTransform: "uppercase",
        fontWeight: 700,
        letterSpacing: "0.06em",
        opacity: interpolate(s, [0, 0.2, 1], [0, 1, 1]),
        transform: `translate(${tx}px, ${ty}px)`,
        textAlign: "center",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ─── Glitch flash text ───────────────────────────────────────────────────────

const GlitchText: React.FC<{
  text: string;
  fontSize: number;
  color?: string;
}> = ({ text, fontSize, color = "#00c8ff" }) => {
  const frame = useCurrentFrame();

  const glitch = Math.sin(frame * 2.3) > 0.85 ? (Math.random() - 0.5) * 6 : 0;
  const glitch2 = Math.sin(frame * 3.7) > 0.9 ? (Math.random() - 0.5) * 4 : 0;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* shadow layer 1 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          fontFamily: bree,
          fontSize,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#ff003c",
          opacity: 0.6,
          transform: `translate(${glitch}px, 0)`,
          clipPath: "inset(20% 0 60% 0)",
        }}
      >
        {text}
      </div>
      {/* shadow layer 2 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          fontFamily: bree,
          fontSize,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#00ffea",
          opacity: 0.6,
          transform: `translate(${glitch2}px, 0)`,
          clipPath: "inset(60% 0 10% 0)",
        }}
      >
        {text}
      </div>
      {/* main text */}
      <div
        style={{
          fontFamily: bree,
          fontSize,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Accent bar ──────────────────────────────────────────────────────────────

const AccentBar: React.FC<{ width: number; delay?: number }> = ({
  width,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const prog = easeIn(frame, delay, delay + 20);
  return (
    <div
      style={{
        width: width * prog,
        height: 4,
        background: "linear-gradient(90deg, #00c8ff, #7c3aed)",
        borderRadius: 2,
        marginTop: 16,
        opacity: prog > 0 ? 1 : 0,
      }}
    />
  );
};

// ─── Tag line with dot separator ─────────────────────────────────────────────

const TagRow: React.FC<{
  items: string[];
  fontSize: number;
  delay?: number;
}> = ({ items, fontSize, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {items.map((item, i) => {
        const s = spring({
          frame: frame - delay - i * 6,
          fps,
          config: { damping: 16, stiffness: 160, mass: 0.7 },
          durationInFrames: 20,
        });
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00c8ff",
                  opacity: s,
                }}
              />
            )}
            <div
              style={{
                fontFamily: bree,
                fontSize,
                color: "#00c8ff",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 700,
                opacity: interpolate(s, [0, 0.3, 1], [0, 1, 1]),
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
              }}
            >
              {item}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Scene wrappers ──────────────────────────────────────────────────────────

/** Centred flex column */
const Scene: React.FC<{
  children: React.ReactNode;
  from: number;
  durationInFrames: number;
}> = ({ children, from, durationInFrames }) => (
  <Sequence from={from} durationInFrames={durationInFrames}>
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        gap: 20,
      }}
    >
      {children}
    </AbsoluteFill>
  </Sequence>
);

// ─── Flash overlay ───────────────────────────────────────────────────────────

const Flash: React.FC<{ at: number; color?: string }> = ({
  at,
  color = "#fff",
}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 4, at + 12], [0, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ background: color, opacity: op, pointerEvents: "none" }}
    />
  );
};

// ─── Main composition ────────────────────────────────────────────────────────

export const ProxyLabsAd: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene timing (frames @ 30fps)
  // S1:  0–75   PROXYLABS logo explosion
  // S2: 60–135  "The Future of Connectivity"
  // S3: 120–195 "Blazing Fast" impact
  // S4: 180–255 "Military-Grade Security"
  // S5: 240–330 Proxy types tag row
  // S6: 315–405 "Any location. Zero friction."
  // S7: 390–465 "South Africa's Premier Proxy Provider"
  // S8: 450–540 Final reveal
  // Total: 540 frames = 18s

  const gridOpacity = fadeInOut(frame, 0, 30, 510, 540);
  const scanY = interpolate(frame, [0, 540], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020209", overflow: "hidden" }}>
      {/* Always-on background */}
      <AbsoluteFill style={{ opacity: gridOpacity }}>
        <GridBg opacity={0.09} />
      </AbsoluteFill>

      {/* Slow scan line */}
      <ScanLine yFraction={scanY} opacity={0.4 * gridOpacity} />

      {/* ── SCENE 1: Logo explosion ──────────────────────────────── */}
      <Scene from={0} durationInFrames={80}>
        {(() => {
          const op = fadeInOut(frame, 0, 12, 62, 80);
          return (
            <div style={{ opacity: op, textAlign: "center" }}>
              <GlitchText text="PROXYLABS" fontSize={148} />
              <AccentBar width={680} delay={18} />
            </div>
          );
        })()}
      </Scene>

      {/* Flash on scene cut */}
      <Flash at={60} color="#00c8ff" />

      {/* ── SCENE 2: Tagline ─────────────────────────────────────── */}
      <Scene from={65} durationInFrames={70}>
        {(() => {
          const op = fadeInOut(frame - 65, 0, 10, 52, 70);
          return (
            <div style={{ opacity: op, textAlign: "center" }}>
              <SlideIn
                text="The Future of"
                fontSize={68}
                color="#888888"
                from="bottom"
              />
              <KineticWord
                text="Connectivity"
                fontSize={108}
                color="#ffffff"
                letterDelay={1.8}
                style={{ marginTop: 4 }}
              />
              <AccentBar width={500} delay={24} />
            </div>
          );
        })()}
      </Scene>

      <Flash at={125} />

      {/* ── SCENE 3: BLAZING FAST ────────────────────────────────── */}
      <Scene from={130} durationInFrames={65}>
        {(() => {
          const localFrame = frame - 130;
          const op = fadeInOut(localFrame, 0, 8, 48, 65);
          const pulse = 1 + 0.018 * Math.sin(localFrame * 0.4);
          return (
            <div
              style={{
                opacity: op,
                textAlign: "center",
                transform: `scale(${pulse})`,
              }}
            >
              <div
                style={{
                  fontFamily: bree,
                  fontSize: 52,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                ↯ Performance
              </div>
              <KineticWord
                text="BLAZING"
                fontSize={156}
                color="#00c8ff"
                letterDelay={1.2}
              />
              <KineticWord
                text="FAST"
                fontSize={156}
                color="#ffffff"
                letterDelay={1.2}
                style={{ marginTop: -20 }}
              />
            </div>
          );
        })()}
      </Scene>

      <Flash at={190} />

      {/* ── SCENE 4: MILITARY-GRADE SECURITY ─────────────────────── */}
      <Scene from={195} durationInFrames={65}>
        {(() => {
          const localFrame = frame - 195;
          const op = fadeInOut(localFrame, 0, 8, 48, 65);
          return (
            <div style={{ opacity: op, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: bree,
                  fontSize: 52,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                ⬡ Security
              </div>
              <KineticWord
                text="MILITARY"
                fontSize={128}
                color="#ffffff"
                letterDelay={1.2}
              />
              <KineticWord
                text="-GRADE"
                fontSize={128}
                color="#7c3aed"
                letterDelay={1.2}
                style={{ marginTop: -16 }}
              />
              <AccentBar width={560} delay={20} />
            </div>
          );
        })()}
      </Scene>

      <Flash at={255} />

      {/* ── SCENE 5: Proxy types ─────────────────────────────────── */}
      <Scene from={260} durationInFrames={70}>
        {(() => {
          const localFrame = frame - 260;
          const op = fadeInOut(localFrame, 0, 10, 52, 70);
          return (
            <div style={{ opacity: op, textAlign: "center", gap: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <SlideIn
                text="Undetectable Proxies"
                fontSize={62}
                color="#888"
                from="bottom"
              />
              <TagRow
                items={["Residential", "Datacenter", "Mobile"]}
                fontSize={52}
                delay={12}
              />
              <AccentBar width={640} delay={30} />
            </div>
          );
        })()}
      </Scene>

      <Flash at={325} />

      {/* ── SCENE 6: Any location. Zero friction. ────────────────── */}
      <Scene from={330} durationInFrames={75}>
        {(() => {
          const localFrame = frame - 330;
          const op = fadeInOut(localFrame, 0, 10, 56, 75);
          return (
            <div style={{ opacity: op, textAlign: "center" }}>
              <SlideIn
                text="Any Location."
                fontSize={108}
                color="#ffffff"
                from="left"
              />
              <SlideIn
                text="Zero Friction."
                fontSize={108}
                color="#00c8ff"
                from="right"
                delay={8}
              />
            </div>
          );
        })()}
      </Scene>

      <Flash at={400} />

      {/* ── SCENE 7: South Africa's premier ──────────────────────── */}
      <Scene from={405} durationInFrames={65}>
        {(() => {
          const localFrame = frame - 405;
          const op = fadeInOut(localFrame, 0, 10, 48, 65);
          return (
            <div style={{ opacity: op, textAlign: "center" }}>
              <SlideIn
                text="South Africa's"
                fontSize={58}
                color="#888"
                from="bottom"
              />
              <KineticWord
                text="PREMIER"
                fontSize={132}
                color="#ffffff"
                letterDelay={1.5}
              />
              <SlideIn
                text="Proxy Provider"
                fontSize={58}
                color="#00c8ff"
                from="bottom"
                delay={14}
              />
            </div>
          );
        })()}
      </Scene>

      <Flash at={465} color="#7c3aed" />

      {/* ── SCENE 8: Final reveal ─────────────────────────────────── */}
      <Scene from={470} durationInFrames={70}>
        {(() => {
          const localFrame = frame - 470;
          const op = fadeInOut(localFrame, 0, 15, 52, 70);
          const pulse = 1 + 0.012 * Math.sin(localFrame * 0.35);
          return (
            <div
              style={{
                opacity: op,
                textAlign: "center",
                transform: `scale(${pulse})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <GlitchText text="PROXYLABS" fontSize={152} color="#fff" />
              <div
                style={{
                  fontFamily: bree,
                  fontSize: 48,
                  color: "#00c8ff",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  opacity: interpolate(localFrame, [20, 35], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                proxylabs.co.za
              </div>
              <AccentBar width={640} delay={25} />
              <div
                style={{
                  fontFamily: bree,
                  fontSize: 34,
                  color: "#555",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginTop: 8,
                  opacity: interpolate(localFrame, [30, 45], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                Fast. Secure. Unstoppable.
              </div>
            </div>
          );
        })()}
      </Scene>

      {/* Final fade to black */}
      <AbsoluteFill
        style={{
          background: "#020209",
          opacity: interpolate(frame, [510, 540], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
