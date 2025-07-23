import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export const usePdfThumbnails = (urls: string[] = []) => {
  const [thumbnails, setThumbnails] = useState<{ [key: number]: string | null }>({});
  const processedIndexes = useRef<Set<number>>(new Set()); // guarda índices ya procesados

  useEffect(() => {
    let isMounted = true;

    const generateThumbnail = async (url: string): Promise<string | null> => {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        return canvas.toDataURL();
      } catch (error) {
        console.error("Error generando miniatura PDF:", error);
        return null;
      }
    };

    const processThumbnails = async () => {
      for (let idx = 0; idx < urls.length; idx++) {
        if (!processedIndexes.current.has(idx)) {
          const url = urls[idx];
          const ext = url.split(".").pop()?.toLowerCase();

          if (ext === "pdf") {
            const thumb = await generateThumbnail(url);
            if (isMounted) {
              setThumbnails(prev => ({ ...prev, [idx]: thumb }));
            }
          } else {
            // No es PDF, pon null o alguna imagen placeholder si quieres
            if (isMounted) {
              setThumbnails(prev => ({ ...prev, [idx]: null }));
            }
          }
          processedIndexes.current.add(idx);
        }
      }
    };

    processThumbnails();

    return () => {
      isMounted = false;
    };
  }, [urls]);

  return thumbnails;
};
