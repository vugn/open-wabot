export interface PackInfo {
  packname?: string;
  author?: string;
}

export interface StickerOptions {
  cmdType?: string;
  withPackInfo?: boolean;
  packInfo?: PackInfo;
  isImage?: boolean;
  isSticker?: boolean;
  isVideo?: boolean;
}
