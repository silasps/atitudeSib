"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  SiteWorkPost,
  WorkPostDescriptionPosition,
} from "@/lib/site-content";

type WorkPostCardProps = {
  post: SiteWorkPost;
  compact?: boolean;
  showTimestamp?: boolean;
};

export default function WorkPostCard({
  post,
  compact = false,
  showTimestamp = true,
}: WorkPostCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaHeight = compact ? "h-64" : "h-[28rem]";
  const timestamp = formatPostDate(post.updatedAt);

  const textBlock = (
    <div className={compact ? "space-y-3 p-5" : "space-y-4 p-6 md:p-8"}>
      <div className="space-y-2">
        <h3 className={compact ? "text-xl font-semibold text-zinc-900" : "text-2xl font-semibold text-zinc-900"}>
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600">{post.description}</p>
      </div>
      {showTimestamp ? (
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
          Atualizado em {timestamp}
        </p>
      ) : null}
    </div>
  );

  if (post.mediaType === "video") {
    return (
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        <div className={`${mediaHeight} bg-zinc-950`}>
          <video
            controls
            className="h-full w-full object-contain"
            src={post.mediaItems[0]?.url}
          />
        </div>
        {textBlock}
      </article>
    );
  }

  if (post.mediaType === "carousel") {
    const safeIndex =
      activeIndex >= post.mediaItems.length ? 0 : activeIndex;
    const currentMedia = post.mediaItems[safeIndex];

    return (
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        <div className={`relative ${mediaHeight} bg-zinc-100`}>
          {currentMedia ? (
            <ResponsiveImageStage src={currentMedia.url} alt={post.title} />
          ) : null}

          {post.mediaItems.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? post.mediaItems.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg font-semibold text-white cursor-pointer"
                aria-label="Imagem anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === post.mediaItems.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg font-semibold text-white cursor-pointer"
                aria-label="Próxima imagem"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2">
                {post.mediaItems.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full cursor-pointer ${
                      index === safeIndex ? "bg-white" : "bg-white/45"
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
        {textBlock}
      </article>
    );
  }

  const imageUrl = post.mediaItems[0]?.url ?? "";
  const position = post.descriptionPosition;

  if (position === "above") {
    return (
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        {textBlock}
        <div className={`relative ${mediaHeight} bg-zinc-100`}>
          <ResponsiveImageStage src={imageUrl} alt={post.title} />
        </div>
      </article>
    );
  }

  if (position === "below") {
    return (
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        <div className={`relative ${mediaHeight} bg-zinc-100`}>
          <ResponsiveImageStage src={imageUrl} alt={post.title} />
        </div>
        {textBlock}
      </article>
    );
  }

  if (position === "left" || position === "right") {
    const mediaBlock = (
      <div className={`relative min-h-[20rem] ${compact ? "md:min-h-[18rem]" : "md:min-h-[24rem]"} bg-zinc-100`}>
        <ResponsiveImageStage src={imageUrl} alt={post.title} />
      </div>
    );

    return (
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          {position === "left" ? (
            <>
              {textBlock}
              {mediaBlock}
            </>
          ) : (
            <>
              {mediaBlock}
              {textBlock}
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
      <div className={`relative ${mediaHeight} bg-zinc-100`}>
        <ResponsiveImageStage src={imageUrl} alt={post.title} />
        <div className={overlayClassName(position)}>
          <div className="max-w-xl rounded-[1.5rem] bg-black/55 p-5 text-white backdrop-blur-sm">
            <p className="text-2xl font-semibold">{post.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              {post.description}
            </p>
            {showTimestamp ? (
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/70">
                Atualizado em {timestamp}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function overlayClassName(position: WorkPostDescriptionPosition) {
  if (position === "overlay-left") {
    return "absolute inset-y-0 left-0 flex items-center p-5 md:p-8";
  }

  if (position === "overlay-right") {
    return "absolute inset-y-0 right-0 flex items-center justify-end p-5 md:p-8";
  }

  if (position === "overlay-top") {
    return "absolute inset-x-0 top-0 flex justify-center p-5 md:p-8";
  }

  return "absolute inset-x-0 bottom-0 flex justify-center p-5 md:p-8";
}

function ResponsiveImageStage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        aria-hidden
        className="object-cover opacity-35 blur-3xl scale-110"
      />
      <div className="absolute inset-0 bg-zinc-950/25" />
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data nao informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(date);
}
