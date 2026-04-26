package com.rifatttc.bdp2p;

import android.content.Intent;
import android.net.VpnService;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VpnPlugin")
public class VpnPlugin extends Plugin {

    private static final int VPN_REQUEST_CODE = 0x0F;
    private PluginCall savedCall;

    @PluginMethod
    public void startVpn(PluginCall call) {
        String mode = call.getString("mode"); // "host" or "client"
        String peerId = call.getString("peerId");
        
        Intent intent = VpnService.prepare(getContext());
        if (intent != null) {
            savedCall = call;
            getActivity().startActivityForResult(intent, VPN_REQUEST_CODE);
        } else {
            // Already prepared, start the service
            startVpnService(mode, peerId);
            JSObject ret = new JSObject();
            ret.put("status", "started");
            ret.put("mode", mode);
            call.resolve(ret);
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode == VPN_REQUEST_CODE && resultCode == getActivity().RESULT_OK) {
            if (savedCall != null) {
                String mode = savedCall.getString("mode");
                String peerId = savedCall.getString("peerId");
                startVpnService(mode, peerId);
                JSObject ret = new JSObject();
                ret.put("status", "started");
                ret.put("mode", mode);
                savedCall.resolve(ret);
                savedCall = null;
            }
        } else if (requestCode == VPN_REQUEST_CODE) {
            if (savedCall != null) {
                savedCall.reject("VPN permission denied");
                savedCall = null;
            }
        }
    }

    private void startVpnService(String mode, String peerId) {
        Intent intent = new Intent(getContext(), LocalVpnService.class);
        intent.putExtra("mode", mode);
        intent.putExtra("peerId", peerId);
        getContext().startService(intent);
    }
    
    @PluginMethod
    public void stopVpn(PluginCall call) {
        Intent intent = new Intent(getContext(), LocalVpnService.class);
        getContext().stopService(intent);
        JSObject ret = new JSObject();
        ret.put("status", "stopped");
        call.resolve(ret);
    }
}
