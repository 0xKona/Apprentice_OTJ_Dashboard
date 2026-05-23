import * as XLSX from "xlsx";

export interface TrainingLogData {
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  activity: string;
  newLearning: string;
  impactOfLearning: string;
}

export interface ParseResult {
  success: boolean;
  totalRows: number;
  processedLogs: TrainingLogData[];
  errors: string[];
}

interface ColumnIndices {
  dateIdx: number;
  startTimeIdx: number;
  endTimeIdx: number;
  durationIdx: number;
  activityIdx: number;
  learningIdx: number;
  impactIdx: number;
}

/**
 * Checks if a row appears to be a valid data row with required columns
 */
function isValidDataRow(row: any[], indices: ColumnIndices): boolean {
  const { dateIdx, startTimeIdx, endTimeIdx, activityIdx, learningIdx, impactIdx } = indices;
  
  // Must have data in date column
  if (!row[dateIdx]) return false;
  
  // Check if date column looks like actual data (not header text)
  const dateValue = String(row[dateIdx]).trim().toLowerCase();
  if (dateValue === 'date' || dateValue === '' || dateValue.includes('apprenticeship')) return false;
  
  return true;
}

/**
 * Finds the header row in the Excel data by looking for a row containing "date"
 */
function findHeaderRow(jsonData: any[][]): number {
  console.log('[Excel Parser] Searching for header row in', jsonData.length, 'rows');
  
  for (let i = 0; i < Math.min(jsonData.length, 30); i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) {
      console.log(`[Excel Parser] Row ${i}: Empty row, skipping`);
      continue;
    }
    
    console.log(`[Excel Parser] Row ${i}:`, row.map(cell => String(cell).substring(0, 50)));
    
    // Look for header row with "Date" column
    const dateIndex = row.findIndex((cell) => {
      if (!cell) return false;
      const cellStr = String(cell).trim().toLowerCase();
      // Match "date" exactly or as part of a phrase (but not in words like "update")
      return cellStr === 'date' || /\bdate\b/.test(cellStr);
    });
    
    // If we found a Date column, check if this row has multiple headers
    if (dateIndex >= 0) {
      // Count non-empty cells in this row - headers typically have multiple columns
      const nonEmptyCells = row.filter((cell) => cell && String(cell).trim().length > 0).length;
      
      console.log(`[Excel Parser] Row ${i}: Found 'Date' at index ${dateIndex}, non-empty cells: ${nonEmptyCells}`);
      
      // If we have at least 3 non-empty cells in the row, it's likely a header
      if (nonEmptyCells >= 3) {
        console.log(`[Excel Parser] ✓ Header row found at index ${i}`);
        return i;
      }
    }
  }
  
  console.log('[Excel Parser] ✗ No header row found');
  return -1;
}

/**
 * Maps column headers to their indices
 */
function findColumnIndices(headers: string[]): ColumnIndices {
  return {
    dateIdx: headers.findIndex((h) => h.toLowerCase().includes("date")),
    startTimeIdx: headers.findIndex((h) =>
      h.toLowerCase().includes("start time")
    ),
    endTimeIdx: headers.findIndex((h) => h.toLowerCase().includes("end time")),
    durationIdx: headers.findIndex((h) =>
      h.toLowerCase().includes("duration")
    ),
    activityIdx: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("activity") ||
        h.toLowerCase().includes("what did you do")
    ),
    learningIdx: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("learning") ||
        h.toLowerCase().includes("knowledge")
    ),
    impactIdx: headers.findIndex(
      (h) =>
        h.toLowerCase().includes("impact") ||
        h.toLowerCase().includes("role")
    ),
  };
}

/**
 * Converts Excel date values to ISO date string (YYYY-MM-DD)
 * Supports multiple formats: Excel serial dates, ISO strings, common date formats
 */
function parseExcelDate(dateValue: any): string | null {
  // Handle empty or null values
  if (!dateValue) return null;

  // Handle Excel serial date numbers
  if (typeof dateValue === "number") {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
      date.d
    ).padStart(2, "0")}`;
  }

  const dateStr = String(dateValue).trim();
  if (!dateStr) return null;

  // Try parsing as-is first (handles ISO format, etc.)
  let parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split("T")[0];
  }

  // Try common date formats: DD/MM/YYYY, DD-MM-YYYY
  const ddmmyyyySlash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyySlash) {
    const [, day, month, year] = ddmmyyyySlash;
    parsedDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split("T")[0];
    }
  }

  const ddmmyyyyDash = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDash) {
    const [, day, month, year] = ddmmyyyyDash;
    parsedDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split("T")[0];
    }
  }

  // Try MM/DD/YYYY format
  const mmddyyyySlash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyySlash) {
    const [, month, day, year] = mmddyyyySlash;
    parsedDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split("T")[0];
    }
  }

  // Try DD.MM.YYYY format (common in Europe)
  const ddmmyyyyDot = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyDot) {
    const [, day, month, year] = ddmmyyyyDot;
    parsedDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split("T")[0];
    }
  }

  // Try YYYY-MM-DD format with various separators
  const yyyymmdd = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Converts Excel time values to HH:MM format
 * Excel stores times as decimal fractions of a day (0.5 = 12:00, 0.5625 = 13:30)
 */
function parseExcelTime(timeValue: any): string | null {
  if (!timeValue) return null;

  // If it's already a string in HH:MM format, return it
  if (typeof timeValue === "string") {
    const timeStr = timeValue.trim();
    if (/^\d{1,2}:\d{2}/.test(timeStr)) {
      return timeStr;
    }
  }

  // If it's a decimal number (Excel time format)
  if (typeof timeValue === "number") {
    // Convert decimal to hours and minutes
    const totalMinutes = Math.round(timeValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return null;
}

/**
 * Calculates duration in hours from start and end time strings
 */
function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  if (!isNaN(startH) && !isNaN(endH)) {
    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);
    return (endMinutes - startMinutes) / 60;
  }

  return 0;
}

/**
 * Processes a single row from the Excel sheet
 */
function processRow(
  row: any[],
  indices: ColumnIndices
): { log: TrainingLogData | null; error: string | null } {
  const { dateIdx, startTimeIdx, endTimeIdx, durationIdx, activityIdx, learningIdx, impactIdx } = indices;

  if (!row || row.length === 0 || !row[dateIdx]) {
    return { log: null, error: null }; // Skip empty rows silently
  }
  
  // Skip rows that aren't valid data rows
  if (!isValidDataRow(row, indices)) {
    return { log: null, error: null }; // Skip silently
  }

  try {
    // Parse date
    const dateStr = parseExcelDate(row[dateIdx]);
    if (!dateStr) {
      return { log: null, error: null }; // Skip rows with invalid dates silently
    }

    // Parse time fields
    const startTime = parseExcelTime(row[startTimeIdx]);
    const endTime = parseExcelTime(row[endTimeIdx]);
    const activity = String(row[activityIdx] || "").trim();
    const newLearning = String(row[learningIdx] || "").trim();
    const impactOfLearning = String(row[impactIdx] || "").trim();

    // Calculate or extract duration
    let durationHours = 0;
    if (durationIdx >= 0 && row[durationIdx]) {
      durationHours = parseFloat(String(row[durationIdx]));
    } else if (startTime && endTime) {
      durationHours = calculateDuration(startTime, endTime);
    }

    // Validate required fields
    if (
      !dateStr ||
      !startTime ||
      !endTime ||
      !activity ||
      !newLearning ||
      !impactOfLearning
    ) {
      // Only report error if it looks like a real data row with a date
      if (dateStr) {
        return {
          log: null,
          error: `Row with date ${dateStr}: Missing required fields`,
        };
      }
      return { log: null, error: null };
    }

    return {
      log: {
        date: dateStr,
        startTime,
        endTime,
        durationHours,
        activity,
        newLearning,
        impactOfLearning,
      },
      error: null,
    };
  } catch (rowError) {
    return {
      log: null,
      error: `Row error: ${
        rowError instanceof Error ? rowError.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Parses an Excel file and extracts training log data
 * @param fileBuffer The ArrayBuffer containing the Excel file data
 * @param sheetName Optional sheet name to parse. If empty, uses the first sheet
 * @returns ParseResult with processed logs and any errors encountered
 */
export async function parseExcelFile(
  fileBuffer: ArrayBuffer,
  sheetName?: string
): Promise<ParseResult> {
  try {
    console.log('[Excel Parser] Starting to parse Excel file');
    
    // Read Excel file
    const workbook = XLSX.read(fileBuffer, { type: "array" });
    console.log('[Excel Parser] Workbook loaded, sheets:', workbook.SheetNames);
    
    // Determine which sheet to use
    let targetSheetName: string;
    if (sheetName && sheetName.trim() !== "") {
      // Use specified sheet name (trim whitespace for matching)
      const inputSheetName = sheetName.trim();
      
      // Try exact match first
      if (workbook.SheetNames.includes(inputSheetName)) {
        targetSheetName = inputSheetName;
      } else {
        // Try case-insensitive match with trimmed sheet names
        const matchedSheet = workbook.SheetNames.find(
          (name) => name.trim().toLowerCase() === inputSheetName.toLowerCase()
        );
        
        if (matchedSheet) {
          targetSheetName = matchedSheet;
          console.log(`[Excel Parser] Matched sheet "${inputSheetName}" to "${matchedSheet}"`);
        } else {
          console.error('[Excel Parser] Sheet not found:', inputSheetName);
          return {
            success: false,
            totalRows: 0,
            processedLogs: [],
            errors: [`Sheet "${inputSheetName}" not found. Available sheets: ${workbook.SheetNames.join(", ")}`],
          };
        }
      }
    } else {
      // Use first sheet
      targetSheetName = workbook.SheetNames[0];
    }
    
    console.log('[Excel Parser] Using sheet:', targetSheetName);
    
    const worksheet = workbook.Sheets[targetSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    }) as any[][];
    
    console.log('[Excel Parser] Converted to JSON, total rows:', jsonData.length);

    // Find header row
    const headerRowIndex = findHeaderRow(jsonData);
    if (headerRowIndex === -1) {
      console.error('[Excel Parser] Failed to find header row');
      return {
        success: false,
        totalRows: 0,
        processedLogs: [],
        errors: ["Could not find header row with 'Date' column"],
      };
    }

    // Map column headers to indices
    const headers = jsonData[headerRowIndex].map((h) => String(h).trim());
    console.log('[Excel Parser] Headers found:', headers);
    
    const columnIndices = findColumnIndices(headers);
    console.log('[Excel Parser] Column indices:', columnIndices);

    // Process data rows
    const dataRows = jsonData.slice(headerRowIndex + 1);
    console.log('[Excel Parser] Processing', dataRows.length, 'data rows');
    
    const processedLogs: TrainingLogData[] = [];
    const errors: string[] = [];

    for (const row of dataRows) {
      const { log, error } = processRow(row, columnIndices);
      if (log) {
        processedLogs.push(log);
      }
      if (error) {
        errors.push(error);
      }
    }

    console.log('[Excel Parser] Processing complete:', {
      processedLogs: processedLogs.length,
      errors: errors.length,
      totalRows: dataRows.length
    });

    return {
      success: processedLogs.length > 0,
      totalRows: dataRows.length,
      processedLogs,
      errors,
    };
  } catch (error) {
    console.error('[Excel Parser] Fatal error:', error);
    return {
      success: false,
      totalRows: 0,
      processedLogs: [],
      errors: [
        `File parsing error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
    };
  }
}
