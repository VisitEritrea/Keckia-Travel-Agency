import { createWorker, Worker } from 'tesseract.js';
import {
  normalizeDateToISO,
  normalizeGender,
  normalizeNationality,
  ScannedTouristData,
} from './documentScanner';

export interface OcrProgressInfo {
  status: string;
  progress: number; // 0 to 1
  stage?: 'loading' | 'recognizing' | 'parsing';
}

export interface ParsedPassportResult {
  rawText: string;
  confidence: number;
  lines: string[];
  mrzDetected: boolean;
  mrzType?: 'TD3' | 'TD1' | 'TD2';
  mrzLines?: string[];
  data: ScannedTouristData;
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  grayscale: boolean;
  binarize: boolean; // black & white thresholding
  threshold: number; // 0 to 255 (128 default)
  invert: boolean;
  rotation: number; // 0, 90, 180, 270
}

/**
 * Preprocesses an image on an HTMLCanvasElement according to gImageReader visual adjustments
 */
export function preprocessImageForOcr(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  adjustments: ImageAdjustments,
  cropRect?: { x: number; y: number; width: number; height: number }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to obtain 2D canvas context');

  const srcWidth = cropRect ? cropRect.width : imageSource.width;
  const srcHeight = cropRect ? cropRect.height : imageSource.height;
  const srcX = cropRect ? cropRect.x : 0;
  const srcY = cropRect ? cropRect.y : 0;

  const rot = (adjustments.rotation % 360 + 360) % 360;
  if (rot === 90 || rot === 270) {
    canvas.width = srcHeight;
    canvas.height = srcWidth;
  } else {
    canvas.width = srcWidth;
    canvas.height = srcHeight;
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rot * Math.PI) / 180);

  if (rot === 90 || rot === 270) {
    ctx.drawImage(
      imageSource,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      -srcHeight / 2,
      -srcWidth / 2,
      srcHeight,
      srcWidth
    );
  } else {
    ctx.drawImage(
      imageSource,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      -srcWidth / 2,
      -srcHeight / 2,
      srcWidth,
      srcHeight
    );
  }
  ctx.restore();

  // Apply Pixel-level image enhancements: Grayscale, Invert, Brightness/Contrast, Binarization
  if (
    adjustments.grayscale ||
    adjustments.binarize ||
    adjustments.invert ||
    adjustments.brightness !== 0 ||
    adjustments.contrast !== 0
  ) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const contrastFactor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
    const brightnessOffset = adjustments.brightness;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (brightnessOffset !== 0) {
        r = Math.min(255, Math.max(0, r + brightnessOffset));
        g = Math.min(255, Math.max(0, g + brightnessOffset));
        b = Math.min(255, Math.max(0, b + brightnessOffset));
      }

      // Contrast
      if (adjustments.contrast !== 0) {
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
      }

      // Grayscale calculation (ITU-R BT.601)
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Invert
      if (adjustments.invert) {
        gray = 255 - gray;
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      // Binarization thresholding
      if (adjustments.binarize) {
        const val = gray >= adjustments.threshold ? 255 : 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      } else if (adjustments.grayscale) {
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      } else {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas;
}

let activeTesseractWorker: Worker | null = null;

/**
 * Recognizes text from an image source using Tesseract OCR worker
 */
export async function runTesseractOcr(
  imageSource: string | HTMLCanvasElement | File | Blob,
  onProgress?: (info: OcrProgressInfo) => void
): Promise<ParsedPassportResult> {
  let worker: Worker | null = null;
  try {
    onProgress?.({ status: 'Initializing Tesseract OCR Engine...', progress: 0.1, stage: 'loading' });
    
    // Create dedicated web worker with English character set
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.({
            status: `Reading passport characters... ${Math.round((m.progress || 0) * 100)}%`,
            progress: 0.2 + (m.progress || 0) * 0.7,
            stage: 'recognizing',
          });
        } else if (m.status) {
          onProgress?.({
            status: `${m.status}...`,
            progress: 0.2,
            stage: 'loading',
          });
        }
      },
    });

    onProgress?.({ status: 'Executing Tesseract optical character recognition...', progress: 0.6, stage: 'recognizing' });
    const ret = await worker.recognize(imageSource as any);
    
    onProgress?.({ status: 'Parsing ICAO MRZ & Biometric passport fields...', progress: 0.95, stage: 'parsing' });

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    const parsed = parsePassportTextAndMrz(rawText, lines, confidence);

    onProgress?.({ status: 'OCR Scan Complete', progress: 1.0 });
    return parsed;
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (err) {
        console.warn('Worker termination notice:', err);
      }
    }
  }
}

/**
 * Advanced MRZ (Machine Readable Zone) & Visual Zone extractor for passports (ICAO Doc 9303 TD3 standard)
 */
export function parsePassportTextAndMrz(
  rawText: string,
  lines: string[],
  overallConfidence: number
): ParsedPassportResult {
  const resultData: ScannedTouristData = {
    fullName: '',
    passportNumber: '',
    passportExpiry: '',
    nationality: '',
    dateOfBirth: '',
    dob: '',
    gender: undefined,
    occupation: '',
    email: '',
    phone: '',
    dietaryRequirements: '',
    medicalNotes: '',
    preferredLanguage: '',
    medicalClearanceHighAltitude: true,
    detectedDocumentType: 'Tesseract OCR Passport Scan',
    confidenceScore: Math.round(overallConfidence || 95),
    companions: [],
  };

  // 1. Search for MRZ lines
  // TD3 passport MRZ has 2 lines of ~44 characters starting with P<, P, or containing <<
  const candidateMrzLines: string[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/[\s\r]/g, '').toUpperCase();
    // Check if line looks like an MRZ line (contains << or starts with P< / P[A-Z])
    if (
      (cleaned.includes('<<') && cleaned.length >= 25) ||
      (/^[P|V|I|A|C][<A-Z0-9]{20,}/.test(cleaned) && cleaned.length >= 25)
    ) {
      candidateMrzLines.push(cleaned);
    }
  }

  let mrzDetected = false;
  let mrzType: 'TD3' | 'TD1' | 'TD2' | undefined;
  let mrzLines: string[] = [];

  // Check TD3 (2 lines of 44 chars)
  if (candidateMrzLines.length >= 2) {
    for (let i = 0; i < candidateMrzLines.length - 1; i++) {
      const line1 = candidateMrzLines[i];
      const line2 = candidateMrzLines[i + 1];

      if (line1.startsWith('P') || line1.includes('<<')) {
        const td3Result = parseTD3Mrz(line1, line2);
        if (td3Result.success) {
          mrzDetected = true;
          mrzType = 'TD3';
          mrzLines = [line1, line2];
          Object.assign(resultData, td3Result.data);
          resultData.detectedDocumentType = 'Biometric Passport (ICAO 9303 TD3 MRZ)';
          break;
        }
      }
    }
  }

  // 2. If MRZ not fully populated, extract via Visual Inspection Zone (VIZ) regexes
  if (!resultData.fullName) {
    resultData.fullName = extractFullNameFromViz(rawText, lines);
  }

  if (!resultData.passportNumber) {
    resultData.passportNumber = extractPassportNumberFromViz(rawText, lines);
  }

  if (!resultData.nationality) {
    resultData.nationality = extractNationalityFromViz(rawText, lines);
  }

  if (!resultData.dateOfBirth) {
    const dob = extractDobFromViz(rawText, lines);
    if (dob) {
      resultData.dateOfBirth = dob;
      resultData.dob = dob;
    }
  }

  if (!resultData.passportExpiry) {
    resultData.passportExpiry = extractExpiryFromViz(rawText, lines);
  }

  if (!resultData.gender) {
    resultData.gender = extractGenderFromViz(rawText, lines);
  }

  return {
    rawText,
    confidence: overallConfidence,
    lines,
    mrzDetected,
    mrzType,
    mrzLines: mrzLines.length > 0 ? mrzLines : undefined,
    data: resultData,
  };
}

/**
 * Parses ICAO Doc 9303 TD3 2-line MRZ
 * Line 1 (44 chars): P<UTOERITREA<<TESFAY<<YONAS<<<<<<<<<<<<<<<<<<
 * Line 2 (44 chars): K123456780ERI8509284M3012258<<<<<<<<<<<<<<02
 */
function parseTD3Mrz(line1: string, line2: string): { success: boolean; data: Partial<ScannedTouristData> } {
  try {
    // Pad to 44 characters if slight OCR truncation occurred
    const l1 = (line1.replace(/ /g, '<') + '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<').slice(0, 44);
    const l2 = (line2.replace(/ /g, '<') + '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<').slice(0, 44);

    const docType = l1.slice(0, 2);
    const issuingCountryCode = l1.slice(2, 5).replace(/</g, '');
    const nameSection = l1.slice(5).replace(/<+/g, ' ').trim();

    // Line 2 parsing
    const passportNoRaw = l2.slice(0, 9).replace(/</g, '').trim();
    const nationalityCode = l2.slice(10, 13).replace(/</g, '');
    const dobRaw = l2.slice(13, 19); // YYMMDD
    const genderRaw = l2.slice(20, 21); // M, F, <
    const expiryRaw = l2.slice(21, 27); // YYMMDD

    // Clean passport number
    const passportNumber = passportNoRaw.replace(/[^A-Z0-9]/g, '');

    // Parse Names: Surname << Given Names
    let fullName = nameSection;
    if (l1.slice(5).includes('<<')) {
      const parts = l1.slice(5).split('<<');
      const surname = parts[0].replace(/</g, ' ').trim();
      const given = parts.slice(1).join(' ').replace(/</g, ' ').trim();
      fullName = `${given} ${surname}`.trim() || `${surname} ${given}`.trim();
    }

    const nationality = normalizeNationality(nationalityCode || issuingCountryCode);
    const dateOfBirth = parseYYMMDD(dobRaw, true);
    const passportExpiry = parseYYMMDD(expiryRaw, false);
    const gender = normalizeGender(genderRaw);

    const isMrzValid = Boolean(passportNumber || fullName);

    return {
      success: isMrzValid,
      data: {
        fullName: cleanTitleCase(fullName),
        passportNumber,
        nationality,
        dateOfBirth,
        dob: dateOfBirth,
        passportExpiry,
        gender,
      },
    };
  } catch (err) {
    return { success: false, data: {} };
  }
}

function parseYYMMDD(val: string, isBirth: boolean): string {
  if (!val || val.length < 6 || !/^\d{6}$/.test(val)) return '';
  const yy = parseInt(val.slice(0, 2), 10);
  const mm = val.slice(2, 4);
  const dd = val.slice(4, 6);

  if (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12) return '';
  if (parseInt(dd, 10) < 1 || parseInt(dd, 10) > 31) return '';

  let fullYear: number;
  const currentYear = new Date().getFullYear() % 100;
  if (isBirth) {
    fullYear = yy > currentYear ? 1900 + yy : 2000 + yy;
  } else {
    // Expiry date
    fullYear = yy < 70 ? 2000 + yy : 1900 + yy;
  }

  return `${fullYear}-${mm}-${dd}`;
}

function cleanTitleCase(str: string): string {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ----------------------------------------------------
// Visual Inspection Zone (VIZ) Text Extractors
// ----------------------------------------------------

function extractPassportNumberFromViz(text: string, lines: string[]): string {
  // Common labels: "Passport No", "Document No", "Passeport No", "Pass-Nr."
  const labelMatch = text.match(
    /(?:passport\s*(?:no|number|num[eé]ro|nr)?|doc(?:ument)?\s*(?:no|number)|passeport)\s*[:.\s-]*([A-Z0-9]{7,12})/i
  );
  if (labelMatch && labelMatch[1]) {
    return labelMatch[1].toUpperCase();
  }

  // Look for 8-9 character standalone alphanumeric strings common in passports
  for (const line of lines) {
    const match = line.match(/\b([A-Z][0-9]{7,9}|[0-9]{8,10})\b/);
    if (match && match[1] && !line.toLowerCase().includes('date')) {
      return match[1].toUpperCase();
    }
  }

  return '';
}

function extractFullNameFromViz(text: string, lines: string[]): string {
  // Surname / Given names labels
  const surnameMatch = text.match(/(?:surname|nom|family\s*name|nachname)\s*[:.\s-]*([A-Z\s'-]+)/i);
  const givenMatch = text.match(/(?:given\s*names?|pr[eé]noms?|first\s*name|vorname)\s*[:.\s-]*([A-Z\s'-]+)/i);

  if (surnameMatch && givenMatch) {
    const s = surnameMatch[1].split('\n')[0].trim();
    const g = givenMatch[1].split('\n')[0].trim();
    if (s && g) return cleanTitleCase(`${g} ${s}`);
  }

  // Direct Name label: "Name / Nom : John Doe"
  const nameMatch = text.match(/(?:name|nom\s*complet|full\s*name)\s*[:.\s-]*([A-Za-z\s'-]{4,40})/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].split('\n')[0].trim();
    if (!candidate.toLowerCase().includes('passport') && !candidate.toLowerCase().includes('republic')) {
      return cleanTitleCase(candidate);
    }
  }

  return '';
}

function extractNationalityFromViz(text: string, lines: string[]): string {
  const natMatch = text.match(
    /(?:nationality|nationalit[eé]|staatsangeh[oö]rigkeit|citizenship)\s*[:.\s-]*([A-Za-z\s]+)/i
  );
  if (natMatch && natMatch[1]) {
    const candidate = natMatch[1].split('\n')[0].trim();
    const normalized = normalizeNationality(candidate);
    if (normalized) return normalized;
  }

  // Country mentions
  const countryMap = [
    { regex: /\b(eritrea|eritrean|state of eritrea)\b/i, name: 'Eritrean' },
    { regex: /\b(united kingdom|great britain|british)\b/i, name: 'British' },
    { regex: /\b(united states|america|usa|american)\b/i, name: 'American' },
    { regex: /\b(france|french|r[eé]publique fran[cç]aise)\b/i, name: 'French' },
    { regex: /\b(germany|german|deutschland)\b/i, name: 'German' },
    { regex: /\b(italy|italian|italia|repubblica italiana)\b/i, name: 'Italian' },
    { regex: /\b(switzerland|swiss|schweiz|suisse)\b/i, name: 'Swiss' },
    { regex: /\b(canada|canadian)\b/i, name: 'Canadian' },
    { regex: /\b(australia|australian)\b/i, name: 'Australian' },
    { regex: /\b(ethiopia|ethiopian)\b/i, name: 'Ethiopian' },
    { regex: /\b(egypt|egyptian)\b/i, name: 'Egyptian' },
    { regex: /\b(saudi arabia|saudi)\b/i, name: 'Saudi' },
    { regex: /\b(united arab emirates|uae|emirati)\b/i, name: 'Emirati' },
    { regex: /\b(china|chinese)\b/i, name: 'Chinese' },
    { regex: /\b(japan|japanese)\b/i, name: 'Japanese' },
    { regex: /\b(turkey|turkish|t[uü]rkiye)\b/i, name: 'Turkish' },
  ];

  for (const c of countryMap) {
    if (c.regex.test(text)) {
      return c.name;
    }
  }

  return '';
}

function extractDobFromViz(text: string, lines: string[]): string {
  const dobMatch = text.match(
    /(?:date\s*of\s*birth|date\s*de\s*naissance|geburtsdatum|birth\s*date|dob)\s*[:.\s-]*([0-9A-Za-z\s/.-]{6,20})/i
  );
  if (dobMatch && dobMatch[1]) {
    const raw = dobMatch[1].split('\n')[0].trim();
    const iso = normalizeDateToISO(raw);
    if (iso) return iso;
  }
  return '';
}

function extractExpiryFromViz(text: string, lines: string[]): string {
  const expMatch = text.match(
    /(?:date\s*of\s*expiry|date\s*d['\s]*expiration|valid\s*until|expires|expiry\s*date|g[uü]ltig\s*bis)\s*[:.\s-]*([0-9A-Za-z\s/.-]{6,20})/i
  );
  if (expMatch && expMatch[1]) {
    const raw = expMatch[1].split('\n')[0].trim();
    const iso = normalizeDateToISO(raw);
    if (iso) return iso;
  }
  return '';
}

function extractGenderFromViz(text: string, lines: string[]): 'Male' | 'Female' | 'Other' | 'Prefer not to say' | undefined {
  const sexMatch = text.match(/(?:sex|sexe|gender|geschlecht)\s*[:.\s-]*([MFXO]|male|female|homme|femme)/i);
  if (sexMatch && sexMatch[1]) {
    return normalizeGender(sexMatch[1]);
  }
  return undefined;
}
