declare module 'quagga' {
  interface CameraError {
    message: string;
    code: number;
    name?: string;
  }

  interface CameraSettings {
    width?: { min?: number; max?: number; ideal?: number };
    height?: { min?: number; max?: number; ideal?: number };
    aspectRatio?: { min?: number; max?: number; ideal?: number };
    facingMode?: string;
  }

  interface InputStreamConfig {
    name?: string;
    type?: string;
    target?: HTMLElement;
    constraints?: {
      width?: number | CameraSettings['width'];
      height?: number | CameraSettings['height'];
      aspectRatio?: CameraSettings['aspectRatio'];
      facingMode?: string;
      deviceId?: string;
    };
    area?: {
      top?: string | number;
      right?: string | number;
      left?: string | number;
      bottom?: string | number;
    };
  }

  interface DecoderConfig {
    readers?: string[];
    debug?: boolean;
    multiple?: boolean;
  }

  interface LocatorConfig {
    patchSize?: string;
    halfSample?: boolean;
  }

  interface QuaggaConfig {
    inputStream?: InputStreamConfig;
    decoder?: DecoderConfig;
    locator?: LocatorConfig;
    locate?: boolean;
    numOfWorkers?: number;
    frequency?: number;
  }

  interface CodeResult {
    code: string;
    format: string;
    start: number;
    end: number;
    codeset: number;
    startInfo: {
      error: number;
      code: number;
      start: number;
      end: number;
    };
    decodedCodes: {
      code: number;
      start: number;
      end: number;
    }[];
    endInfo: {
      error: number;
      code: number;
      start: number;
      end: number;
    };
    direction: number;
  }

  interface DetectionResult {
    codeResult: CodeResult;
    line: {
      x: number;
      y: number;
    }[];
    angle: number;
    pattern: number[];
    box: [
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number }
    ];
  }

  interface QuaggaAPI {
    init: (config: QuaggaConfig, callback?: (err: CameraError | null) => void) => Promise<void>;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (result: DetectionResult) => void) => void;
    offDetected: (callback: (result: DetectionResult) => void) => void;
    onProcessed: (callback: (result: any) => void) => void;
    offProcessed: (callback: (result: any) => void) => void;
    registerResultCollector: (callback: (result: any) => void) => void;
    setReaders: (readers: string[]) => void;
    decodeSingle: (config: QuaggaConfig, callback: (result: any) => void) => void;
    canvas: {
      ctx: {
        overlay: CanvasRenderingContext2D;
        image: CanvasRenderingContext2D;
      };
      dom: {
        overlay: HTMLCanvasElement;
        image: HTMLCanvasElement;
      };
    };
  }

  const Quagga: QuaggaAPI;
  export default Quagga;
}