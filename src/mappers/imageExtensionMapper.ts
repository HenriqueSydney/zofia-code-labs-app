// Arquivo gerado automaticamente — NÃO EDITAR MANUALMENTE
export interface ImageFormatEntry {
  label: string;
  mime: string;
  extensions: string[];
  group: string;
}

export const imageExtensionMapper = {
  vector: {
    ai: {
      label: "Adobe Illustrator",
      mime: "application/postscript",
      extensions: [".ai"],
      group: "vector",
    },
    eps: {
      label: "Encapsulated PostScript",
      mime: "application/postscript",
      extensions: [".eps"],
      group: "vector",
    },
    ps: {
      label: "PostScript",
      mime: "application/postscript",
      extensions: [".ps"],
      group: "vector",
    },
    svg: {
      label: "Scalable Vector Graphics",
      mime: "image/svg+xml",
      extensions: [".svg", ".svgz"],
      group: "vector",
    },
    svgz: {
      label: "Compressed SVG",
      mime: "image/svg+xml",
      extensions: [".svgz", ".svg"],
      group: "vector",
    },
  },
  animated: {
    apng: {
      label: "Animated PNG",
      mime: "application/octet-stream",
      extensions: [".apng"],
      group: "animated",
    },
    jng: {
      label: "JPEG Network Graphics",
      mime: "application/octet-stream",
      extensions: [".jng"],
      group: "animated",
    },
    mng: {
      label: "Multiple-image Network Graphics",
      mime: "application/octet-stream",
      extensions: [".mng"],
      group: "animated",
    },
  },
  raw: {
    arw: {
      label: "Sony Alpha Raw",
      mime: "image/x-sony-arw",
      extensions: [".arw", ".sr2"],
      group: "raw",
    },
    cr2: {
      label: "Canon Raw 2",
      mime: "image/x-canon-cr2",
      extensions: [".cr2", ".crw", ".cr3"],
      group: "raw",
    },
    cr3: {
      label: "Canon Raw 3",
      mime: "image/x-canon-cr3",
      extensions: [".cr3", ".cr2", ".crw"],
      group: "raw",
    },
    crw: {
      label: "Canon Raw (CRW)",
      mime: "image/x-canon-crw",
      extensions: [".crw", ".cr2", ".cr3"],
      group: "raw",
    },
    dcr: {
      label: "DCR",
      mime: "application/octet-stream",
      extensions: [".dcr"],
      group: "raw",
    },
    dng: {
      label: "Digital Negative (Adobe)",
      mime: "image/x-adobe-dng",
      extensions: [".dng"],
      group: "raw",
    },
    erf: {
      label: "ERF",
      mime: "application/octet-stream",
      extensions: [".erf"],
      group: "raw",
    },
    fff: {
      label: "FFF",
      mime: "application/octet-stream",
      extensions: [".fff"],
      group: "raw",
    },
    iiq: {
      label: "IIQ",
      mime: "application/octet-stream",
      extensions: [".iiq"],
      group: "raw",
    },
    k25: {
      label: "K25",
      mime: "application/octet-stream",
      extensions: [".k25"],
      group: "raw",
    },
    kdc: {
      label: "KDC",
      mime: "application/octet-stream",
      extensions: [".kdc"],
      group: "raw",
    },
    mdc: {
      label: "MDC",
      mime: "application/octet-stream",
      extensions: [".mdc"],
      group: "raw",
    },
    mef: {
      label: "MEF",
      mime: "application/octet-stream",
      extensions: [".mef"],
      group: "raw",
    },
    mos: {
      label: "MOS",
      mime: "application/octet-stream",
      extensions: [".mos"],
      group: "raw",
    },
    mrw: {
      label: "MRW",
      mime: "application/octet-stream",
      extensions: [".mrw"],
      group: "raw",
    },
    nef: {
      label: "Nikon Electronic Format",
      mime: "image/x-nikon-nef",
      extensions: [".nef", ".nrw"],
      group: "raw",
    },
    nrw: {
      label: "Nikon Raw (NRW)",
      mime: "image/x-nikon-nrw",
      extensions: [".nrw", ".nef"],
      group: "raw",
    },
    orf: {
      label: "Olympus Raw Format",
      mime: "image/x-olympus-orf",
      extensions: [".orf"],
      group: "raw",
    },
    pef: {
      label: "Pentax Electronic File",
      mime: "image/x-pentax-pef",
      extensions: [".pef"],
      group: "raw",
    },
    raf: {
      label: "Fujifilm Raw Format",
      mime: "image/x-fuji-raf",
      extensions: [".raf"],
      group: "raw",
    },
    raw: {
      label: "RAW",
      mime: "application/octet-stream",
      extensions: [".raw"],
      group: "raw",
    },
    rw2: {
      label: "Panasonic Raw 2",
      mime: "image/x-panasonic-rw2",
      extensions: [".rw2"],
      group: "raw",
    },
    rwl: {
      label: "RWL",
      mime: "application/octet-stream",
      extensions: [".rwl"],
      group: "raw",
    },
    sr2: {
      label: "Sony Raw 2",
      mime: "image/x-sony-sr2",
      extensions: [".sr2", ".arw"],
      group: "raw",
    },
    srf: {
      label: "SRF",
      mime: "application/octet-stream",
      extensions: [".srf"],
      group: "raw",
    },
    srw: {
      label: "Samsung Raw Format",
      mime: "image/x-samsung-srw",
      extensions: [".srw"],
      group: "raw",
    },
    x3f: {
      label: "X3F",
      mime: "application/octet-stream",
      extensions: [".x3f"],
      group: "raw",
    },
  },
  raster: {
    avif: {
      label: "AV1 Image File Format",
      mime: "image/avif",
      extensions: [".avif"],
      group: "raster",
    },
    bmp: {
      label: "Bitmap Image",
      mime: "image/bmp",
      extensions: [".bmp"],
      group: "raster",
    },
    gif: {
      label: "Graphics Interchange Format",
      mime: "image/gif",
      extensions: [".gif"],
      group: "raster",
    },
    heic: {
      label: "High Efficiency Image Container",
      mime: "image/heic",
      extensions: [".heic", ".heif", ".hif"],
      group: "raster",
    },
    heif: {
      label: "High Efficiency Image Format",
      mime: "image/heif",
      extensions: [".heif", ".heic", ".hif"],
      group: "raster",
    },
    j2k: {
      label: "JPEG 2000 Codestream",
      mime: "image/jp2",
      extensions: [".j2k", ".jp2", ".jpf", ".jpx"],
      group: "raster",
    },
    jp2: {
      label: "JPEG 2000",
      mime: "image/jp2",
      extensions: [".jp2", ".j2k", ".jpf", ".jpx"],
      group: "raster",
    },
    jpe: {
      label: "JPEG Image",
      mime: "image/jpeg",
      extensions: [".jpe", ".jpg", ".jpeg", ".jfif"],
      group: "raster",
    },
    jpeg: {
      label: "JPEG Image",
      mime: "image/jpeg",
      extensions: [".jpeg", ".jpg", ".jpe", ".jfif"],
      group: "raster",
    },
    jpg: {
      label: "JPEG Image",
      mime: "image/jpeg",
      extensions: [".jpg", ".jpeg", ".jpe", ".jfif"],
      group: "raster",
    },
    jxl: {
      label: "JPEG XL",
      mime: "application/octet-stream",
      extensions: [".jxl"],
      group: "raster",
    },
    pam: {
      label: "Portable Arbitrary Map",
      mime: "image/x-portable-anymap",
      extensions: [".pam", ".pnm", ".pbm", ".pgm", ".ppm"],
      group: "raster",
    },
    pbm: {
      label: "Portable Bitmap",
      mime: "image/x-portable-bitmap",
      extensions: [".pbm", ".pnm", ".pgm", ".ppm", ".pam"],
      group: "raster",
    },
    pcx: {
      label: "PC Paintbrush",
      mime: "application/octet-stream",
      extensions: [".pcx"],
      group: "raster",
    },
    pgm: {
      label: "Portable Graymap",
      mime: "image/x-portable-graymap",
      extensions: [".pgm", ".pnm", ".pbm", ".ppm", ".pam"],
      group: "raster",
    },
    png: {
      label: "Portable Network Graphics",
      mime: "image/png",
      extensions: [".png"],
      group: "raster",
    },
    pnm: {
      label: "Portable Anymap",
      mime: "image/x-portable-anymap",
      extensions: [".pnm", ".pbm", ".pgm", ".ppm", ".pam"],
      group: "raster",
    },
    ppm: {
      label: "Portable Pixmap",
      mime: "image/x-portable-pixmap",
      extensions: [".ppm", ".pnm", ".pbm", ".pgm", ".pam"],
      group: "raster",
    },
    qoi: {
      label: "QOI",
      mime: "application/octet-stream",
      extensions: [".qoi"],
      group: "raster",
    },
    ras: {
      label: "Sun Raster Image",
      mime: "application/octet-stream",
      extensions: [".ras"],
      group: "raster",
    },
    sgi: {
      label: "Silicon Graphics Image",
      mime: "application/octet-stream",
      extensions: [".sgi"],
      group: "raster",
    },
    sun: {
      label: "Sun Raster",
      mime: "application/octet-stream",
      extensions: [".sun"],
      group: "raster",
    },
    tga: {
      label: "Truevision TGA (Targa)",
      mime: "application/octet-stream",
      extensions: [".tga"],
      group: "raster",
    },
    tif: {
      label: "Tagged Image File Format",
      mime: "image/tiff",
      extensions: [".tif", ".tiff"],
      group: "raster",
    },
    tiff: {
      label: "Tagged Image File Format",
      mime: "image/tiff",
      extensions: [".tiff", ".tif"],
      group: "raster",
    },
    webp: {
      label: "WebP Image",
      mime: "image/webp",
      extensions: [".webp"],
      group: "raster",
    },
    xbm: {
      label: "X11 Bitmap",
      mime: "application/octet-stream",
      extensions: [".xbm"],
      group: "raster",
    },
    xpm: {
      label: "X11 Pixmap",
      mime: "application/octet-stream",
      extensions: [".xpm"],
      group: "raster",
    },
  },
  cinema: {
    cin: {
      label: "Cineon",
      mime: "application/octet-stream",
      extensions: [".cin"],
      group: "cinema",
    },
    dpx: {
      label: "Digital Picture Exchange",
      mime: "application/octet-stream",
      extensions: [".dpx"],
      group: "cinema",
    },
  },
  icon: {
    cur: {
      label: "Windows Cursor",
      mime: "image/x-icon",
      extensions: [".cur", ".ico", ".icns"],
      group: "icon",
    },
    ico: {
      label: "Windows Icon",
      mime: "image/x-icon",
      extensions: [".ico", ".cur", ".icns"],
      group: "icon",
    },
  },
  medical: {
    dcm: {
      label: "DICOM Medical Image",
      mime: "application/octet-stream",
      extensions: [".dcm"],
      group: "medical",
    },
  },
  texture: {
    dds: {
      label: "DirectDraw Surface",
      mime: "application/octet-stream",
      extensions: [".dds"],
      group: "texture",
    },
    dxt1: {
      label: "DXT1",
      mime: "application/octet-stream",
      extensions: [".dxt1"],
      group: "texture",
    },
    dxt5: {
      label: "DXT5",
      mime: "application/octet-stream",
      extensions: [".dxt5"],
      group: "texture",
    },
  },
  hdr: {
    exr: {
      label: "OpenEXR",
      mime: "image/x-exr",
      extensions: [".exr"],
      group: "hdr",
    },
    hdr: {
      label: "Radiance HDR",
      mime: "image/vnd.radiance",
      extensions: [".hdr"],
      group: "hdr",
    },
  },
  document: {
    fax: {
      label: "Group 3 FAX",
      mime: "application/octet-stream",
      extensions: [".fax"],
      group: "document",
    },
    pdf: {
      label: "Portable Document Format",
      mime: "application/pdf",
      extensions: [".pdf"],
      group: "document",
    },
  },
  scientific: {
    fits: {
      label: "Flexible Image Transport System",
      mime: "application/octet-stream",
      extensions: [".fits"],
      group: "scientific",
    },
  },
  layered: {
    psd: {
      label: "Adobe Photoshop Document",
      mime: "image/vnd.adobe.photoshop",
      extensions: [".psd"],
      group: "layered",
    },
    xcf: {
      label: "GIMP Image",
      mime: "image/x-xcf",
      extensions: [".xcf"],
      group: "layered",
    },
  },
  mobile: {
    wbmp: {
      label: "Wireless Bitmap",
      mime: "application/octet-stream",
      extensions: [".wbmp"],
      group: "mobile",
    },
  },
};

export const SUPPORTED_IMAGE_EXTENSIONS = Object.values(imageExtensionMapper)
  .flatMap((group) => Object.values(group))
  .flatMap((format) => format.extensions)
  .map((ext) => ext.replace(".", ""))
  .filter((ext, index, self) => self.indexOf(ext) === index) // Remove duplicatas
  .sort((a, b) => a.localeCompare(b));

// Extrai todos os MIME types únicos
export const SUPPORTED_IMAGE_MIME_TYPES = Object.values(imageExtensionMapper)
  .flatMap((group) => Object.values(group))
  .map((format) => format.mime)
  .filter((mime, index, self) => self.indexOf(mime) === index) // Remove duplicatas
  .sort((a, b) => a.localeCompare(b));

// Gera string de accept para input file (formato: .ext1,.ext2,.ext3)
export const IMAGE_ACCEPT_STRING = SUPPORTED_IMAGE_EXTENSIONS.map(
  (ext) => `.${ext}`
).join(",");

// Gera objeto de accept para bibliotecas como react-dropzone (formato: { 'mime/type': ['.ext'] })
export const IMAGE_ACCEPT_OBJECT = Object.values(imageExtensionMapper)
  .flatMap((group) => Object.values(group))
  .reduce((acc, format) => {
    if (!acc[format.mime]) {
      acc[format.mime] = [];
    }
    acc[format.mime].push(...format.extensions);
    return acc;
  }, {} as Record<string, string[]>);

// Grupos específicos caso você queira filtrar apenas certos tipos
export const COMMON_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
];

export const RASTER_IMAGE_EXTENSIONS = Object.values(
  imageExtensionMapper.raster
)
  .flatMap((format) => format.extensions)
  .map((ext) => ext.replace(".", ""));

export const VECTOR_IMAGE_EXTENSIONS = Object.values(
  imageExtensionMapper.vector
)
  .flatMap((format) => format.extensions)
  .map((ext) => ext.replace(".", ""));

export const RAW_IMAGE_EXTENSIONS = Object.values(imageExtensionMapper.raw)
  .flatMap((format) => format.extensions)
  .map((ext) => ext.replace(".", ""));

const createMimeToExtensionMap = (): Record<string, string> => {
  const map: Record<string, string> = {};

  Object.values(imageExtensionMapper).forEach((group) => {
    Object.values(group).forEach((format) => {
      // Usa a primeira extensão como padrão para cada MIME type
      if (!map[format.mime]) {
        map[format.mime] = format.extensions[0];
      }
    });
  });

  return map;
};

// Mapa gerado automaticamente do mapper
const MIME_TO_EXTENSION_MAP = createMimeToExtensionMap();

export const mimeToExtension = (mime: string): string => {
  // Caso especial para image/*
  if (mime === "image/*") {
    return `.${SUPPORTED_IMAGE_EXTENSIONS.join("; .")}`;
  }

  // Busca no mapa gerado automaticamente
  if (MIME_TO_EXTENSION_MAP[mime]) {
    return MIME_TO_EXTENSION_MAP[mime];
  }

  // Fallbacks manuais para casos especiais
  const manualMap: Record<string, string> = {
    "application/pdf": ".pdf",
  };

  return manualMap[mime] || "";
};

// Função auxiliar: retorna TODAS as extensões para um MIME type
export const mimeToAllExtensions = (mime: string): string[] => {
  const extensions: string[] = [];

  Object.values(imageExtensionMapper).forEach((group) => {
    Object.values(group).forEach((format) => {
      if (format.mime === mime) {
        extensions.push(...format.extensions);
      }
    });
  });

  return extensions.filter((ext, index, self) => self.indexOf(ext) === index);
};

// Função auxiliar: retorna o MIME type a partir de uma extensão
export const extensionToMime = (extension: string): string => {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;

  for (const group of Object.values(imageExtensionMapper)) {
    for (const format of Object.values(group)) {
      if (format.extensions.includes(ext)) {
        return format.mime;
      }
    }
  }

  return "";
};

// String otimizada usando MIME types (mais eficiente para navegadores)
export const IMAGE_ACCEPT_MIME_STRING = SUPPORTED_IMAGE_MIME_TYPES.join(",");
