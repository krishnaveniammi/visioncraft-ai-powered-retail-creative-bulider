export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Story = "9:16",
  Widescreen = "16:9",
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface AdRequest {
  productImage: UploadedImage | null;
  logoImage: UploadedImage | null;
  description: string;
  aspectRatio: AspectRatio;
}

export interface GenerationResult {
  imageUrl: string;
  loading: boolean;
  error: string | null;
}
