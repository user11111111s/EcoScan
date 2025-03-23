import { useState, useRef, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  onDetected: (result: string) => void;
  onClose: () => void;
  className?: string;
}

export default function BarcodeScanner({ onDetected, onClose, className }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import the QuaggaJS library
    const loadQuagga = async () => {
      try {
        const Quagga = (await import('quagga')).default;
        scannerRef.current = Quagga;
      } catch (error) {
        console.error("Failed to load barcode scanning library", error);
        setScanError("Failed to load scanning library");
      }
    };

    loadQuagga();

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setScanError(null);

    if (!scannerRef.current) {
      setScanError("Scanner not initialized");
      setIsScanning(false);
      return;
    }

    try {
      scannerRef.current.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment"
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"]
        },
        locate: true
      }, function(err: any) {
        if (err) {
          console.error("Failed to initialize scanner", err);
          setScanError("Failed to access camera");
          setIsScanning(false);
          return;
        }
        
        scannerRef.current.start();
      });

      scannerRef.current.onDetected((result: any) => {
        if (result && result.codeResult) {
          onDetected(result.codeResult.code);
          if (scannerRef.current) {
            scannerRef.current.stop();
            setIsScanning(false);
          }
        }
      });
    } catch (error) {
      console.error("Error starting scanner", error);
      setScanError("Failed to start scanner");
      setIsScanning(false);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="absolute top-2 right-2 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/50 text-white hover:bg-black/70 rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {isScanning ? (
        <>
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline
          />
          <div className="scan-line w-full h-0.5 bg-primary-500 absolute left-0"></div>
          {scanError && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
              {scanError}
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 p-8 flex flex-col items-center justify-center">
          <Camera className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            Tap to scan product barcode
          </p>
          <Button 
            className="bg-primary-500 hover:bg-primary-600 text-white"
            onClick={startScanner}
          >
            Start Camera
          </Button>
          {scanError && (
            <p className="mt-4 text-red-500 text-sm text-center">{scanError}</p>
          )}
        </div>
      )}
    </div>
  );
}
