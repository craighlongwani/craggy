// A night sky of square pixel stars, some of them twinkling. Positions come
// from a seeded generator so the server and client render the same sky.

type Star = {
  left: number;
  top: number;
  size: number;
  twinkle: boolean;
  delay: number;
  duration: number;
};

// mulberry32: tiny deterministic PRNG
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(95);

const stars: Star[] = Array.from({ length: 140 }, () => {
  const roll = random();
  return {
    left: random() * 100,
    top: random() * 100,
    // Mostly 2px specks, a few 3px, rare 4px
    size: roll < 0.75 ? 2 : roll < 0.95 ? 3 : 4,
    twinkle: random() < 0.35,
    delay: random() * 4,
    duration: 2 + random() * 3,
  };
});

// Four-point sparkles drawn as pixel crosses
const sparkles = [
  { left: 12, top: 18 },
  { left: 71, top: 9 },
  { left: 88, top: 62 },
  { left: 34, top: 78 },
  { left: 56, top: 41 },
];

export default function Starfield() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #02021a 0%, #0a0a3a 55%, #24124a 100%)",
      }}
    >
      {stars.map((star, i) => (
        <span
          key={i}
          className={`absolute bg-white ${star.twinkle ? "star-twinkle" : ""}`}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.twinkle ? undefined : 0.5 + (star.size - 2) * 0.2,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {sparkles.map((sparkle, i) => (
        <span
          key={i}
          className="star-sparkle star-twinkle absolute"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${i * 0.9}s`,
            animationDuration: "3.5s",
          }}
        />
      ))}
    </div>
  );
}
