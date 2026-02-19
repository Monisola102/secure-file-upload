export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'] as const,
  UPLOAD_DIR: 'uploads', 
} as const;

export const isAllowedExtension = (ext: string): boolean => {
  return (FILE_CONFIG.ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
};

export const isAllowedMimeType = (mimeType: string): boolean => {
  return (FILE_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
};

export const FILE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};