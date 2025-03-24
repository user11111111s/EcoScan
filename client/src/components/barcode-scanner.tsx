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
        console.log("Quagga library loaded successfully");
      } catch (error) {
        console.error("Failed to load barcode scanning library", error);
        setScanError("Failed to load scanning library");
      }
    };

    loadQuagga();

    // Cleanup function
    return () => {
      if (scannerRef.current && isScanning) {
        try {
          console.log("Stopping scanner on unmount");
          scannerRef.current.stop();
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
    };
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setScanError(null);
    console.log("Starting scanner...");

    if (!scannerRef.current) {
      console.error("Scanner not initialized");
      setScanError("Scanner not initialized. Please try again.");
      setIsScanning(false);
      return;
    }

    try {
      // First check if we have camera permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        // Stop the stream immediately, we just needed to check permissions
        stream.getTracks().forEach(track => track.stop());
        console.log("Camera permission granted");
      } catch (err) {
        console.error("Camera permission denied:", err);
        setScanError("Camera permission denied. Please allow camera access.");
        setIsScanning(false);
        return;
      }

      // Now initialize Quagga
      console.log("Initializing Quagga...");
      
      // Create detection handler function
      const detectionHandler = (result: any) => {
        console.log("Barcode detected:", result);
        if (result && result.codeResult) {
          onDetected(result.codeResult.code);
          if (scannerRef.current) {
            scannerRef.current.stop();
            setIsScanning(false);
          }
        }
      };

      scannerRef.current.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"]
        },
        locate: true
      }, function(err: any) {
        if (err) {
          console.error("Failed to initialize scanner", err);
          setScanError("Failed to access camera. " + (err.message || 'Unknown error'));
          setIsScanning(false);
          return;
        }
        
        console.log("Quagga initialized successfully, starting...");
        
        // Register detection callback
        scannerRef.current.onDetected(detectionHandler);
        
        // Start scanning
        scannerRef.current.start();
      });
    } catch (error) {
      console.error("Error starting scanner", error);
      setScanError("Failed to start scanner: " + (error instanceof Error ? error.message : String(error)));
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
          <div className="relative h-full w-full overflow-hidden bg-black">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="scan-line w-full h-1 bg-primary-500 opacity-60 absolute left-0"></div>
            <div className="absolute inset-0 border-2 border-primary-400 opacity-40 pointer-events-none"></div>
          </div>
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
