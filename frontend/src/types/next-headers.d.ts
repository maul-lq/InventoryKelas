declare module "next/headers" {
  export interface CookieValue {
    value: string;
  }

  export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    expires?: Date;
  }

  export interface CookieStore {
    get(name: string): CookieValue | undefined;
    set(name: string, value: string, options?: CookieOptions): void;
    delete(name: string): void;
  }

  export function cookies(): Promise<CookieStore>;
}
