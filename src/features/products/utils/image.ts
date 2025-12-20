// features/products/utils/image.ts

export function normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== "string") return null;
  
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
  
    if (url.startsWith("/")) {
      return url;
    }
  
    return `/${url}`;
  }
  
  export function shouldUnoptimize(url: string | null): boolean {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  }