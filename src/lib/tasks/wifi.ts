// Wi-Fi connection guided task module
import { Language, t } from '../i18n';

export interface WiFiTaskState {
  step: number;
  networkName?: string;
  password?: string;
  connectionStatus?: 'connecting' | 'connected' | 'failed';
}

/**
 * Process user input for WiFi connection task
 */
export async function processWiFiInput(
  input: string,
  currentStep: number,
  state: WiFiTaskState,
  language: Language
): Promise<{ nextStep: number; state: WiFiTaskState; message: string }> {
  switch (currentStep) {
    case 1: {
      // Getting network name
      // Extract potential network name (usually quoted or capitalized)
      const networkMatch = input.match(/"([^"]+)"|'([^']+)'|([A-Z][A-Za-z0-9_-]+)/);
      const networkName = networkMatch ? (networkMatch[1] || networkMatch[2] || networkMatch[3]) : input.trim();

      if (networkName && networkName.length > 2) {
        return {
          nextStep: 2,
          state: { ...state, networkName },
          message: t(language, 'tasks.wifi_connect.get_password'),
        };
      } else {
        return {
          nextStep: 1,
          state,
          message: t(language, 'errors.not_understand') + ' ' + t(language, 'tasks.wifi_connect.get_network'),
        };
      }
    }

    case 2: {
      // Getting password
      const password = input.trim();
      
      if (password.length > 0) {
        return {
          nextStep: 3,
          state: { ...state, password, connectionStatus: 'connecting' },
          message: t(language, 'tasks.wifi_connect.connecting', { network: state.networkName || '' }),
        };
      } else {
        return {
          nextStep: 2,
          state,
          message: t(language, 'errors.not_understand') + ' ' + t(language, 'tasks.wifi_connect.get_password'),
        };
      }
    }

    case 3: {
      // Connecting (simulate connection attempt)
      const success = Math.random() > 0.3; // 70% success rate for simulation
      
      if (success) {
        return {
          nextStep: 4,
          state: { ...state, connectionStatus: 'connected' },
          message: t(language, 'tasks.wifi_connect.success', { network: state.networkName || '' }),
        };
      } else {
        return {
          nextStep: 1,
          state: { ...state, connectionStatus: 'failed', networkName: undefined, password: undefined },
          message: t(language, 'tasks.wifi_connect.failed'),
        };
      }
    }

    default:
      return {
        nextStep: currentStep,
        state,
        message: t(language, 'errors.technical'),
      };
  }
}

/**
 * Get available WiFi networks (mock implementation)
 */
export async function getAvailableNetworks(): Promise<Array<{ ssid: string; signal: number; secure: boolean }>> {
  // In production, this would scan for actual WiFi networks
  return [
    { ssid: 'HomeNetwork', signal: 90, secure: true },
    { ssid: 'Guest_WiFi', signal: 75, secure: false },
    { ssid: 'Neighbor_5G', signal: 45, secure: true },
  ];
}

/**
 * Connect to WiFi network (mock implementation)
 */
export async function connectToNetwork(ssid: string, password: string): Promise<boolean> {
  // In production, this would attempt actual WiFi connection
  console.log(`Connecting to ${ssid}`);
  
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success/failure
  return Math.random() > 0.2;
}

/**
 * Check current WiFi connection status
 */
export async function getConnectionStatus(): Promise<{ connected: boolean; ssid?: string; signal?: number }> {
  // In production, check actual connection status
  return {
    connected: true,
    ssid: 'HomeNetwork',
    signal: 85,
  };
}

export default {
  processWiFiInput,
  getAvailableNetworks,
  connectToNetwork,
  getConnectionStatus,
};

