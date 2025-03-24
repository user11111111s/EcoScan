import { useState, useRef, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onDetected: (result: string) => void;
  onClose: () => void;
  className?: string;
}

export default function BarcodeScanner({ onDetected, onClose, className }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const { toast } = useToast();

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
      if (scannerRef.current && isScanning) {
        try {
          scannerRef.current.stop();
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
    };
  }, [isScanning]);

  const startScanner = async () => {
    setScanError(null);
    setIsInitializing(true);

    if (!scannerRef.current) {
      toast({
        title: "Loading camera",
        description: "The scanner is being prepared, please wait...",
      });
      
      // Try to load Quagga again
      try {
        const Quagga = (await import('quagga')).default;
        scannerRef.current = Quagga;
      } catch (error) {
        console.error("Failed to load barcode scanning library", error);
        setScanError("Failed to load scanning library");
        setIsInitializing(false);
        return;
      }
    }

    try {
      // Request camera permissions first
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      
      setIsScanning(true);
      
      scannerRef.current.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment",
            width: { min: 640 },
            height: { min: 480 },
            aspectRatio: { ideal: 4/3 }
          },
          area: { // Only read code from the center of the video
            top: "25%",
            right: "25%",
            left: "25%",
            bottom: "25%",
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 2,
        frequency: 10,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"]
        },
        locate: true
      }, function(err: any) {
        setIsInitializing(false);
        
        if (err) {
          console.error("Failed to initialize scanner", err);
          setScanError("Failed to access camera");
          setIsScanning(false);
          toast({
            title: "Camera Error",
            description: "Failed to access your device camera. Please check permissions.",
            variant: "destructive"
          });
          return;
        }
        
        scannerRef.current.start();
      });

      scannerRef.current.onDetected((result: any) => {
        if (result && result.codeResult) {
          // Play a success sound or vibrate to indicate successful scan
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          onDetected(result.codeResult.code);
          if (scannerRef.current) {
            scannerRef.current.stop();
            setIsScanning(false);
          }
        }
      });
    } catch (error) {
      console.error("Error starting scanner", error);
      setIsInitializing(false);
      setScanError(
        error instanceof DOMException && error.name === "NotAllowedError" 
          ? "Camera access denied. Please enable camera permissions."
          : "Failed to start scanner"
      );
      setIsScanning(false);
      
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Failed to start scanner",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="bg-black/50 text-white hover:bg-black/70 rounded-full"
          disabled={isInitializing}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {isScanning ? (
        <div className="relative h-full">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
          
          {/* Scanning overlay with guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-primary-500 w-64 h-64 rounded-lg bg-transparent relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-500 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-500 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-500 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-500 rounded-br-sm"></div>
            </div>
          </div>
          
          {/* Animated scan line */}
          <div className="scan-line w-64 h-0.5 bg-primary-500 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-scan-up-down"></div>
          
          {scanError && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
              {scanError}
            </div>
          )}
          
          <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm px-4 py-2 bg-black/40 backdrop-blur-sm">
            Position the barcode within the frame
          </div>
        </div>
      ) : isInitializing ? (
        <div className="bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 p-8 flex flex-col items-center justify-center h-full">
          <div className="animate-pulse flex flex-col items-center">
            <Camera className="h-10 w-10 text-primary-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Initializing camera...
            </p>
            <div className="w-8 h-8 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 p-8 flex flex-col items-center justify-center h-full">
          <Camera className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            Tap to scan product barcode
          </p>
          <Button 
            className="bg-primary-500 hover:bg-primary-600 text-white"
            onClick={startScanner}
            disabled={isInitializing}
          >
            Start Camera
          </Button>
          {scanError && (
            <div className="mt-4 text-red-500 text-sm text-center p-2 bg-red-100 dark:bg-red-900/20 rounded-md">
              {scanError}
              {scanError?.includes("permissions") && (
                <p className="mt-2 text-xs">
                  Please check your browser settings and allow camera access for this site.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
