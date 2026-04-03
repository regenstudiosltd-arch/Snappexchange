// src/lib/axios-error.ts

import axios from 'axios';

export function getResponseStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) {
    return err.response?.status;
  }
  return undefined;
}
