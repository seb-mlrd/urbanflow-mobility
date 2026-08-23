import type { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

export const GBFS_FETCH_TIMEOUT_MS = 5_000;

/**
 * Récupère et parse un flux GBFS avec un timeout, en ne renvoyant que le
 * corps JSON (déjà déballé de l'enveloppe Axios).
 */
export async function fetchGbfsResource<T>(
  httpService: HttpService,
  url: string,
  timeoutMs: number = GBFS_FETCH_TIMEOUT_MS,
): Promise<T> {
  const res = await firstValueFrom(
    httpService.get<T>(url).pipe(timeout(timeoutMs)),
  );
  return res.data;
}
