import React from 'react';
import { Download, Smartphone, Server, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Apps() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-transparent">
      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 h-[72px] px-4 flex items-center justify-center">
        <h1 className="text-base font-medium text-[#e2e2e9]">Download Apps</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-6 max-w-lg mx-auto w-full space-y-6">
        
        {/* Banner */}
        <div className="bg-[#121622] rounded-[24px] shadow-sm border border-white/5 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#004a77] flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-[#a8c7fa]" />
          </div>
          <h2 className="text-lg font-bold text-[#e2e2e9] mb-2">Native Android Application</h2>
          <p className="text-sm text-[#8e919f] mb-6">
            To use the P2P VPN service, you must install our native Android application. It utilizes the Android VpnService API to route your traffic securely without root access.
          </p>
          <Button className="w-full rounded-full bg-[#a8c7fa] text-[#003355] font-bold hover:bg-[#82b1ff] h-12">
            <Download className="w-5 h-5 mr-2" />
            Download APK (v1.0.0)
          </Button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#c4c6d0] px-2 uppercase tracking-widest">How It Works</h3>
          
          <div className="bg-[#121622] rounded-[24px] p-5 shadow-sm border border-white/5 flex gap-4">
            <div className="mt-1">
              <Server className="w-5 h-5 text-[#ffb4ab]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#e2e2e9] mb-1">1. Set Up Host (Bangladesh)</h4>
              <p className="text-xs text-[#8e919f] leading-relaxed">
                Install the app on an Android device situated in Bangladesh. Select <b>Host Mode</b> to function as a VPN server. Keep the app running in the background.
              </p>
            </div>
          </div>

          <div className="bg-[#121622] rounded-[24px] p-5 shadow-sm border border-white/5 flex gap-4">
            <div className="mt-1">
              <Smartphone className="w-5 h-5 text-[#a8c7fa]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#e2e2e9] mb-1">2. Set Up Client (Abroad)</h4>
              <p className="text-xs text-[#8e919f] leading-relaxed">
                Install the app on your device abroad. Select <b>Client Mode</b>. 
              </p>
            </div>
          </div>

          <div className="bg-[#121622] rounded-[24px] p-5 shadow-sm border border-white/5 flex gap-4">
            <div className="mt-1">
              <CheckCircle2 className="w-5 h-5 text-[#004a77]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#e2e2e9] mb-1">3. Pair & Connect</h4>
              <p className="text-xs text-[#8e919f] leading-relaxed">
                Use this web dashboard to generate a token from the Host device and redeem it on your Client device. Once paired, you can tunnel your traffic!
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
