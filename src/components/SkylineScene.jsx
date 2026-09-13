const STARS = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 55}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() < 0.7 ? 1 : 2,
  delay: `${Math.random() * 3}s`
}));

const BUILDINGS = [
  { w: 5, h: 30 }, { w: 4, h: 45 }, { w: 6, h: 25 }, { w: 4, h: 55 },
  { w: 5, h: 35 }, { w: 4, h: 60 }, { w: 5, h: 40 }, { w: 6, h: 28 },
  { w: 4, h: 50 }, { w: 5, h: 33 }, { w: 4, h: 65 }, { w: 5, h: 30 },
  { w: 6, h: 42 }, { w: 4, h: 38 }, { w: 5, h: 48 }, { w: 4, h: 32 },
  { w: 6, h: 55 }, { w: 5, h: 27 }, { w: 4, h: 44 }, { w: 5, h: 36 }
];

const PRESET_STYLES = {
  skyline: "linear-gradient(180deg, #0a0a18, #151530, #1e1a3a)",
  aurora: "radial-gradient(circle at 30% 30%, #6366f1, #05050a 70%)",
  sunset: "linear-gradient(180deg, #2d1b4e, #c2410c, #1a0f2e)",
  ocean: "linear-gradient(180deg, #0c2d48, #145374, #05050a)"
};

export default function SkylineScene({ background }) {
  const isCustomImage = background?.type === "image";
  const isPreset = background?.type === "preset" && background.value !== "skyline";
  const isDefaultScene = !isCustomImage && !isPreset;

  // Custom backgrounds get their own flat style and nothing else -
  // no moon, no stars, no skyline. Those only belong to the default scene.
  if (!isDefaultScene) {
    const customStyle = isCustomImage
      ? { backgroundImage: `url(${background.value})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: PRESET_STYLES[background.value] };

    return <div className="fixed inset-0 overflow-hidden z-0" style={customStyle} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-b from-[#0a0a18] via-[#151530] to-[#1e1a3a]">
      {STARS.map((s) => (
        <div
          key={s.id}
          className="star absolute rounded-full bg-white"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}

      <div
        className="cloud-drift-slow absolute top-[15%] w-40 h-8 bg-white/[0.04] rounded-full blur-md"
        style={{ left: "-15%" }}
      />
      <div
        className="cloud-drift-fast absolute top-[28%] w-56 h-10 bg-white/[0.03] rounded-full blur-md"
        style={{ left: "-20%" }}
      />
      <div
        className="cloud-drift-slow absolute top-[10%] w-32 h-6 bg-white/[0.035] rounded-full blur-md"
        style={{ left: "-10%", animationDelay: "-30s" }}
      />

      <div className="moon-glow absolute top-[10%] left-[10%] w-14 h-14 rounded-full bg-gray-200">
        <div className="absolute top-0 left-[7px] w-14 h-14 rounded-full bg-[#0a0a18]" />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 70% 100%, rgba(99,102,241,0.3), transparent 60%), radial-gradient(ellipse at 30% 100%, rgba(34,211,238,0.18), transparent 60%)"
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] px-2">
        {BUILDINGS.map((b, i) => (
          <div key={i} className="bg-[#0a0a18]" style={{ width: `${b.w}%`, height: `${b.h}%` }} />
        ))}
      </div>
    </div>
  );
}