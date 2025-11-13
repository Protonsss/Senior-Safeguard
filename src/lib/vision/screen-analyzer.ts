/**
 * Screen Analyzer - REAL Computer Vision with OCR
 * Identifies applications by READING text on screen
 * Uses Tesseract.js OCR + color analysis + pattern matching
 */

import Tesseract from 'tesseract.js';
import { detectUIElements, type UIGuidance } from './ui-element-detector';

export interface ScreenAnalysis {
  application: string; // "Google Meet", "Zoom", "Gmail", etc.
  confidence: number; // 0-1
  details: string; // Detailed description
  participants?: number;
  uiElements: string[]; // Detected buttons/controls
  suggestedHelp: string[]; // What user might need help with
  detectedText?: string[]; // Text found on screen
  uiGuidance?: UIGuidance; // WHERE buttons are and HOW to use them
}

/**
 * Analyze a screenshot and identify the application
 */
export async function analyzeScreenshot(imageDataUrl: string): Promise<ScreenAnalysis> {
  try {
    console.log('[ScreenAnalyzer] Starting analysis...');
    
    // Extract base64 data
    const base64Data = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
    
    // Convert to blob for analysis
    const response = await fetch(`data:image/jpeg;base64,${base64Data}`);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    
    // Create canvas for analysis
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(imageBitmap.width, 1920); // Limit size for performance
    canvas.height = Math.min(imageBitmap.height, 1080);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');
    
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    console.log('[ScreenAnalyzer] Analyzing with OCR, colors, layout, and patterns...');
    
    // Run multiple detection methods IN PARALLEL
    const [ocrResult, colorAnalysis, layoutAnalysis, controlsDetected] = await Promise.all([
      performOCR(canvas), // REAL text reading!
      Promise.resolve(analyzeColors(imageData)),
      Promise.resolve(analyzeLayout(imageData)),
      Promise.resolve(detectVideoControls(imageData, ctx))
    ]);
    
    console.log('[ScreenAnalyzer] 📖 OCR found text:', ocrResult.text.slice(0, 200));
    console.log('[ScreenAnalyzer] 🎨 Color profile:', colorAnalysis);
    console.log('[ScreenAnalyzer] 📐 Layout:', layoutAnalysis);
    console.log('[ScreenAnalyzer] 🎮 Controls:', controlsDetected);
    
    // Combine all analyses to identify the application
    const analysis = identifyApplication({
      ocr: ocrResult,
      colors: colorAnalysis,
      layout: layoutAnalysis,
      controls: controlsDetected,
      dimensions: { width: canvas.width, height: canvas.height }
    });
    
    // NOW: Detect WHERE UI elements are and HOW to use them!
    console.log('[ScreenAnalyzer] 🔍 Detecting UI elements and their positions...');
    const uiGuidance = await detectUIElements(canvas, ocrResult.words, analysis.application);
    analysis.uiGuidance = uiGuidance;
    
    console.log('[ScreenAnalyzer] ✅ Found', uiGuidance.elements.length, 'UI elements');
    console.log('[ScreenAnalyzer] ✅ Final analysis:', analysis);
    return analysis;
    
  } catch (error) {
    console.error('[ScreenAnalyzer] ❌ Error:', error);
    return {
      application: 'Unknown Application',
      confidence: 0.3,
      details: 'I can see your screen but need a clearer view to identify the application.',
      uiElements: [],
      suggestedHelp: ['Make the window larger', 'Try sharing again']
    };
  }
}

interface OCRResult {
  text: string;
  words: string[];
  confidence: number;
}

interface ColorProfile {
  black: number;
  white: number;
  darkGray: number;
  teal: number;
  green: number;
  blue: number;
  red: number;
  total: number;
}

/**
 * Perform OCR on the canvas to READ text
 * This is REAL computer vision - actually reading what's on screen!
 */
async function performOCR(canvas: HTMLCanvasElement): Promise<OCRResult> {
  try {
    console.log('[OCR] Starting text recognition...');
    
    const { data } = await Tesseract.recognize(
      canvas,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    const words = data.text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2); // Filter out noise
    
    console.log(`[OCR] ✅ Found ${words.length} words. Confidence: ${data.confidence}%`);
    console.log(`[OCR] Sample: ${words.slice(0, 10).join(', ')}`);
    
    return {
      text: data.text.toLowerCase(),
      words,
      confidence: data.confidence / 100
    };
  } catch (error) {
    console.error('[OCR] ❌ Error:', error);
    return {
      text: '',
      words: [],
      confidence: 0
    };
  }
}

/**
 * Analyze dominant colors to identify apps by their theme
 */
function analyzeColors(imageData: ImageData): ColorProfile {
  const colors: ColorProfile = {
    black: 0,
    white: 0,
    darkGray: 0,
    teal: 0,
    green: 0,
    blue: 0,
    red: 0,
    total: 0
  };
  
  const data = imageData.data;
  const sampleRate = 20; // Sample every 20th pixel for speed
  
  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    colors.total++;
    
    // Categorize colors
    if (r > 220 && g > 220 && b > 220) {
      colors.white++;
    } else if (r < 40 && g < 40 && b < 40) {
      colors.black++;
    } else if (r < 80 && g < 80 && b < 80) {
      colors.darkGray++;
    } else if (g > r + 20 && g > b + 20 && g > 80) {
      colors.green++; // Google Meet green
      if (b > 100) colors.teal++; // Teal variant
    } else if (b > r + 30 && b > g + 30 && b > 100) {
      colors.blue++; // Zoom blue
    } else if (r > 180 && g < 100 && b < 100) {
      colors.red++; // End call button
    }
  }
  
  return colors;
}

interface LayoutInfo {
  hasGrid: boolean;
  gridSize: number;
  hasDarkBackground: boolean;
  hasControlBar: boolean;
  aspectRatio: number;
}

/**
 * Analyze layout to detect grid patterns (video call participants)
 */
function analyzeLayout(imageData: ImageData): LayoutInfo {
  const { width, height } = imageData;
  
  // Detect grid patterns by analyzing color boundaries
  const gridDetected = detectGridPattern(imageData);
  
  // Check for dark background (common in video calls)
  const darkPixels = countDarkPixels(imageData);
  const hasDarkBackground = darkPixels > (imageData.width * imageData.height * 0.3);
  
  // Check for control bar at bottom (common in video apps)
  const hasControlBar = detectBottomControlBar(imageData);
  
  return {
    hasGrid: gridDetected.detected,
    gridSize: gridDetected.count,
    hasDarkBackground,
    hasControlBar,
    aspectRatio: width / height
  };
}

function detectGridPattern(imageData: ImageData): { detected: boolean; count: number } {
  const { width, height, data } = imageData;
  
  // Look for vertical and horizontal divisions (borders between video tiles)
  let verticalBorders = 0;
  let horizontalBorders = 0;
  
  // Sample middle horizontal line for vertical borders
  const midY = Math.floor(height / 2);
  for (let x = 10; x < width - 10; x += 15) {
    const colorDiff = getColorDifference(data, midY * width + x, midY * width + x + 1);
    if (colorDiff > 100) verticalBorders++;
  }
  
  // Sample middle vertical line for horizontal borders
  const midX = Math.floor(width / 2);
  for (let y = 10; y < height - 10; y += 15) {
    const colorDiff = getColorDifference(data, y * width + midX, (y + 1) * width + midX);
    if (colorDiff > 100) horizontalBorders++;
  }
  
  // If we have multiple borders, it's likely a grid
  const hasGrid = verticalBorders >= 2 && horizontalBorders >= 2;
  
  // Estimate grid size (rough calculation)
  let gridSize = 0;
  if (hasGrid) {
    const cols = Math.min(verticalBorders + 1, 4); // Max 4 cols
    const rows = Math.min(horizontalBorders + 1, 4); // Max 4 rows
    gridSize = cols * rows;
  }
  
  return { detected: hasGrid, count: gridSize };
}

function countDarkPixels(imageData: ImageData): number {
  const data = imageData.data;
  let darkCount = 0;
  const sampleRate = 20;
  
  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (r < 50 && g < 50 && b < 50) {
      darkCount++;
    }
  }
  
  return darkCount * sampleRate;
}

function detectBottomControlBar(imageData: ImageData): boolean {
  const { width, height, data } = imageData;
  
  // Check bottom 10% of image for control bar patterns
  const bottomStart = Math.floor(height * 0.9);
  const bottomHeight = height - bottomStart;
  
  let darkPixels = 0;
  let coloredPixels = 0;
  
  for (let y = bottomStart; y < height; y += 5) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r < 70 && g < 70 && b < 70) {
        darkPixels++;
      }
      if (r > 150 || g > 150 || b > 150) {
        coloredPixels++;
      }
    }
  }
  
  // Control bar typically has dark background with some colored buttons
  return darkPixels > 100 && coloredPixels > 10;
}

function getColorDifference(data: Uint8ClampedArray, idx1: number, idx2: number): number {
  const r1 = data[idx1 * 4];
  const g1 = data[idx1 * 4 + 1];
  const b1 = data[idx1 * 4 + 2];
  
  const r2 = data[idx2 * 4];
  const g2 = data[idx2 * 4 + 1];
  const b2 = data[idx2 * 4 + 2];
  
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

/**
 * Detect video control buttons (mic, camera, hang up)
 */
function detectVideoControls(imageData: ImageData, ctx: CanvasRenderingContext2D): string[] {
  const controls: string[] = [];
  const { width, height } = imageData;
  
  // Check bottom 15% for controls
  const bottomStart = Math.floor(height * 0.85);
  const bottomRegion = ctx.getImageData(0, bottomStart, width, height - bottomStart);
  
  // Detect red button (hang up / leave call)
  if (hasRedButton(bottomRegion)) {
    controls.push('LEAVE_CALL');
  }
  
  // Detect common control patterns
  if (hasDarkControlBar(bottomRegion)) {
    controls.push('MICROPHONE');
    controls.push('CAMERA');
    controls.push('SHARE_SCREEN');
  }
  
  return controls;
}

function hasRedButton(imageData: ImageData): boolean {
  const data = imageData.data;
  let redPixels = 0;
  
  for (let i = 0; i < data.length; i += 4 * 10) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Detect bright red pixels
    if (r > 180 && g < 100 && b < 100) {
      redPixels++;
    }
  }
  
  // If we have concentrated red pixels, likely a red button
  return redPixels > 20;
}

function hasDarkControlBar(imageData: ImageData): boolean {
  const data = imageData.data;
  let darkPixels = 0;
  const total = imageData.width * imageData.height;
  
  for (let i = 0; i < data.length; i += 4 * 10) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (r < 70 && g < 70 && b < 70) {
      darkPixels++;
    }
  }
  
  return (darkPixels * 10) / total > 0.5; // More than 50% dark
}

/**
 * Combine all analyses to identify the application
 * NOW WITH REAL OCR - We can READ what's on screen!
 */
function identifyApplication(data: {
  ocr: OCRResult;
  colors: ColorProfile;
  layout: LayoutInfo;
  controls: string[];
  dimensions: { width: number; height: number };
}): ScreenAnalysis {
  const { ocr, colors, layout, controls, dimensions } = data;
  
  console.log('[Identification] 📖 OCR words:', ocr.words.slice(0, 15));
  console.log('[Identification] 📐 Grid:', layout.hasGrid, 'Size:', layout.gridSize);
  console.log('[Identification] 🎨 Dark BG:', layout.hasDarkBackground);
  console.log('[Identification] 🎮 Controls:', controls);
  
  // GOOGLE MEET DETECTION - Now with REAL text reading!
  const hasGoogleMeetText = ocr.words.some(w => 
    w.includes('meet') || w.includes('google') || w.includes('present') || w.includes('captions')
  );
  const hasMeetButtons = ocr.words.some(w => 
    w === 'mute' || w === 'unmute' || w === 'camera' || w === 'leave' || w === 'hand'
  );
  const hasGrid = layout.hasGrid && layout.gridSize >= 4;
  const hasVideoControls = controls.length > 0;
  
  if (hasGoogleMeetText || (hasMeetButtons && hasGrid && layout.hasDarkBackground)) {
    const participantCount = layout.gridSize || estimateParticipantsFromText(ocr.text);
    
    return {
      application: 'Google Meet',
      confidence: hasGoogleMeetText ? 0.95 : 0.85,
      details: `You are in a Google Meet video call${participantCount ? ` with approximately ${participantCount} participants` : ''}.`,
      participants: participantCount,
      uiElements: controls,
      detectedText: ocr.words.filter(w => w.length > 3).slice(0, 10),
      suggestedHelp: [
        'mute or unmute your microphone',
        'turn your camera on or off',
        'leave the call',
        'share your screen'
      ]
    };
  }
  
  // ZOOM DETECTION - Now with REAL text reading!
  const hasZoomText = ocr.words.some(w => 
    w.includes('zoom') || w.includes('meeting') || w.includes('participants')
  );
  const hasZoomButtons = ocr.words.some(w => 
    w === 'mute' || w === 'video' || w === 'security' || w === 'record'
  );
  
  if (hasZoomText || (hasZoomButtons && hasGrid && layout.hasDarkBackground)) {
    const participantCount = layout.gridSize || estimateParticipantsFromText(ocr.text);
    
    return {
      application: 'Zoom',
      confidence: hasZoomText ? 0.95 : 0.85,
      details: `You are in a Zoom video meeting${participantCount ? ` with approximately ${participantCount} participants` : ''}.`,
      participants: participantCount,
      uiElements: controls,
      detectedText: ocr.words.filter(w => w.length > 3).slice(0, 10),
      suggestedHelp: [
        'mute or unmute',
        'start or stop your video',
        'view the participants list',
        'share your screen',
        'leave the meeting'
      ]
    };
  }
  
  // GENERIC VIDEO CALL
  if (hasGrid && layout.hasDarkBackground) {
    return {
      application: 'a video call',
      confidence: 0.8,
      details: `You are in a video call with ${layout.gridSize || 'multiple'} participants.`,
      participants: layout.gridSize,
      uiElements: controls,
      suggestedHelp: [
        'control your microphone',
        'control your camera',
        'leave the call'
      ]
    };
  }
  
  // GMAIL DETECTION - Now with REAL text reading!
  const hasGmailText = ocr.words.some(w => 
    w.includes('gmail') || w.includes('inbox') || w.includes('compose') || w.includes('starred')
  );
  const hasEmailWords = ocr.words.some(w => 
    w === 'sent' || w === 'drafts' || w === 'spam' || w === 'trash'
  );
  const hasWhiteBackground = colors.white / colors.total > 0.4;
  
  if (hasGmailText || (hasEmailWords && hasWhiteBackground && !layout.hasGrid)) {
    return {
      application: 'Gmail',
      confidence: hasGmailText ? 0.95 : 0.8,
      details: 'You are looking at your Gmail inbox.',
      uiElements: ['Compose', 'Inbox', 'Search'],
      detectedText: ocr.words.filter(w => w.length > 3).slice(0, 10),
      suggestedHelp: [
        'read your emails',
        'compose a new email',
        'search for messages'
      ]
    };
  }
  
  // WEB BROWSER (Generic)
  if (hasWhiteBackground && !layout.hasGrid) {
    return {
      application: 'a web browser',
      confidence: 0.6,
      details: 'You are looking at a web page.',
      uiElements: [],
      suggestedHelp: [
        'navigate the page',
        'go back to the previous page',
        'search for something'
      ]
    };
  }
  
  // FALLBACK - Include OCR data for debugging
  return {
    application: 'an application',
    confidence: 0.4,
    details: ocr.words.length > 0 
      ? `I can see your screen with text: "${ocr.words.slice(0, 5).join(', ')}..."` 
      : 'I can see your screen but cannot clearly identify the application.',
    uiElements: [],
    detectedText: ocr.words.slice(0, 10),
    suggestedHelp: [
      'make sure the window is fully visible',
      'try sharing the screen again'
    ]
  };
}

/**
 * Try to estimate participant count from OCR text
 */
function estimateParticipantsFromText(text: string): number | undefined {
  // Look for patterns like "9 participants", "12 people", etc.
  const match = text.match(/(\d+)\s*(participant|people|person|user)/i);
  if (match) {
    return parseInt(match[1]);
  }
  return undefined;
}
