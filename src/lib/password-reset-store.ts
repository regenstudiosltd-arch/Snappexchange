// src/lib/password-reset-store.ts

const KEY = 'snappx_pwd_reset';

export interface PasswordResetState {
  phone: string;
  maskedPhone: string;
  code: string;
}

export const passwordResetStore = {
  set(data: Partial<PasswordResetState>) {
    const current = this.get();
    sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...data }));
  },

  get(): Partial<PasswordResetState> {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  clear() {
    sessionStorage.removeItem(KEY);
  },
};
