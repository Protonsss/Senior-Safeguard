/**
 * UI Element Detector
 * Finds specific buttons, links, and UI elements with their positions
 * Helps seniors know WHERE to click
 */

export interface UIElement {
  type: 'button' | 'link' | 'input' | 'icon';
  label: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center' | 'left' | 'right';
  coordinates?: { x: number; y: number; width: number; height: number };
  color?: string;
  confidence: number;
}

export interface UIGuidance {
  elements: UIElement[];
  primaryAction?: string; // Main thing user should do
  instructions: string[]; // Step-by-step guide
}

/**
 * Detect UI elements and their positions - UNIVERSAL DETECTOR
 * Works on ANY screen, ANY application, ANY website
 */
export async function detectUIElements(
  canvas: HTMLCanvasElement,
  ocrWords: string[],
  application: string
): Promise<UIGuidance> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  console.log('[UIDetector] 🔍 Analyzing ALL UI elements on screen...');
  console.log('[UIDetector] OCR found', ocrWords.length, 'words');
  
  // STEP 1: Detect ALL clickable elements (buttons, links, etc.)
  const clickableElements = detectAllClickableElements(imageData, ocrWords, canvas);
  
  // STEP 2: Detect ALL input fields
  const inputElements = detectAllInputFields(imageData, ocrWords);
  
  // STEP 3: Detect ALL icons and visual elements
  const visualElements = detectAllVisualElements(imageData, canvas);
  
  // STEP 4: Combine everything
  const allElements = [...clickableElements, ...inputElements, ...visualElements];
  
  console.log('[UIDetector] ✅ Found', allElements.length, 'total UI elements');
  
  // STEP 5: Add app-specific context if available
  const appSpecificGuidance = getAppSpecificContext(application, allElements);
  
  // STEP 6: Generate intelligent instructions
  const instructions = generateInstructions(allElements, application, ocrWords);
  
  return {
    elements: allElements,
    primaryAction: appSpecificGuidance.primaryAction,
    instructions
  };
}

/**
 * Google Meet UI Elements
 */
function detectGoogleMeetElements(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  ocrWords: string[]
): UIGuidance {
  const elements: UIElement[] = [];
  const { width, height } = canvas;

  // Microphone button - usually bottom center-left
  if (ocrWords.some(w => w.includes('mute') || w.includes('mic'))) {
    elements.push({
      type: 'button',
      label: 'Microphone (Mute/Unmute)',
      position: 'bottom-left',
      color: 'Usually a circle with a microphone icon',
      confidence: 0.9
    });
  }

  // Camera button - usually bottom center
  if (ocrWords.some(w => w.includes('camera') || w.includes('video'))) {
    elements.push({
      type: 'button',
      label: 'Camera (Turn On/Off)',
      position: 'bottom-center',
      color: 'Circle next to the microphone button',
      confidence: 0.9
    });
  }

  // Leave/End call button - red, bottom right or bottom center
  const hasLeaveButton = ocrWords.some(w => w.includes('leave') || w.includes('end'));
  if (hasLeaveButton || hasRedButton(imageData)) {
    elements.push({
      type: 'button',
      label: 'Leave Call (Red Phone Icon)',
      position: 'bottom-right',
      color: 'RED button - be careful!',
      confidence: 0.95
    });
  }

  // Present/Share screen button
  if (ocrWords.some(w => w.includes('present') || w.includes('share'))) {
    elements.push({
      type: 'button',
      label: 'Present/Share Screen',
      position: 'bottom-center',
      color: 'Button in the bottom toolbar',
      confidence: 0.85
    });
  }

  // Captions button
  if (ocrWords.some(w => w.includes('caption'))) {
    elements.push({
      type: 'button',
      label: 'Turn On Captions',
      position: 'bottom-center',
      confidence: 0.8
    });
  }

  // More options (three dots)
  elements.push({
    type: 'button',
    label: 'More Options (Three Dots)',
    position: 'bottom-right',
    color: 'Three vertical dots icon',
    confidence: 0.7
  });

  return {
    elements,
    primaryAction: 'control your microphone and camera',
    instructions: [
      'Look at the BOTTOM of your screen',
      'The microphone button is on the LEFT side of the bottom bar',
      'Click it once to mute, click again to unmute',
      'The camera button is RIGHT NEXT to the microphone',
      'The RED phone button on the RIGHT will end the call'
    ]
  };
}

/**
 * Zoom UI Elements
 */
function detectZoomElements(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  ocrWords: string[]
): UIGuidance {
  const elements: UIElement[] = [];

  // Mute button - bottom left
  if (ocrWords.some(w => w.includes('mute') || w.includes('unmute'))) {
    elements.push({
      type: 'button',
      label: 'Mute/Unmute Microphone',
      position: 'bottom-left',
      color: 'Microphone icon, turns red when muted',
      confidence: 0.9
    });
  }

  // Video button
  if (ocrWords.some(w => w.includes('video') || w.includes('camera'))) {
    elements.push({
      type: 'button',
      label: 'Start/Stop Video',
      position: 'bottom-left',
      color: 'Camera icon, next to mute button',
      confidence: 0.9
    });
  }

  // Security button (Zoom specific)
  if (ocrWords.some(w => w.includes('security'))) {
    elements.push({
      type: 'button',
      label: 'Security Settings',
      position: 'bottom-center',
      color: 'Shield icon',
      confidence: 0.85
    });
  }

  // Participants button
  if (ocrWords.some(w => w.includes('participant'))) {
    elements.push({
      type: 'button',
      label: 'View Participants',
      position: 'bottom-center',
      color: 'People icon',
      confidence: 0.85
    });
  }

  // Share screen
  if (ocrWords.some(w => w.includes('share'))) {
    elements.push({
      type: 'button',
      label: 'Share Screen',
      position: 'bottom-center',
      color: 'Green arrow icon',
      confidence: 0.85
    });
  }

  // Leave button
  if (ocrWords.some(w => w.includes('leave') || w.includes('end')) || hasRedButton(imageData)) {
    elements.push({
      type: 'button',
      label: 'Leave Meeting',
      position: 'bottom-right',
      color: 'RED button - will end your meeting',
      confidence: 0.95
    });
  }

  return {
    elements,
    primaryAction: 'control your audio and video',
    instructions: [
      'Look at the BOTTOM of the screen',
      'The microphone button is on the FAR LEFT',
      'The video camera button is RIGHT NEXT to it',
      'To leave, click the RED "Leave" button on the FAR RIGHT',
      'The green "Share Screen" button is in the middle'
    ]
  };
}

/**
 * Gmail UI Elements
 */
function detectGmailElements(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  ocrWords: string[]
): UIGuidance {
  const elements: UIElement[] = [];

  // Compose button - usually top-left, often blue or red
  if (ocrWords.some(w => w.includes('compose'))) {
    elements.push({
      type: 'button',
      label: 'Compose New Email',
      position: 'top-left',
      color: 'Usually a blue or multicolor button',
      confidence: 0.9
    });
  }

  // Search bar - top center
  if (ocrWords.some(w => w.includes('search'))) {
    elements.push({
      type: 'input',
      label: 'Search Your Emails',
      position: 'top-center',
      confidence: 0.85
    });
  }

  // Inbox - left sidebar
  elements.push({
    type: 'link',
    label: 'Inbox',
    position: 'left',
    confidence: 0.8
  });

  // Sent mail
  if (ocrWords.some(w => w.includes('sent'))) {
    elements.push({
      type: 'link',
      label: 'Sent Mail',
      position: 'left',
      confidence: 0.75
    });
  }

  return {
    elements,
    primaryAction: 'read and send emails',
    instructions: [
      'Your emails are listed in the CENTER of the screen',
      'To write a new email, click "Compose" in the TOP LEFT corner',
      'To search, click the search bar at the TOP',
      'Your folders (Inbox, Sent, etc.) are on the LEFT side'
    ]
  };
}

/**
 * Amazon UI Elements
 */
function detectAmazonElements(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  ocrWords: string[]
): UIGuidance {
  const elements: UIElement[] = [];

  // Search bar - top center (most important for shopping!)
  if (ocrWords.some(w => w.includes('search') || w.includes('deliver'))) {
    elements.push({
      type: 'input',
      label: 'Search for Products',
      position: 'top-center',
      color: 'White search box with orange button',
      confidence: 0.9
    });
  }

  // Cart - top right
  if (ocrWords.some(w => w.includes('cart'))) {
    elements.push({
      type: 'button',
      label: 'Shopping Cart',
      position: 'top-right',
      color: 'Cart icon with number showing items',
      confidence: 0.9
    });
  }

  // Add to cart button - usually orange/yellow
  if (ocrWords.some(w => w.includes('add') && w.includes('cart'))) {
    elements.push({
      type: 'button',
      label: 'Add to Cart',
      position: 'right',
      color: 'YELLOW/ORANGE button',
      confidence: 0.85
    });
  }

  // Buy now button
  if (ocrWords.some(w => w.includes('buy') || w.includes('checkout'))) {
    elements.push({
      type: 'button',
      label: 'Buy Now / Proceed to Checkout',
      position: 'right',
      color: 'ORANGE button',
      confidence: 0.85
    });
  }

  // Account menu - top right
  elements.push({
    type: 'button',
    label: 'Your Account',
    position: 'top-right',
    confidence: 0.75
  });

  return {
    elements,
    primaryAction: 'search and shop for products',
    instructions: [
      'To search for something, use the BIG SEARCH BAR at the TOP',
      'Type what you want and press Enter or click the orange button',
      'To see your cart, click the CART ICON in the TOP RIGHT corner',
      'To buy something, click the YELLOW "Add to Cart" button',
      'Then click "Proceed to Checkout" (orange button)'
    ]
  };
}

/**
 * Walmart UI Elements
 */
function detectWalmartElements(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  ocrWords: string[]
): UIGuidance {
  const elements: UIElement[] = [];

  // Search bar
  if (ocrWords.some(w => w.includes('search'))) {
    elements.push({
      type: 'input',
      label: 'Search Products',
      position: 'top-center',
      color: 'White search bar',
      confidence: 0.9
    });
  }

  // Cart
  if (ocrWords.some(w => w.includes('cart'))) {
    elements.push({
      type: 'button',
      label: 'Your Cart',
      position: 'top-right',
      confidence: 0.9
    });
  }

  // Add to cart
  if (ocrWords.some(w => w.includes('add'))) {
    elements.push({
      type: 'button',
      label: 'Add to Cart',
      position: 'right',
      color: 'BLUE button',
      confidence: 0.85
    });
  }

  return {
    elements,
    primaryAction: 'search and shop',
    instructions: [
      'Use the SEARCH BAR at the TOP to find products',
      'The shopping CART is in the TOP RIGHT corner',
      'Click the BLUE "Add to Cart" button to add items',
      'Click your cart to check out'
    ]
  };
}

/**
 * UNIVERSAL: Detect ALL clickable elements (buttons, links)
 */
function detectAllClickableElements(
  imageData: ImageData,
  ocrWords: string[],
  canvas: HTMLCanvasElement
): UIElement[] {
  const elements: UIElement[] = [];
  
  // Common button keywords - expanded list
  const buttonKeywords = [
    // Actions
    'click', 'tap', 'press', 'submit', 'send', 'post', 'save', 'delete', 'remove',
    'add', 'create', 'new', 'edit', 'update', 'cancel', 'close', 'exit', 'quit',
    'open', 'view', 'show', 'hide', 'play', 'pause', 'stop', 'record', 'upload',
    'download', 'share', 'copy', 'paste', 'cut', 'undo', 'redo', 'refresh',
    
    // Navigation
    'next', 'previous', 'back', 'forward', 'home', 'menu', 'more', 'options',
    'settings', 'help', 'about', 'contact', 'login', 'logout', 'signin', 'signup',
    'register', 'join', 'subscribe', 'unsubscribe',
    
    // Shopping
    'buy', 'purchase', 'checkout', 'cart', 'basket', 'shop', 'order', 'pay',
    'price', 'checkout', 'proceed', 'confirm', 'place',
    
    // Communication
    'call', 'message', 'chat', 'email', 'mail', 'reply', 'forward', 'compose',
    'mute', 'unmute', 'video', 'audio', 'camera', 'mic', 'microphone', 'speaker',
    'volume', 'leave', 'end', 'hang', 'answer', 'decline', 'accept', 'reject',
    
    // Social
    'like', 'follow', 'comment', 'react', 'post', 'tweet', 'retweet', 'favorite',
    
    // Media
    'play', 'pause', 'skip', 'rewind', 'fast', 'fullscreen', 'caption', 'subtitle',
    
    // General
    'ok', 'yes', 'no', 'agree', 'disagree', 'continue', 'skip', 'done', 'finish',
    'start', 'begin', 'learn', 'read', 'watch', 'listen', 'browse', 'search',
    'filter', 'sort', 'select', 'choose', 'pick'
  ];
  
  // Detect buttons by OCR text
  ocrWords.forEach(word => {
    if (buttonKeywords.some(keyword => word.includes(keyword) || keyword.includes(word))) {
      const position = guessPosition(word, ocrWords, canvas);
      const color = guessColor(word);
      
      elements.push({
        type: 'button',
        label: capitalizeWords(word),
        position,
        color: color || `Button with text "${word}"`,
        confidence: 0.75
      });
    }
  });
  
  // Detect links by common link words
  const linkWords = ['learn', 'more', 'info', 'help', 'terms', 'privacy', 'policy', 
                     'about', 'contact', 'support', 'faq', 'guide', 'tutorial'];
  
  ocrWords.forEach(word => {
    if (linkWords.some(link => word.includes(link))) {
      elements.push({
        type: 'link',
        label: capitalizeWords(word),
        position: guessPosition(word, ocrWords, canvas),
        confidence: 0.6
      });
    }
  });
  
  return elements;
}

/**
 * Detect ALL input fields (text boxes, search bars, etc.)
 */
function detectAllInputFields(imageData: ImageData, ocrWords: string[]): UIElement[] {
  const elements: UIElement[] = [];
  
  // Input field keywords
  const inputKeywords = [
    'search', 'find', 'type', 'enter', 'input', 'text', 'email', 'password',
    'username', 'name', 'address', 'phone', 'number', 'message', 'comment',
    'description', 'title', 'subject', 'body', 'query', 'keyword'
  ];
  
  ocrWords.forEach(word => {
    if (inputKeywords.some(keyword => word.includes(keyword))) {
      elements.push({
        type: 'input',
        label: `${capitalizeWords(word)} field`,
        position: word.includes('search') ? 'top-center' : 'center',
        color: 'Text input box',
        confidence: 0.7
      });
    }
  });
  
  return elements;
}

/**
 * Detect visual elements (icons, colored buttons, etc.)
 */
function detectAllVisualElements(imageData: ImageData, canvas: HTMLCanvasElement): UIElement[] {
  const elements: UIElement[] = [];
  const { width, height } = canvas;
  
  // Detect red buttons (usually dangerous actions)
  if (hasColorButton(imageData, 'red')) {
    elements.push({
      type: 'button',
      label: 'Warning/End Action',
      position: 'bottom-right',
      color: 'RED button - usually ends something or deletes',
      confidence: 0.8
    });
  }
  
  // Detect orange/yellow buttons (usually primary actions)
  if (hasColorButton(imageData, 'orange')) {
    elements.push({
      type: 'button',
      label: 'Primary Action',
      position: 'right',
      color: 'ORANGE/YELLOW button - usually the main action',
      confidence: 0.75
    });
  }
  
  // Detect blue buttons (usually secondary actions)
  if (hasColorButton(imageData, 'blue')) {
    elements.push({
      type: 'button',
      label: 'Action Button',
      position: 'center',
      color: 'BLUE button',
      confidence: 0.7
    });
  }
  
  // Detect green buttons (usually confirm/positive actions)
  if (hasColorButton(imageData, 'green')) {
    elements.push({
      type: 'button',
      label: 'Confirm/Positive Action',
      position: 'center',
      color: 'GREEN button - usually confirms something',
      confidence: 0.75
    });
  }
  
  return elements;
}

/**
 * Get app-specific context
 */
function getAppSpecificContext(application: string, elements: UIElement[]): { primaryAction?: string } {
  if (application.includes('Meet') || application.includes('Zoom')) {
    return { primaryAction: 'control your microphone and camera' };
  } else if (application.includes('mail') || application.includes('Mail')) {
    return { primaryAction: 'read and write emails' };
  } else if (application.includes('Amazon') || application.includes('Walmart') || application.includes('shop')) {
    return { primaryAction: 'search and shop for products' };
  } else if (elements.some(e => e.label.toLowerCase().includes('cart'))) {
    return { primaryAction: 'shop and checkout' };
  } else if (elements.some(e => e.label.toLowerCase().includes('video') || e.label.toLowerCase().includes('camera'))) {
    return { primaryAction: 'use video features' };
  } else {
    return {};
  }
}

/**
 * Generate intelligent instructions based on ALL detected elements
 */
function generateInstructions(
  elements: UIElement[],
  application: string,
  ocrWords: string[]
): string[] {
  const instructions: string[] = [];
  
  // Group elements by position
  const topElements = elements.filter(e => e.position.startsWith('top'));
  const bottomElements = elements.filter(e => e.position.startsWith('bottom'));
  const leftElements = elements.filter(e => e.position === 'left');
  const rightElements = elements.filter(e => e.position === 'right' || e.position.endsWith('right'));
  const centerElements = elements.filter(e => e.position === 'center');
  
  // Build instructions based on what we found
  if (topElements.length > 0) {
    const topLabels = topElements.slice(0, 3).map(e => e.label).join(', ');
    instructions.push(`At the TOP of the screen, you'll find: ${topLabels}`);
  }
  
  if (bottomElements.length > 0) {
    const bottomLabels = bottomElements.slice(0, 3).map(e => e.label).join(', ');
    instructions.push(`At the BOTTOM of the screen: ${bottomLabels}`);
  }
  
  if (leftElements.length > 0) {
    const leftLabels = leftElements.slice(0, 2).map(e => e.label).join(', ');
    instructions.push(`On the LEFT side: ${leftLabels}`);
  }
  
  if (rightElements.length > 0) {
    const rightLabels = rightElements.slice(0, 2).map(e => e.label).join(', ');
    instructions.push(`On the RIGHT side: ${rightLabels}`);
  }
  
  // Add color-coded warnings
  const redButtons = elements.filter(e => e.color?.includes('RED'));
  if (redButtons.length > 0) {
    instructions.push(`⚠️ RED buttons usually end something or delete - click carefully!`);
  }
  
  const orangeButtons = elements.filter(e => e.color?.includes('ORANGE') || e.color?.includes('YELLOW'));
  if (orangeButtons.length > 0) {
    instructions.push(`ORANGE/YELLOW buttons are usually the main action you want to take`);
  }
  
  // Fallback if no specific instructions
  if (instructions.length === 0) {
    instructions.push(
      'I can see buttons and controls on this screen',
      'Let me know what you want to do and I can guide you to the right button'
    );
  }
  
  return instructions.slice(0, 5); // Limit to 5 instructions
}

/**
 * Guess position based on OCR word context
 */
function guessPosition(word: string, allWords: string[], canvas: HTMLCanvasElement): UIElement['position'] {
  // Top indicators
  if (['search', 'menu', 'home', 'logo', 'sign', 'login', 'cart'].some(k => word.includes(k))) {
    if (word.includes('cart')) return 'top-right';
    if (word.includes('search')) return 'top-center';
    return 'top-left';
  }
  
  // Bottom indicators
  if (['leave', 'end', 'close', 'cancel', 'mute', 'video', 'camera', 'mic'].some(k => word.includes(k))) {
    if (word.includes('leave') || word.includes('end')) return 'bottom-right';
    if (word.includes('mute') || word.includes('mic')) return 'bottom-left';
    return 'bottom-center';
  }
  
  // Right side indicators
  if (['buy', 'add', 'cart', 'checkout', 'next', 'submit'].some(k => word.includes(k))) {
    return 'right';
  }
  
  // Default
  return 'center';
}

/**
 * Guess color based on keyword
 */
function guessColor(word: string): string | undefined {
  if (['leave', 'end', 'delete', 'remove', 'cancel'].some(k => word.includes(k))) {
    return 'Likely RED (warning)';
  }
  if (['buy', 'checkout', 'add', 'cart', 'submit'].some(k => word.includes(k))) {
    return 'Likely ORANGE/YELLOW (primary action)';
  }
  if (['mute', 'video', 'camera', 'share'].some(k => word.includes(k))) {
    return 'Likely BLUE or GRAY (control)';
  }
  return undefined;
}

/**
 * Detect colored buttons
 */
function hasColorButton(imageData: ImageData, color: 'red' | 'orange' | 'blue' | 'green'): boolean {
  const data = imageData.data;
  let colorPixels = 0;
  const threshold = 200;
  
  for (let i = 0; i < data.length; i += 4 * 20) { // Sample every 20th pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    switch (color) {
      case 'red':
        if (r > 180 && g < 100 && b < 100) colorPixels++;
        break;
      case 'orange':
        if (r > 200 && g > 120 && g < 200 && b < 100) colorPixels++;
        break;
      case 'blue':
        if (b > 150 && r < 120 && g < 120) colorPixels++;
        break;
      case 'green':
        if (g > 150 && r < 120 && b < 120) colorPixels++;
        break;
    }
  }
  
  return colorPixels > 50; // Found significant colored area
}

/**
 * Capitalize words properly
 */
function capitalizeWords(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Helper: Detect if there's a red button (usually "end call" or "delete")
 */
function hasRedButton(imageData: ImageData): boolean {
  const data = imageData.data;
  let redClusters = 0;
  let consecutiveRed = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Detect bright red pixels
    if (r > 180 && g < 100 && b < 100) {
      consecutiveRed++;
      if (consecutiveRed > 20) {
        redClusters++;
        consecutiveRed = 0;
      }
    } else {
      consecutiveRed = 0;
    }
  }

  // If we have concentrated red areas, likely a red button
  return redClusters > 5;
}

