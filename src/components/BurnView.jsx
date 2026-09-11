import { useEffect, useState } from "react";
import { fetchAndConsumeBurnLink } from "../burnLinks.js";

export default function BurnView({ id }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    fetchAndConsumeBurnLink(id).then(setState);
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (state.status !== "ok") {
    const messages = {
      not_found: "This link doesn't exist.",
      already_viewed: "This link has already been used and is gone.",
      expired: "This link has expired."
    };
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm px-6 text-center">
        {messages[state.status] || "This link is no longer available."}
      </div>
    );
  }

  const { photo } = state;
  const isVideo = photo.type === "video";

  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <p className="text-gray-500 text-xs mb-4">
        This link can only be viewed once and is now gone.
      </p>
      {isVideo ? (
        <video src={photo.url} controls className="max-h-[75vh] max-w-full rounded-2xl" />
      ) : (
        <img src={photo.url} alt={photo.name} className="max-h-[75vh] max-w-full rounded-2xl object-contain" />
      )}
    </div>
  );
}