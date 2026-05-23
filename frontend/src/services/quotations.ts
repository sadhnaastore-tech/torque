/**
 * src/services/quotations.ts
 * Typed API service for the Quotations entity.
 * Talks to: GET/POST/PUT /api/v1/quotations
 */
import { api } from '../utils/api';

export interface Quotation {
  id: string;
  lead_id: string | null;
  created_by: string | null;
  amount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationCreate {
  lead_id?: string;
  amount: number;
  status?: string;
  details?: Record<string, any>;
}

export interface QuotationUpdate {
  amount?: number;
  status?: string;
  details?: Record<string, any>;
}

const BASE = '/quotations';

export const quotationsService = {
  /** Fetch all quotations. */
  list: (params: { skip?: number; limit?: number } = {}): Promise<Quotation[]> => {
    const qs = new URLSearchParams();
    if (params.skip !== undefined) qs.set('skip', String(params.skip));
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return api.get<Quotation[]>(`${BASE}/${query}`);
  },

  /** Get a single quotation by ID. */
  getById: (id: string): Promise<Quotation> =>
    api.get<Quotation>(`${BASE}/${id}`),

  /** Create a new quotation. */
  create: (data: QuotationCreate): Promise<Quotation> =>
    api.post<Quotation>(`${BASE}/`, data),

  /** Update an existing quotation. */
  update: (id: string, data: QuotationUpdate): Promise<Quotation> =>
    api.put<Quotation>(`${BASE}/${id}`, data),
};
