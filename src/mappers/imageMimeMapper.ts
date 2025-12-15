export const imageMimeMapper: Record<string, string> = {
  // raster / comuns
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jpe: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  dib: "image/bmp",
  // tiff
  tiff: "image/tiff",
  tif: "image/tiff",
  // vetorial / texto
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  eps: "application/postscript",
  ps: "application/postscript",
  ai: "application/postscript",
  pdf: "application/pdf",
  // icons
  ico: "image/x-icon",
  cur: "image/x-icon",
  icns: "image/icns",
  // raw camera formats (common)
  cr2: "image/x-canon-cr2",
  crw: "image/x-canon-crw",
  nef: "image/x-nikon-nef",
  nrw: "image/x-nikon-nrw",
  arw: "image/x-sony-arw",
  orf: "image/x-olympus-orf",
  rw2: "image/x-panasonic-rw2",
  dng: "image/x-adobe-dng",
  raf: "image/x-fuji-raf",
  pef: "image/x-pentax-pef",
  sr2: "image/x-sony-sr2",
  srw: "image/x-samsung-srw",
  // modern formats
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
  jp2: "image/jp2",
  j2k: "image/jp2",
  jpf: "image/jp2",
  jxr: "image/vnd.ms-photo",
  // intermediate / PNM family
  pnm: "image/x-portable-anymap",
  pbm: "image/x-portable-bitmap",
  pgm: "image/x-portable-graymap",
  ppm: "image/x-portable-pixmap",
  pam: "image/x-portable-anymap",
  // HDR / float formats
  hdr: "image/vnd.radiance",
  pic: "image/x-pict",
  exr: "image/x-exr",
  // Photoshop / layered
  psd: "image/vnd.adobe.photoshop",
  xcf: "image/x-xcf",
  // Windows metas
  emf: "application/x-msmetafile",
  wmf: "application/x-msmetafile",
  // special / others
  cgm: "image/cgm",
  mif: "application/vnd.mif",
  // fallback for unknowns
  "": "application/octet-stream",
  cr3: "image/x-canon-cr3",
  jfif: "image/jpeg",
  jpx: "image/jpx",
};
