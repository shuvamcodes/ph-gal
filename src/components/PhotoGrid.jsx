import PhotoCard from "./PhotoCard.jsx";

export default function PhotoGrid({ photos, onOpen, selectMode, selectedIds, onToggleSelect }) {
  if (photos.length === 0) {
    return (
      <p className="text-gray-600 text-sm mt-10 text-center">
        Nothing here yet — drop a photo above to get started.
      </p>
    );
  }

  return (
    <div className="fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onOpen={onOpen}
          selectMode={selectMode}
          isSelected={selectedIds?.has(photo.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}