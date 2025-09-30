declare module 'winston' {
  export interface Logger {
    info(message: string, meta?: any): void;
    error(message: string | Error, ...meta: any[]): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    add(transport: any): Logger;
  }

  export interface Transport {
    new (options?: any): Transport;
  }

  export function createLogger(options: any): Logger;

  export const transports: {
    Console: new (options?: any) => Transport;
    File: new (options?: any) => Transport;
  };

  export const format: {
    combine(...formats: any[]): any;
    timestamp(): any;
    printf(template: (info: any) => string): any;
    json(): any;
    errors(): any;
    colorize(): any;
    simple(): any;
  };
}
