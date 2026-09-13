const GAMES = [
  { id: "memory", label: "Memory", icon: "🃏", gradient: "from-indigo-500 to-purple-600" },
  { id: "2048", label: "2048", icon: "🔢", gradient: "from-amber-500 to-orange-600" },
  { id: "tictactoe", label: "Tic-Tac-Toe", icon: "✕⭕", gradient: "from-cyan-500 to-blue-600" },
  { id: "snake", label: "Snake", icon: "🐍", gradient: "from-emerald-500 to-teal-600" }
];

export default function GameLauncher({ onSelect }) {
  return (
    <div className="scale-in w-full max-w-sm backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <h1 className="text-lg font-semibold text-white tracking-tight mb-1 text-center">
        Game Library
      </h1>
      <p className="text-gray-500 text-xs text-center mb-6">
        Pick something to play
      </p>

      <div className="grid grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-shadow`}
            >
              {game.icon}
            </div>
            <span className="text-xs text-gray-300 font-medium">{game.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}