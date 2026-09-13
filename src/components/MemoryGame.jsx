import { useEffect, useState } from "react";

const SYMBOLS = ["🌙", "⭐", "🔥", "💎", "🌊", "🍀", "⚡", "🎈"];

function buildShuffledDeck() {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((symbol, i) => ({ id: i, symbol, matched: false }));
}

export default function MemoryGame({ onBack }) {
  const [cards, setCards] = useState(buildShuffledDeck);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [a, b] = flipped;
    setMoves((m) => m + 1);

    if (cards[a].symbol === cards[b].symbol) {
      const timer = setTimeout(() => {
        setCards((prev) =>
          prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        );
        setFlipped([]);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setFlipped([]), 800);
      return () => clearTimeout(timer);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.every((c) => c.matched)) setWon(true);
  }, [cards]);

  function handleFlip(index) {
    if (flipped.length === 2) return;
    if (flipped.includes(index) || cards[index].matched) return;
    setFlipped((f) => [...f, index]);
  }

  function resetGame() {
    setCards(buildShuffledDeck());
    setFlipped([]);
    setMoves(0);
    setWon(false);
  }

  return (
    <div className="scale-in w-full max-w-sm backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition">
          ‹ Back
        </button>
        <span className="text-xs text-gray-500">Moves: {moves}</span>
      </div>

      {won ? (
        <div className="text-center py-10">
          <p className="text-white text-lg mb-1">You won! 🎉</p>
          <p className="text-gray-500 text-sm mb-5">{moves} moves</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
          >
            Play again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, i) => {
            const isFaceUp = flipped.includes(i) || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(i)}
                className={`mg-flip aspect-square ${isFaceUp ? "is-flipped" : ""}`}
              >
                <div className="mg-flip-inner">
                  <div className="mg-face bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/10" />
                  <div className="mg-face mg-face-back bg-white/[0.06] border border-indigo-400/30 text-xl">
                    {card.symbol}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}