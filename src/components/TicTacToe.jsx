import { useEffect, useState } from "react";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function getWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

function computerMove(board) {
  const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);

  // Try to win
  for (const i of empty) {
    const copy = [...board];
    copy[i] = "O";
    if (getWinner(copy) === "O") return i;
  }
  // Block player win
  for (const i of empty) {
    const copy = [...board];
    copy[i] = "X";
    if (getWinner(copy) === "X") return i;
  }
  // Otherwise random - keeps it from ever feeling scripted
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToe({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    setWinner(getWinner(board));
  }, [board]);

  function handleClick(i) {
    if (board[i] || winner) return;

    const next = [...board];
    next[i] = "X";
    setBoard(next);

    const result = getWinner(next);
    if (result) return;

    setTimeout(() => {
      const move = computerMove(next);
      if (move === undefined) return;
      const withComputer = [...next];
      withComputer[move] = "O";
      setBoard(withComputer);
    }, 400);
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setWinner(null);
  }

  return (
    <div className="scale-in w-full max-w-sm backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition">
          ‹ Back
        </button>
        <span className="text-xs text-gray-500">You: X · Computer: O</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="aspect-square rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-2xl font-semibold text-white transition"
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="text-center mt-4">
          <p className="text-white text-sm mb-3">
            {winner === "draw" ? "It's a draw" : winner === "X" ? "You win! 🎉" : "Computer wins"}
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}