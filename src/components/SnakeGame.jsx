import { useEffect, useRef, useState } from "react";

const GRID = 12;
const SPEED_MS = 160;

function randomCell(exclude) {
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (exclude.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

export default function SnakeGame({ onBack }) {
  const [snake, setSnake] = useState([{ x: 6, y: 6 }]);
  const [food, setFood] = useState(() => randomCell([{ x: 6, y: 6 }]));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef(snake);
  snakeRef.current = snake;

  useEffect(() => {
    function handleKeyDown(e) {
      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };
      const next = map[e.key];
      if (!next) return;
      e.preventDefault();

      const current = directionRef.current;
      // Prevent instantly reversing into yourself
      if (next.x === -current.x && next.y === -current.y) return;
      directionRef.current = next;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const dir = directionRef.current;
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };

        const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
        const hitSelf = prev.some((s) => s.x === head.x && s.y === head.y);

        if (hitWall || hitSelf) {
          setGameOver(true);
          return prev;
        }

        const ateFood = head.x === food.x && head.y === food.y;
        const nextSnake = [head, ...prev];

        if (ateFood) {
          setScore((s) => s + 1);
          setFood(randomCell(nextSnake));
        } else {
          nextSnake.pop();
        }

        return nextSnake;
      });
    }, SPEED_MS);

    return () => clearInterval(interval);
  }, [food, gameOver]);

  function reset() {
    setSnake([{ x: 6, y: 6 }]);
    setFood(randomCell([{ x: 6, y: 6 }]));
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
  }

  return (
    <div className="scale-in w-full max-w-sm backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition">
          ‹ Back
        </button>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>

      <p className="text-gray-600 text-xs text-center mb-3">Use arrow keys to play</p>

      <div
        className="grid gap-[2px] bg-white/[0.02] p-1 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, aspectRatio: "1 / 1" }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`rounded-sm ${
                isFood
                  ? "bg-red-400"
                  : isHead
                  ? "bg-emerald-300"
                  : isSnake
                  ? "bg-emerald-500"
                  : "bg-white/[0.03]"
              }`}
            />
          );
        })}
      </div>

      {gameOver && (
        <div className="text-center mt-4">
          <p className="text-white text-sm mb-3">Game over — score {score}</p>
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