import type { WorkPostMediaType } from "@/lib/site-content";

type PreparedSelection = {
  files: File[];
  notice: string | null;
};

type OptimizedFilesResult = {
  files: File[];
  notice: string | null;
};

const MAX_CAROUSEL_IMAGES = 10;
const MAX_IMAGE_DIMENSION = 1800;
const IMAGE_QUALITY = 0.8;
const VIDEO_MAX_WIDTH = 1280;
const VIDEO_MAX_HEIGHT = 720;

export function normalizeFilesForMediaType(
  inputFiles: File[],
  mediaType: WorkPostMediaType
): PreparedSelection {
  if (mediaType === "carousel") {
    if (inputFiles.length <= MAX_CAROUSEL_IMAGES) {
      return { files: inputFiles, notice: null };
    }

    return {
      files: inputFiles.slice(0, MAX_CAROUSEL_IMAGES),
      notice: `Carrossel limitado a ${MAX_CAROUSEL_IMAGES} imagens. As primeiras foram mantidas.`,
    };
  }

  if (inputFiles.length <= 1) {
    return { files: inputFiles, notice: null };
  }

  return {
    files: inputFiles.slice(0, 1),
    notice:
      mediaType === "video"
        ? "Somente o primeiro video foi mantido."
        : "Somente a primeira imagem foi mantida.",
  };
}

export async function optimizeFilesForUpload(
  files: File[],
  mediaType: WorkPostMediaType,
  onStatus?: (message: string) => void
): Promise<OptimizedFilesResult> {
  if (files.length === 0) {
    return { files: [], notice: null };
  }

  if (mediaType === "video") {
    onStatus?.("Comprimindo video antes do upload...");
    const optimizedVideo = await compressVideoFile(files[0]);

    return {
      files: [optimizedVideo],
      notice:
        optimizedVideo.name !== files[0].name
          ? "O video foi otimizado antes do upload para economizar armazenamento."
          : "Seu navegador manteve o video original porque a compressao local nao trouxe ganho suficiente.",
    };
  }

  onStatus?.(
    mediaType === "carousel"
      ? "Otimizando imagens do carrossel..."
      : "Otimizando imagem..."
  );

  const optimizedImages = await Promise.all(
    files.map((file) => compressImageFile(file))
  );

  return {
    files: optimizedImages,
    notice:
      mediaType === "carousel"
        ? "As imagens foram otimizadas antes do upload."
        : "A imagem foi otimizada antes do upload.",
  };
}

async function compressImageFile(file: File) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(imageUrl);
    const dimensions = fitWithinBox(
      image.naturalWidth,
      image.naturalHeight,
      MAX_IMAGE_DIMENSION,
      MAX_IMAGE_DIMENSION
    );
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    const optimizedBlob = await canvasToBlob(canvas, "image/webp", IMAGE_QUALITY);

    if (!optimizedBlob || optimizedBlob.size >= file.size) {
      return file;
    }

    return new File(
      [optimizedBlob],
      replaceExtension(file.name, "webp"),
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function compressVideoFile(file: File) {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    return file;
  }

  const mimeType = getSupportedVideoMimeType();

  if (!mimeType) {
    return file;
  }

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = videoUrl;
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  try {
    await waitForVideoMetadata(video);

    const dimensions = fitWithinBox(
      video.videoWidth || VIDEO_MAX_WIDTH,
      video.videoHeight || VIDEO_MAX_HEIGHT,
      VIDEO_MAX_WIDTH,
      VIDEO_MAX_HEIGHT
    );

    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    const fps = 24;
    const canvasStream = canvas.captureStream(fps);
    const sourceStream = getVideoCaptureStream(video);
    const audioTracks = sourceStream?.getAudioTracks() ?? [];
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    const originalBitrate =
      video.duration > 0 ? Math.round((file.size * 8) / video.duration) : 1_500_000;
    const videoBitsPerSecond = Math.max(
      500_000,
      Math.min(1_500_000, Math.round(originalBitrate * 0.45))
    );
    const audioBitsPerSecond = 96_000;

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond,
      audioBitsPerSecond,
    });
    const chunks: BlobPart[] = [];
    let animationFrameId = 0;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const recordPromise = new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error("Falha ao comprimir video."));
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
      };
    });

    const drawFrame = () => {
      context.drawImage(video, 0, 0, dimensions.width, dimensions.height);

      if (!video.paused && !video.ended) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
      }
    };

    const videoEndPromise = waitForVideoEnd(video);

    recorder.start(250);
    drawFrame();
    await video.play();
    await videoEndPromise;

    window.cancelAnimationFrame(animationFrameId);
    recorder.stop();

    const compressedBlob = await recordPromise;
    stopStream(combinedStream);
    stopStream(sourceStream);

    if (!compressedBlob || compressedBlob.size >= file.size) {
      return file;
    }

    return new File(
      [compressedBlob],
      replaceExtension(file.name, "webm"),
      {
        type: compressedBlob.type || "video/webm",
        lastModified: Date.now(),
      }
    );
  } catch {
    return file;
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(videoUrl);
  }
}

function fitWithinBox(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function replaceExtension(fileName: string, newExtension: string) {
  return `${fileName.replace(/\.[^/.]+$/, "")}.${newExtension}`;
}

function getSupportedVideoMimeType() {
  const mimeTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return mimeTypes.find((item) => MediaRecorder.isTypeSupported(item)) ?? null;
}

function getVideoCaptureStream(video: HTMLVideoElement) {
  const videoWithCapture = video as HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  };

  if (typeof videoWithCapture.captureStream === "function") {
    return videoWithCapture.captureStream();
  }

  if (typeof videoWithCapture.mozCaptureStream === "function") {
    return videoWithCapture.mozCaptureStream();
  }

  return null;
}

function stopStream(stream: MediaStream | null) {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar imagem."));
    image.src = src;
  });
}

function waitForVideoMetadata(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    if (video.readyState >= 1) {
      resolve();
      return;
    }

    const onLoadedMetadata = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Falha ao carregar metadata do video."));
    };
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
  });
}

function waitForVideoEnd(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    if (video.ended) {
      resolve();
      return;
    }

    const onEnded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Falha durante a compressao do video."));
    };
    const cleanup = () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
