function getVideoThumbnail(url) {
  return url.replace(/\.[^./]+$/, ".jpg");
}

export default function PhotoCard({ photo, onOpen, selectMode, isSelected, onToggleSelect }) {
  function handleClick() {
    if (selectMode) {
      onToggleSelect(photo.id);
    } else {
      onOpen(photo);
    }
  }

  const isVideo = photo.type === "video";

  return (
    <div
      onClick={handleClick}
      className={`aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border cursor-pointer group relative transition-all hover:-translate-y-1 ${
        isSelected
          ? "border-indigo-400 shadow-[0_8px_30px_rgba(99,102,241,0.35)]"
          : "border-white/10 hover:border-indigo-400/40 hover:shadow-[0_8px_30px_rgba(99,102,241,0.25)]"
      }`}
    >
      <img
        src={isVideo ? getVideoThumbnail(photo.url) : photo.url}
        alt={photo.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm ml-0.5">▶</span>
          </div>
        </div>
      )}

      {selectMode && (
        <div
          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
            isSelected
              ? "bg-indigo-500 border-indigo-400"
              : "bg-black/40 border-white/40"
          }`}
        >
          {isSelected && <span className="text-white text-xs">✓</span>}
        </div>
      )}
    </div>
  );
}