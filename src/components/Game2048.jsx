import { useEffect, useRef, useState } from "react";

const SIZE = 4;

const TILE_STYLES = {
  2: "bg-white/[0.08] text-gray-200",
  4: "bg-white/[0.12] text-gray-100",
  8: "bg-orange-500/70 text-white",
  16: "bg-orange-500 text-white",
  32: "bg-red-500/80 text-white",
  64: "bg-red-500 text-white",
  128: "bg-yellow-400/80 text-white",
  256: "bg-yellow-400 text-white",
  512: "bg-yellow-300 text-white",
  1024: "bg-indigo-400 text-white",
  2048: "bg-indigo-500 text-white"
};

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function getEmptyCells(board) {
  const cells = [];
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) cells.push([r, c]);
    })
  );
  return cells;
}

function spawnTile(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideRow(row) {
  const filtered = row.filter((v) => v !== 0);
  const merged = [];
  let scoreGain = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      scoreGain += filtered[i] * 2;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, scoreGain };
}

function transpose(board) {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

function move(board, direction) {
  let working = board.map((row) => [...row]);
  let totalGain = 0;

  if (direction === "up" || direction === "down") working = transpose(working);
  if (direction === "right" || direction === "down")
    working = working.map((row) => [...row].reverse());

  const results = working.map((row) => slideRow(row));
  working = results.map((r) => r.row);
  totalGain = results.reduce((sum, r) => sum + r.scoreGain, 0);

  if (direction === "right" || direction === "down")
    working = working.map((row) => [...row].reverse());
  if (direction === "up" || direction === "down") working = transpose(working);

  const changed = JSON.stringify(working) !== JSON.stringify(board);
  return { board: working, changed, scoreGain: totalGain };
}

export default function Game2048({ onBack }) {
  const [board, setBoard] = useState(() => spawnTile(spawnTile(emptyBoard())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    function handleKeyDown(e) {
      const map = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
      };
      const direction = map[e.key];
      if (!direction || gameOver) return;
      e.preventDefault();

      const result = move(boardRef.current, direction);
      if (result.changed) {
        const withNewTile = spawnTile(result.board);
        setBoard(withNewTile);
        setScore((s) => s + result.scoreGain);

        const noMovesLeft = ["up", "down", "left", "right"].every(
          (dir) => !move(withNewTile, dir).changed
        );
        if (noMovesLeft) setGameOver(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  function reset() {
    setBoard(spawnTile(spawnTile(emptyBoard())));
    setScore(0);
    setGameOver(false);
  }

  return (
    <div className="scale-in w-full max-w-sm backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition">
          ‹ Back
        </button>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>

      <p className="text-gray-600 text-xs text-center mb-3">Use arrow keys to play</p>

      <div className="grid grid-cols-4 gap-2 bg-white/[0.02] p-2 rounded-2xl">
        {board.flat().map((value, i) => (
          <div
            key={i}
            className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
              value === 0 ? "bg-white/[0.02]" : TILE_STYLES[value] || "bg-indigo-600 text-white"
            }`}
          >
            {value !== 0 && value}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="text-center mt-4">
          <p className="text-white text-sm mb-3">No more moves — game over</p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}