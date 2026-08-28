import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker if in browser
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.warn('PDF.js worker setup note:', e);
  }
}

// Indian State Codes dictionary for GSTIN & State Name resolution
export const STATE_CODE_MAP = {
  '01': 'JAMMU & KASHMIR (01)',
  '02': 'HIMACHAL PRADESH (02)',
  '03': 'PUNJAB (03)',
  '04': 'CHANDIGARH (04)',
  '05': 'UTTARAKHAND (05)',
  '06': 'HARYANA (06)',
  '07': 'DELHI (07)',
  '08': 'RAJASTHAN (08)',
  '09': 'UTTAR PRADESH (09)',
  '10': 'BIHAR (10)',
  '11': 'SIKKIM (11)',
  '12': 'ARUNACHAL PRADESH (12)',
  '13': 'NAGALAND (13)',
  '14': 'MANIPUR (14)',
  '15': 'MIZORAM (15)',
  '16': 'TRIPURA (16)',
  '17': 'MEGHALAYA (17)',
  '18': 'ASSAM (18)',
  '19': 'WEST BENGAL (19)',
  '20': 'JHARKHAND (20)',
  '21': 'ODISHA (21)',
  '22': 'CHHATTISGARH (22)',
  '23': 'MADHYA PRADESH (23)',
  '24': 'GUJARAT (24)',
  '27': 'MAHARASHTRA (27)',
  '29': 'KARNATAKA (29)',
  '30': 'GOA (30)',
  '31': 'LAKSHADWEEP (31)',
  '32': 'KERALA (32)',
  '33': 'TAMILNADU (33)',
  '34': 'PUDUCHERRY (34)',
  '36': 'TELANGANA (36)',
  '37': 'ANDHRA PRADESH (37)'
};

// Sri Durga Enterprises details (to ignore own GST/PAN when looking for customer GST/PAN)
const SRI_DURGA_GSTIN = '34ABDFS4476N1ZN';
const SRI_DURGA_PAN = 'ABDFS4476N';

/**
 * Preprocesses an image using Canvas for higher OCR accuracy
 */
export async function preprocessImage(imageSource) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        
        const maxDim = 2400;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;
        
        const contrast = 1.35;
        const factor = (259 * (contrast * 128 + 255)) / (255 * (259 - contrast * 128));
        
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          gray = factor * (gray - 128) + 128;
          gray = Math.max(0, Math.min(255, gray));
          if (gray > 215) gray = 255;
          
          d[i] = gray;
          d[i + 1] = gray;
          d[i + 2] = gray;
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas preprocessing fallback:', err);
        resolve(imageSource);
      }
    };
    
    img.onerror = () => {
      resolve(imageSource);
    };
    
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      resolve(imageSource);
    }
  });
}

/**
 * Extracts raw text from a PDF file using PDF.js text layer or canvas rendering
 */
export async function extractTextFromPdf(file, onProgress = () => {}) {
  try {
    onProgress({ status: 'reading_pdf', progress: 0.2, message: 'Reading PDF document structure...' });
    const arrayBuffer = await file.arrayBuffer();
    
    let loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdfDoc.numPages;
    
    for (let pageNum = 1; pageNum <= Math.min(numPages, 10); pageNum++) {
      onProgress({ 
        status: 'reading_pdf', 
        progress: 0.2 + (pageNum / numPages) * 0.4, 
        message: `Extracting page ${pageNum} of ${numPages}...` 
      });
      
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items preserving layout and linebreaks
      let lastY = null;
      let pageStr = '';
      
      for (const item of textContent.items) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageStr += '\n';
        } else if (pageStr.length > 0 && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
          pageStr += ' ';
        }
        pageStr += item.str;
        lastY = item.transform[5];
      }
      
      fullText += pageStr + '\n\n';
      
      // If digital text is very sparse (e.g. scanned document in PDF), render page to canvas and OCR
      if (pageStr.trim().length < 50) {
        try {
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          const imgUrl = canvas.toDataURL('image/png');
          
          onProgress({ 
            status: 'ocr_scanned_pdf', 
            progress: 0.6, 
            message: `Scanned PDF detected. Running OCR on page ${pageNum}...` 
          });
          
          const ocrPageText = await performInvoiceOcr(imgUrl, onProgress);
          fullText += '\n' + ocrPageText;
        } catch (renderErr) {
          console.warn('PDF canvas render fallback:', renderErr);
        }
      }
    }
    
    return fullText.trim();
  } catch (err) {
    console.error('PDF parsing failed:', err);
    throw new Error(`Failed to parse PDF document: ${err.message || 'Unknown format'}`);
  }
}

/**
 * Extracts and parses Excel spreadsheets (.xlsx, .xls, .csv)
 */
export async function parseExcelDocument(file, masterCustomers = [], masterItems = []) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    let allSheetText = '';
    const allRows = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const sheetJson = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      sheetJson.forEach(row => {
        if (Array.isArray(row) && row.some(cell => String(cell).trim().length > 0)) {
          allRows.push(row);
          allSheetText += row.map(c => String(c).trim()).join(' | ') + '\n';
        }
      });
    });

    // Run standard text parser first
    const parsed = extractInvoiceDataFromText(allSheetText, masterCustomers, masterItems);
    
    // Supplement with high-precision tabular row parser from Excel rows
    const excelLineItems = [];
    let headerRowIdx = -1;
    let colMap = { sNo: -1, code: -1, desc: -1, qty: -1, unit: -1, rate: -1, amount: -1 };
    
    // Detect Table Header row in Excel
    for (let i = 0; i < allRows.length; i++) {
      const r = allRows[i].map(c => String(c).toLowerCase().trim());
      const hasCode = r.some(c => c.includes('code') || c.includes('item'));
      const hasDesc = r.some(c => c.includes('desc') || c.includes('particular') || c.includes('specification'));
      const hasQty = r.some(c => c.includes('qty') || c.includes('quantity'));
      const hasRate = r.some(c => c.includes('rate') || c.includes('price') || c.includes('unit price'));
      
      if ((hasCode || hasDesc) && (hasQty || hasRate)) {
        headerRowIdx = i;
        r.forEach((colName, colIdx) => {
          if (colName.includes('s.no') || colName.includes('sl') || colName === 'no') colMap.sNo = colIdx;
          else if (colName.includes('item code') || colName === 'code' || colName.includes('rc no')) colMap.code = colIdx;
          else if (colName.includes('desc') || colName.includes('particular') || colName.includes('specification') || colName === 'item') colMap.desc = colIdx;
          else if (colName.includes('qty') || colName.includes('quantity')) colMap.qty = colIdx;
          else if (colName.includes('unit') || colName.includes('uom')) colMap.unit = colIdx;
          else if (colName.includes('rate') || colName.includes('price')) colMap.rate = colIdx;
          else if (colName.includes('amount') || colName.includes('total')) colMap.amount = colIdx;
        });
        break;
      }
    }

    if (headerRowIdx !== -1) {
      for (let i = headerRowIdx + 1; i < allRows.length; i++) {
        const row = allRows[i];
        if (!row || row.length === 0) continue;
        
        const codeVal = colMap.code !== -1 ? String(row[colMap.code] || '').trim() : '';
        const descVal = colMap.desc !== -1 ? String(row[colMap.desc] || '').trim() : '';
        const qtyVal = colMap.qty !== -1 ? Number(row[colMap.qty]) || 1 : 1;
        const unitVal = colMap.unit !== -1 ? String(row[colMap.unit] || 'No').trim() : 'No';
        const rateVal = colMap.rate !== -1 ? Number(row[colMap.rate]) || 0 : 0;
        const amountVal = colMap.amount !== -1 ? Number(row[colMap.amount]) || (qtyVal * rateVal) : (qtyVal * rateVal);
        
        // Skip totals or empty rows
        if (!codeVal && !descVal) continue;
        if (descVal.toLowerCase().includes('total') || descVal.toLowerCase().includes('grand total') || descVal.toLowerCase().includes('cgst')) continue;
        
        // Match with master items
        let matched = null;
        if (codeVal) {
          matched = masterItems.find(m => m.itemCode && m.itemCode.toUpperCase() === codeVal.toUpperCase());
        }
        if (!matched && descVal) {
          matched = masterItems.find(m => m.description && descVal.toLowerCase().includes(m.description.toLowerCase().slice(0, 15)));
        }

        excelLineItems.push({
          serialNumber: excelLineItems.length + 1,
          itemCode: matched ? matched.itemCode : (codeVal || 'CUSTOM'),
          description: descVal || (matched ? matched.description : codeVal),
          quantity: qtyVal,
          unit: unitVal || (matched ? matched.unit : 'No'),
          rate: rateVal || (matched ? Number(matched.rate) : 0),
          amount: amountVal || (qtyVal * (rateVal || (matched ? Number(matched.rate) : 0))),
          fetched: !!matched
        });
      }
    }

    if (excelLineItems.length > 0) {
      parsed.extracted.lineItems = excelLineItems;
      parsed.lineItems = excelLineItems;
    }

    parsed.rawText = allSheetText;
    return parsed;
  } catch (err) {
    console.error('Excel extraction error:', err);
    throw new Error(`Failed to parse Excel spreadsheet: ${err.message || 'Invalid format'}`);
  }
}

/**
 * Universal Multi-Format Document & Image Processor
 * Accepts: Images (.png, .jpg, .jpeg, .webp, .bmp), PDFs (.pdf), Excel (.xlsx, .xls, .csv), JSON (.json), Text (.txt)
 */
export async function processUniversalDocument(file, masterCustomers = [], masterItems = [], onProgress = () => {}) {
  const fileName = (file.name || '').toLowerCase();
  
  // 1. EXCEL / SPREADSHEET (.xlsx, .xls, .csv)
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv') || file.type.includes('spreadsheet') || file.type.includes('excel') || file.type.includes('csv')) {
    onProgress({ status: 'reading_excel', progress: 0.5, message: 'Reading Excel workbook & sheets...' });
    const result = await parseExcelDocument(file, masterCustomers, masterItems);
    onProgress({ status: 'done', progress: 1.0, message: 'Excel details extracted successfully!' });
    return result;
  }

  // 2. PDF DOCUMENT (.pdf)
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    onProgress({ status: 'reading_pdf', progress: 0.3, message: 'Extracting PDF text content...' });
    const pdfText = await extractTextFromPdf(file, onProgress);
    onProgress({ status: 'parsing', progress: 0.9, message: 'Analyzing invoice fields & items from PDF...' });
    const parsed = extractInvoiceDataFromText(pdfText, masterCustomers, masterItems);
    onProgress({ status: 'done', progress: 1.0, message: 'PDF parsed successfully!' });
    return parsed;
  }

  // 3. JSON DATA (.json)
  if (fileName.endsWith('.json') || file.type === 'application/json') {
    onProgress({ status: 'reading_json', progress: 0.7, message: 'Parsing JSON invoice data...' });
    const text = await file.text();
    const json = JSON.parse(text);
    const lineItems = Array.isArray(json.lineItems || json.items) ? (json.lineItems || json.items) : [];
    return {
      extracted: { ...json, lineItems },
      lineItems: lineItems,
      rawText: text
    };
  }

  // 4. PLAIN TEXT / LOG (.txt, .log)
  if (fileName.endsWith('.txt') || fileName.endsWith('.log') || file.type.includes('text/plain')) {
    onProgress({ status: 'reading_text', progress: 0.7, message: 'Parsing text document...' });
    const text = await file.text();
    return extractInvoiceDataFromText(text, masterCustomers, masterItems);
  }

  // 5. IMAGE (PNG, JPG, JPEG, WEBP, BMP, etc.)
  onProgress({ status: 'preprocessing', progress: 0.2, message: 'Enhancing image contrast & clarity...' });
  const ocrText = await performInvoiceOcr(file, onProgress);
  onProgress({ status: 'parsing', progress: 0.95, message: 'Matching customer & line items...' });
  const parsed = extractInvoiceDataFromText(ocrText, masterCustomers, masterItems);
  onProgress({ status: 'done', progress: 1.0, message: 'Image OCR completed successfully!' });
  return parsed;
}

/**
 * Runs OCR on the provided file/image with real-time status callback
 */
export async function performInvoiceOcr(fileOrUrl, onProgress = () => {}) {
  try {
    onProgress({ status: 'preprocessing', progress: 0.15, message: 'Enhancing image clarity & contrast...' });
    
    let processedImg = fileOrUrl;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      processedImg = await preprocessImage(fileOrUrl);
    }
    
    onProgress({ status: 'initializing', progress: 0.35, message: 'Initializing Optical Character Recognition (OCR)...' });
    
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const p = 0.35 + (m.progress || 0) * 0.55;
          onProgress({ 
            status: 'recognizing', 
            progress: Math.min(0.92, p), 
            message: `Reading document text (${Math.round((m.progress || 0) * 100)}%)...` 
          });
        }
      }
    });
    
    const ret = await worker.recognize(processedImg);
    await worker.terminate();
    
    onProgress({ status: 'parsing', progress: 0.95, message: 'Extracting invoice data fields & line items...' });
    
    return ret.data.text;
  } catch (error) {
    console.error('OCR recognition error:', error);
    throw error;
  }
}

/**
 * Normalizes various date representations to YYYY-MM-DD
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  
  // Format DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (dmyMatch) {
    let day = dmyMatch[1].padStart(2, '0');
    let month = dmyMatch[2].padStart(2, '0');
    let year = dmyMatch[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  
  // Format YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
  }
  
  // Format DD Mon YYYY (e.g. 28 Aug 2026)
  const monthNames = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
  const textDateMatch = clean.match(/^(\d{1,2})\s+([a-zA-Z]{3,9})\s+(\d{2,4})$/);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const monthKey = textDateMatch[2].substring(0, 3).toLowerCase();
    const month = monthNames[monthKey] || '01';
    let year = textDateMatch[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  
  return clean;
}

/**
 * Intelligent Invoice and Document Extraction Engine
 * Parses raw OCR/Document text into complete Sri Durga Tax Invoice fields.
 */
export function extractInvoiceDataFromText(rawText, masterCustomers = [], masterItems = []) {
  if (!rawText || typeof rawText !== 'string') {
    return { extracted: {}, lineItems: [], rawText: '' };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const fullText = rawText;

  const result = {
    challanNumber: '',
    challanDate: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerPan: '',
    customerGstin: '',
    customerStateCode: '',
    poNumber: '',
    poDate: '',
    vendorCode: '',
    sacCode: '',
    contractNo: '',
    contractPeriod: '',
    bgNo: '',
    equipmentHeader: '',
    gstPercent: '18',
    lineItems: []
  };

  // 1. Extract GSTINs (15 characters)
  const gstinRegex = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/gi;
  const foundGstins = Array.from(fullText.matchAll(gstinRegex)).map(m => m[0].toUpperCase());
  const customerGstinCandidate = foundGstins.find(g => g !== SRI_DURGA_GSTIN);
  
  if (customerGstinCandidate) {
    result.customerGstin = customerGstinCandidate;
    result.customerPan = customerGstinCandidate.substring(2, 12);
    const statePrefix = customerGstinCandidate.substring(0, 2);
    if (STATE_CODE_MAP[statePrefix]) {
      result.customerStateCode = STATE_CODE_MAP[statePrefix];
    }
  }

  // 2. Extract PAN (10 characters: 5 letters, 4 digits, 1 letter)
  if (!result.customerPan) {
    const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
    const foundPans = Array.from(fullText.matchAll(panRegex)).map(m => m[0].toUpperCase());
    const customerPanCandidate = foundPans.find(p => p !== SRI_DURGA_PAN);
    if (customerPanCandidate) {
      result.customerPan = customerPanCandidate;
    }
  }

  // 3. Extract Tax Invoice Number / Challan Number
  const invoiceNoPatterns = [
    /(?:tax\s*invoice\s*(?:no|num|number|#)?|invoice\s*(?:no|num|number|#)?|challan\s*(?:no|num|number|#)?|bill\s*(?:no|num|number|#)?)[:.\s-]*([0-9A-Z/-]+)/i,
    /\b(\d{1,4}\/\d{2}-\d{2})\b/, // Indian FY format like 03/26-27 or 01/26-27
    /\b(?:INV|SDE|CHL)[/-][0-9A-Z/-]+/i
  ];
  
  for (const pat of invoiceNoPatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      const cand = m[1].trim().replace(/^[:\s-]+/, '');
      if (cand && !cand.toLowerCase().includes('date') && cand.length >= 2 && cand.length <= 25) {
        result.challanNumber = cand;
        break;
      }
    } else if (m && m[0] && pat.source.includes('FY')) {
      result.challanNumber = m[0].trim();
      break;
    }
  }

  // 4. Extract Invoice Date
  const datePatterns = [
    /(?:invoice\s*date|tax\s*invoice\s*date|bill\s*date|dated|date|dt)[:.\s-]*([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})/i,
    /(?:date|dt)[:.\s-]*([0-3]?\d\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
    /\b([0-3]?\d[\/.-][0-1]?\d[\/.-]20\d{2})\b/
  ];
  
  for (const pat of datePatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      const candDate = normalizeDate(m[1]);
      if (candDate && candDate.length === 10) {
        result.challanDate = candDate;
        break;
      }
    }
  }

  // 5. Extract P.O. Number / Ref
  const poPatterns = [
    /(?:p\.?o\.?\s*(?:no|num|number|ref)|purchase\s*order\s*(?:no|num|number|ref)?|po\s*#|order\s*no)[:.\s-]*([0-9A-Z/-]+)/i,
    /\b(?:PO|P\.O\.)\s*[:.\s-]*([0-9A-Z/-]+)/i,
    /\b5060\d{6}\b/,
    /\b\d{10}\b/
  ];
  
  for (const pat of poPatterns) {
    const m = fullText.match(pat);
    if (m) {
      const cand = (m[1] || m[0]).trim();
      if (cand && !cand.match(/^[6-9]\d{9}$/) && cand.length >= 4 && cand.length <= 30) {
        result.poNumber = cand;
        break;
      }
    }
  }

  // 6. Extract P.O. Date
  const poDatePatterns = [
    /(?:p\.?o\.?\s*date|po\s*dt|purchase\s*order\s*date|order\s*date)[:.\s-]*([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})/i
  ];
  for (const pat of poDatePatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      const candPoDate = normalizeDate(m[1]);
      if (candPoDate && candPoDate.length === 10) {
        result.poDate = candPoDate;
        break;
      }
    }
  }

  // 7. Extract Vendor Code
  const vendorPatterns = [
    /(?:vendor\s*code|vendor\s*no|vendor|supplier\s*code|supplier\s*no)[:.\s-]*([0-9A-Z]+)/i,
    /\b(?:840305|253540)\b/
  ];
  for (const pat of vendorPatterns) {
    const m = fullText.match(pat);
    if (m) {
      result.vendorCode = (m[1] || m[0]).trim();
      break;
    }
  }

  // 8. Extract SAC / HSN Code
  const sacPatterns = [
    /(?:sac\s*code|hsn\s*code|sac|hsn|hsn\/sac)[:.\s-]*([0-9]{4,8})/i,
    /\b(?:995469|995464|998719|998711|9954)\b/
  ];
  for (const pat of sacPatterns) {
    const m = fullText.match(pat);
    if (m) {
      result.sacCode = (m[1] || m[0]).trim();
      break;
    }
  }

  // 9. Extract Contract Number / Work Order Number
  const contractPatterns = [
    /(?:contract\s*(?:no|number)|agreement\s*(?:no|number)|work\s*order\s*(?:no|number)|wo\s*no)[:.\s-]*([0-9A-Z/-]+)/i,
    /\b9010038288\b/,
    /\b9010\d{6}\b/
  ];
  for (const pat of contractPatterns) {
    const m = fullText.match(pat);
    if (m) {
      result.contractNo = (m[1] || m[0]).trim();
      break;
    }
  }

  // 10. Extract Contract Period (C. Period)
  const periodPatterns = [
    /(?:contract\s*period|c\.\s*period|period)[:.\s-]*([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4}\s*to\s*[0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})/i,
    /([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4}\s*to\s*[0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})/i
  ];
  for (const pat of periodPatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      result.contractPeriod = m[1].trim();
      break;
    }
  }

  // 11. Extract B.G. Number & Validity (Bank Guarantee)
  const bgPatterns = [
    /(?:b\.?g\.?\s*(?:no|number)|bank\s*guarantee)[:.\s-]*([^\n\r]+)/i,
    /\b(8110IPE[A-Z0-9\s:.]+Validity\s*Upto\s*[:\s]*[0-9./-]+)/i,
    /\b(8110[A-Z0-9]+[^\n\r]+)/i
  ];
  for (const pat of bgPatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      result.bgNo = m[1].trim();
      break;
    }
  }

  // 12. Extract Equipment / Job Scope Header
  const equipPatterns = [
    /(?:equipment\s*\/?\s*job\s*scope\s*header|job\s*scope|equipment\s*header|equipment|vessel|subject)[:.\s-]*([^\n\r]+)/i,
    /(OSL\s+TIGER[^\n\r]+)/i,
    /(?:REPAIRING\s*&\s*FABRICATION\s*CHARGES[^\n\r]*)/i
  ];
  for (const pat of equipPatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      result.equipmentHeader = m[1].trim().replace(/^[:\s-]+/, '');
      break;
    }
  }

  // 13. Extract GST Percent (18, 12, 5, 28, 0)
  const gstRatePatterns = [
    /(?:gst\s*rate|applied\s*gst|igst|cgst\s*\+\s*sgst|gst)[:.\s-]*(\d{1,2})\s*%/i,
    /\b(18|12|5|28|0)\s*%\s*gst\b/i
  ];
  for (const pat of gstRatePatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      result.gstPercent = m[1].trim();
      break;
    }
  }

  // 14. Customer / Party Matching against Master Customers Catalog
  let matchedCustomerFromMaster = null;
  if (masterCustomers && masterCustomers.length > 0) {
    for (const cust of masterCustomers) {
      if (!cust || !cust.customerName) continue;
      const cNameClean = cust.customerName.toLowerCase().trim();
      
      if (result.customerGstin && cust.gstin && cust.gstin.toUpperCase().trim() === result.customerGstin) {
        matchedCustomerFromMaster = cust;
        break;
      }
      
      if (cNameClean.length > 4 && fullText.toLowerCase().includes(cNameClean)) {
        matchedCustomerFromMaster = cust;
        break;
      }
      
      const tokens = cNameClean.split(/[\s,./-]+/).filter(t => t.length >= 4 && !['ltd', 'pvt', 'm/s', 'private', 'limited'].includes(t));
      if (tokens.length >= 2 && tokens.every(tok => fullText.toLowerCase().includes(tok))) {
        matchedCustomerFromMaster = cust;
        break;
      }
    }
  }

  if (matchedCustomerFromMaster) {
    result.customerName = matchedCustomerFromMaster.customerName;
    if (!result.customerAddress && matchedCustomerFromMaster.address) {
      result.customerAddress = matchedCustomerFromMaster.address;
    }
    if (!result.customerPhone && matchedCustomerFromMaster.phone) {
      result.customerPhone = matchedCustomerFromMaster.phone;
    }
    if (!result.customerGstin && matchedCustomerFromMaster.gstin) {
      result.customerGstin = matchedCustomerFromMaster.gstin;
    }
    if (!result.customerPan && matchedCustomerFromMaster.pan) {
      result.customerPan = matchedCustomerFromMaster.pan;
    }
    if (!result.customerStateCode && matchedCustomerFromMaster.stateCode) {
      result.customerStateCode = matchedCustomerFromMaster.stateCode;
    }
  } else {
    const customerNamePatterns = [
      /(?:customer\s*\/?\s*party\s*name|customer\s*name|party\s*name|billed\s*to|bill\s*to|consignee|m\/s|messrs|to)[:.\s-]+([^\n\r]+)/i
    ];
    for (const pat of customerNamePatterns) {
      const m = fullText.match(pat);
      if (m && m[1]) {
        const cand = m[1].trim().replace(/^[:\s-]+/, '');
        if (cand.length >= 3 && !cand.toLowerCase().includes('sri durga') && !cand.toLowerCase().includes('tax invoice')) {
          result.customerName = cand;
          break;
        }
      }
    }
  }

  // 15. Extract Phone / Mobile
  if (!result.customerPhone) {
    const phoneMatch = fullText.match(/(?:phone|mobile|tel|mob|cell|contact)[:.\s-]*([+0-9\s-]{10,15})/i) ||
                       fullText.match(/\b([6-9]\d{9})\b/);
    if (phoneMatch && phoneMatch[1]) {
      result.customerPhone = phoneMatch[1].replace(/[^0-9+]/g, '').trim();
    }
  }

  // 16. Extract Customer Address (if not already fetched from master)
  if (!result.customerAddress) {
    const addrPattern = /(?:customer\s*address|address|addr|location)[:.\s-]+([^\n\r]+(?:\n[^\n\r]+)?)/i;
    const m = fullText.match(addrPattern);
    if (m && m[1]) {
      const cand = m[1].trim();
      if (cand.length >= 5 && !cand.toLowerCase().includes('sri durga')) {
        result.customerAddress = cand;
      }
    } else {
      const pinMatch = fullText.match(/([A-Za-z0-9\s,.-]+(?:-\s*\d{6}|\b\d{6}\b))/);
      if (pinMatch && pinMatch[1] && !pinMatch[1].toLowerCase().includes('sri durga')) {
        result.customerAddress = pinMatch[1].trim();
      }
    }
  }

  // 17. Intelligent Line Items Parsing
  const parsedItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/s\.?no|item\s*code|description|quantity|qty|unit|rate|amount|gross|sub\s*total|cgst|sgst|igst/i)) {
      continue;
    }
    
    let matchedMasterItem = null;
    if (masterItems && masterItems.length > 0) {
      matchedMasterItem = masterItems.find(mi => {
        if (!mi || !mi.itemCode) return false;
        const code = mi.itemCode.toUpperCase().trim();
        const lineUpper = line.toUpperCase();
        return lineUpper.includes(` ${code} `) || lineUpper.startsWith(`${code} `) || lineUpper.includes(`|${code}|`) || lineUpper.includes(`| ${code} |`);
      });
    }

    const numbersInLine = line.match(/\b\d+(?:\.\d{1,2})?\b/g);
    
    if (matchedMasterItem) {
      let qty = 1;
      if (numbersInLine && numbersInLine.length > 0) {
        const potentialQtys = numbersInLine.map(Number).filter(n => n > 0 && n <= 1000);
        if (potentialQtys.length > 0) {
          qty = potentialQtys[0];
        }
      }
      
      const rate = Number(matchedMasterItem.rate || 0);
      parsedItems.push({
        serialNumber: parsedItems.length + 1,
        itemCode: matchedMasterItem.itemCode,
        description: matchedMasterItem.description || line,
        quantity: qty,
        unit: matchedMasterItem.unit || 'No',
        rate: rate,
        amount: qty * rate,
        fetched: true
      });
    } else {
      const genericRowMatch = line.match(/^(\d{1,2})[.\s|]+([A-Za-z0-9\s/&,().-]+?)\s+(\d+(?:\.\d+)?)\s*([A-Za-z]+)?\s+(?:₹|Rs\.?)?\s*(\d+(?:\.\d+)?)(?:\s+(?:₹|Rs\.?)?\s*(\d+(?:\.\d+)?))?$/);
      
      if (genericRowMatch) {
        const sNo = parseInt(genericRowMatch[1], 10);
        const desc = genericRowMatch[2].trim();
        const qty = parseFloat(genericRowMatch[3]) || 1;
        const unit = genericRowMatch[4] || 'No';
        const rate = parseFloat(genericRowMatch[5]) || 0;
        const amount = genericRowMatch[6] ? parseFloat(genericRowMatch[6]) : (qty * rate);
        
        const itemByDesc = masterItems.find(mi => mi.description && desc.toLowerCase().includes(mi.description.toLowerCase().slice(0, 15)));
        
        parsedItems.push({
          serialNumber: sNo || (parsedItems.length + 1),
          itemCode: itemByDesc ? itemByDesc.itemCode : 'CUSTOM',
          description: desc,
          quantity: qty,
          unit: unit,
          rate: rate,
          amount: amount,
          fetched: !!itemByDesc
        });
      }
    }
  }

  if (parsedItems.length === 0) {
    if (result.equipmentHeader) {
      parsedItems.push({
        serialNumber: 1,
        itemCode: 'CUSTOM',
        description: result.equipmentHeader,
        quantity: 1,
        unit: 'Job',
        rate: 0,
        amount: 0,
        fetched: false
      });
    }
  }

  result.lineItems = parsedItems;

  return {
    extracted: result,
    lineItems: parsedItems,
    rawText: rawText
  };
}

/**
 * Universal Extraction for Work Completion Certificates (WCC)
 */
export async function processUniversalWccDocument(file, masterItems = [], onProgress = () => {}) {
  const fileName = (file.name || '').toLowerCase();
  
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    onProgress({ status: 'reading_excel', progress: 0.5, message: 'Reading Excel workbook & sheets...' });
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';
    workbook.SheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      fullText += XLSX.utils.sheet_to_csv(sheet) + '\n';
    });
    const parsed = extractWccDataFromText(fullText, masterItems);
    onProgress({ status: 'done', progress: 1.0, message: 'Excel WCC details extracted successfully!' });
    return parsed;
  }

  if (fileName.endsWith('.pdf')) {
    onProgress({ status: 'reading_pdf', progress: 0.3, message: 'Extracting PDF text content...' });
    const pdfText = await extractTextFromPdf(file, onProgress);
    const parsed = extractWccDataFromText(pdfText, masterItems);
    onProgress({ status: 'done', progress: 1.0, message: 'PDF WCC extracted successfully!' });
    return parsed;
  }

  if (fileName.endsWith('.json')) {
    const text = await file.text();
    const json = JSON.parse(text);
    return { extracted: json, items: json.items || [], rawText: text };
  }

  if (fileName.endsWith('.txt') || fileName.endsWith('.log')) {
    const text = await file.text();
    return extractWccDataFromText(text, masterItems);
  }

  // Image (PNG, JPG, etc.)
  onProgress({ status: 'preprocessing', progress: 0.2, message: 'Enhancing image contrast & clarity...' });
  const ocrText = await performInvoiceOcr(file, onProgress);
  const parsed = extractWccDataFromText(ocrText, masterItems);
  onProgress({ status: 'done', progress: 1.0, message: 'Certificate OCR completed successfully!' });
  return parsed;
}

export function extractWccDataFromText(rawText, masterItems = []) {
  if (!rawText) return { extracted: {}, items: [], rawText: '' };
  
  const fullText = rawText;
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const result = {
    certificateNo: '',
    certificateDate: '',
    agency: 'SRI DURGA ENTERPRISES, # 10 V.G. Nagar, Kovilpathu, Karaikal',
    rateContractRef: 'KKL/CAU-ASSET/SUPPORT/2023/1240914/SDE/9010038288',
    equipmentDescription: 'Material',
    equipment: '',
    location: 'RMD#GCS',
    make: '-',
    slNo: '-',
    capacity: '-',
    typeModel: '-',
    completionTime: '5 Day(s)',
    dateHandingOver: '',
    dateCompletion: '',
    delayInCompletion: 'NIL',
    performanceOfMachines: 'OK',
    defectiveSparesReturned: 'NA',
    items: []
  };

  // 1. Certificate No (e.g. WCC-01/26-27)
  const certNoMatch = fullText.match(/(?:certificate\s*(?:no|num|number|#)?|wcc\s*(?:no|num|number|#)?|cert\s*no)[:.\s-]*([0-9A-Z/-]+)/i) ||
                      fullText.match(/\b(WCC[-/0-9A-Z]+)\b/i);
  if (certNoMatch && certNoMatch[1]) {
    result.certificateNo = certNoMatch[1].trim();
  }

  // 2. Certificate Date
  const dateMatch = fullText.match(/(?:certificate\s*date|date\s*of\s*issue|dated|date|dt)[:.\s-]*([0-3]?\d[\/.-][0-1]?\d[\/.-]\d{2,4})/i) ||
                    fullText.match(/\b([0-3]?\d[\/.-][0-1]?\d[\/.-]20\d{2})\b/);
  if (dateMatch && dateMatch[1]) {
    result.certificateDate = normalizeDate(dateMatch[1]);
  }

  // 3. Rate Contract Ref
  const rcRefMatch = fullText.match(/(?:rate\s*contract\s*ref|contract\s*ref|rc\s*ref|agreement\s*ref)[:.\s-]*([^\n\r]+)/i) ||
                     fullText.match(/(KKL\/[^\n\r]+)/i);
  if (rcRefMatch && rcRefMatch[1]) {
    result.rateContractRef = rcRefMatch[1].trim();
  }

  // 4. Equipment & Requirement Details
  if (fullText.toLowerCase().includes('service') && !fullText.toLowerCase().includes('requirement details: material')) {
    result.equipmentDescription = 'Service';
  } else {
    result.equipmentDescription = 'Material';
  }

  const equipMatch = fullText.match(/(?:equipment|equipment\s*name|machine|vessel|subject)[:.\s-]*([^\n\r]+)/i);
  if (equipMatch && equipMatch[1]) {
    result.equipment = equipMatch[1].trim();
  }

  const locMatch = fullText.match(/(?:location|site|depot|station)[:.\s-]*([^\n\r]+)/i);
  if (locMatch && locMatch[1]) {
    result.location = locMatch[1].trim();
  }

  const makeMatch = fullText.match(/(?:make|manufacturer|brand)[:.\s-]*([^\n\r]+)/i);
  if (makeMatch && makeMatch[1]) {
    result.make = makeMatch[1].trim();
  }

  const slMatch = fullText.match(/(?:sl\.?\s*no|serial\s*no|equipment\s*sl)[:.\s-]*([^\n\r]+)/i);
  if (slMatch && slMatch[1]) {
    result.slNo = slMatch[1].trim();
  }

  const capMatch = fullText.match(/(?:capacity|rating)[:.\s-]*([^\n\r]+)/i);
  if (capMatch && capMatch[1]) {
    result.capacity = capMatch[1].trim();
  }

  const modelMatch = fullText.match(/(?:type\s*\/?\s*model|model|type)[:.\s-]*([^\n\r]+)/i);
  if (modelMatch && modelMatch[1]) {
    result.typeModel = modelMatch[1].trim();
  }

  // 5. Line items
  const items = [];
  for (const line of lines) {
    if (line.match(/sl\.?no|rc\s*item|description|quantity|qty|unit|action/i)) continue;

    let matchedItem = null;
    if (masterItems && masterItems.length > 0) {
      matchedItem = masterItems.find(mi => {
        if (!mi || !mi.itemCode) return false;
        const code = mi.itemCode.toUpperCase().trim();
        return line.toUpperCase().includes(code);
      });
    }

    if (matchedItem) {
      const numbers = line.match(/\b\d+(?:\.\d+)?\b/g);
      let qty = 1;
      if (numbers && numbers.length > 0) {
        const cands = numbers.map(Number).filter(n => n > 0 && n < 1000);
        if (cands.length > 0) qty = cands[0];
      }

      items.push({
        serialNumber: items.length + 1,
        rcItemNo: matchedItem.itemCode,
        description: matchedItem.description || line,
        quantity: qty,
        unit: matchedItem.unit || 'No.',
        itemType: result.equipmentDescription === 'Service' ? 'SERVICE' : 'MATERIAL'
      });
    }
  }

  if (items.length === 0 && result.equipment) {
    items.push({
      serialNumber: 1,
      rcItemNo: 'CUSTOM',
      description: result.equipment,
      quantity: 1,
      unit: 'No.',
      itemType: result.equipmentDescription === 'Service' ? 'SERVICE' : 'MATERIAL'
    });
  }

  result.items = items;
  return {
    extracted: result,
    items: items,
    rawText: rawText
  };
}
