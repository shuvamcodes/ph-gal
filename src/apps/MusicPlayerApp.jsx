import { useRef, useState } from "react";

export default function MusicPlayerApp() {
  const [tracks, setTracks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("audio/"));
    const newTracks = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setTracks((prev) => [...prev, ...newTracks]);
    if (activeIndex === null && newTracks.length > 0) setActiveIndex(tracks.length);
  }

  function playTrack(i) {
    setActiveIndex(i);
    setTimeout(() => {
      audioRef.current?.play();
      setPlaying(true);
    }, 0);
  }

  function togglePlay() {
    if (activeIndex === null) return;
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying((p) => !p);
  }

  return (
    <div className="p-4 h-full flex flex-col text-sm">
      <button
        onClick={() => inputRef.current?.click()}
        className="mb-3 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs"
      >
        + Add audio files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex-1 overflow-auto space-y-1 mb-3">
        {tracks.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-8">No tracks added yet</p>
        )}
        {tracks.map((t, i) => (
          <button
            key={i}
            onClick={() => playTrack(i)}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs truncate transition ${
              i === activeIndex ? "bg-indigo-500/20 text-indigo-200" : "text-gray-300 hover:bg-white/[0.05]"
            }`}
          >
            {i === activeIndex && playing ? "▶ " : ""}{t.name}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-gray-300 text-xs truncate mb-2">{tracks[activeIndex].name}</p>
          <audio
            ref={audioRef}
            src={tracks[activeIndex].url}
            onEnded={() => setPlaying(false)}
            controls
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}