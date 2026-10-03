import JSZip from 'jszip';

export interface ParsedTemplateResult {
  backgroundUrl?: string;
  templateName: string;
  extractedTitles: string[];
}

export async function parseUploadedTemplate(file: File): Promise<ParsedTemplateResult> {
  const fileName = file.name;
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileName);
  const isPptx = /\.(pptx|potx)$/i.test(fileName);

  if (isImage) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bg = (e.target?.result as string) || undefined;
        resolve({
          backgroundUrl: bg,
          templateName: fileName,
          extractedTitles: [],
        });
      };
      reader.readAsDataURL(file);
    });
  }

  if (isPptx) {
    try {
      const zip = await JSZip.loadAsync(file);
      let backgroundUrl: string | undefined = undefined;
      const extractedTitles: string[] = [];

      // 1. Tìm ảnh nền trong thư mục ppt/media/
      const mediaFiles = Object.keys(zip.files).filter((path) =>
        path.startsWith('ppt/media/') && /\.(png|jpe?g)$/i.test(path)
      );

      if (mediaFiles.length > 0) {
        const firstMedia = zip.files[mediaFiles[0]];
        const base64Data = await firstMedia.async('base64');
        const mime = mediaFiles[0].toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        backgroundUrl = `data:${mime};base64,${base64Data}`;
      }

      // 2. Tìm trích xuất tiêu đề từ các slide xml
      const slidePaths = Object.keys(zip.files)
        .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
        .sort();

      for (const sp of slidePaths.slice(0, 5)) {
        const xmlText = await zip.files[sp].async('text');
        const textMatches = xmlText.match(/<a:t>([^<]+)<\/a:t>/g);
        if (textMatches && textMatches.length > 0) {
          const firstText = textMatches[0].replace(/<[^>]+>/g, '').trim();
          if (firstText.length > 3) {
            extractedTitles.push(firstText);
          }
        }
      }

      return {
        backgroundUrl,
        templateName: fileName,
        extractedTitles,
      };
    } catch (err) {
      console.warn('Could not parse pptx zip contents, falling back to name reference:', err);
      return {
        templateName: fileName,
        extractedTitles: [],
      };
    }
  }

  return {
    templateName: fileName,
    extractedTitles: [],
  };
}
