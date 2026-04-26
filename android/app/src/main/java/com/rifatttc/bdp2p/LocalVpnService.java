package com.rifatttc.bdp2p;

import android.content.Intent;
import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import android.util.Log;

public class LocalVpnService extends VpnService {
    private static final String TAG = "LocalVpnService";
    private ParcelFileDescriptor vpnInterface = null;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String mode = intent.getStringExtra("mode");
        Log.d(TAG, "Starting VPN service in mode: " + mode);
        setupVpn();
        return START_STICKY;
    }

    private void setupVpn() {
        if (vpnInterface != null) return;
        try {
            Builder builder = new Builder();
            builder.addAddress("10.0.0.2", 24);
            builder.addRoute("0.0.0.0", 0);
            builder.setSession("BDP2P");
            vpnInterface = builder.establish();
            
            // TODO: Start reading from vpnInterface.getFileDescriptor() and forward packets
            Log.d(TAG, "VPN service established");
        } catch (Exception e) {
            Log.e(TAG, "Failed to start VPN", e);
            stopSelf();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            if (vpnInterface != null) {
                vpnInterface.close();
                vpnInterface = null;
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to close VPN interface", e);
        }
    }
}
