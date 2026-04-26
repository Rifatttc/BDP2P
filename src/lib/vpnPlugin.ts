import { registerPlugin } from '@capacitor/core';

export interface VpnPluginType {
  startVpn(options: { mode: 'host' | 'client'; peerId?: string }): Promise<{ status: string; mode: string }>;
  stopVpn(): Promise<{ status: string }>;
}

export const VpnPlugin = registerPlugin<VpnPluginType>('VpnPlugin');
