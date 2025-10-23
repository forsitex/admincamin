'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, QrCode } from 'lucide-react';

export default function QRCodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      // Generează URL-ul pentru pontaj
      const baseUrl = window.location.origin;
      const pontajUrl = `${baseUrl}/pontaj`;
      setQrUrl(pontajUrl);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = 'QR-Code-Pontaj.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <QrCode className="w-10 h-10 text-purple-600" />
            QR Code Pontaj
          </h1>
          <p className="text-gray-600 text-lg">
            Printează acest QR Code și plasează-l la intrarea în cămin
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 mb-8 print:shadow-none">
          <div className="text-center">
            {/* QR Code */}
            <div className="inline-block p-8 bg-white rounded-xl border-4 border-purple-200 mb-6">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrUrl}
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Instructions */}
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cum funcționează?
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-gray-700">
                    Angajatul scanează acest QR Code cu telefonul
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-gray-700">
                    Se deschide pagina de pontaj automat
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-gray-700">
                    Introduce PIN-ul personal (4 cifre)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <p className="text-gray-700">
                    Apasă "Intră în Tură" sau "Ieși din Tură"
                  </p>
                </div>
              </div>
            </div>

            {/* URL Display */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Link pontaj:</p>
              <p className="text-sm font-mono text-gray-700 break-all">{qrUrl}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Printer className="w-5 h-5" />
            Printează QR Code
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-8 py-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            <Download className="w-5 h-5" />
            Descarcă PNG
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-purple-50 border-2 border-purple-200 rounded-xl p-6 print:hidden">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            💡 Sfaturi
          </h3>
          <ul className="space-y-2 text-sm text-purple-900">
            <li>• Printează QR Code-ul pe hârtie A4 pentru vizibilitate maximă</li>
            <li>• Plasează-l la intrarea principală în cămin, la înălțimea ochilor</li>
            <li>• Protejează-l cu o folie transparentă pentru durabilitate</li>
            <li>• Asigură-te că zona e bine luminată pentru scanare ușoară</li>
          </ul>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
