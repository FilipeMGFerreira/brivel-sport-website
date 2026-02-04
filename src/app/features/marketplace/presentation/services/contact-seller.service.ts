import { Injectable } from '@angular/core';
import { getSupabaseClient } from '../../infrastructure/supabase/supabase.client';

export interface CreateLeadEmailParams {
  listingId: string;
  buyerEmail: string;
  message: string;
  captchaToken: string;
}

export interface CreateLeadWhatsAppParams {
  listingId: string;
}

@Injectable({ providedIn: 'root' })
export class ContactSellerService {
  async createLeadEmail(params: CreateLeadEmailParams): Promise<{ leadId: string }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke<{ leadId: string }>('create-lead-email', {
      body: {
        listingId: params.listingId,
        buyerEmail: params.buyerEmail,
        message: params.message,
        captchaToken: params.captchaToken,
      },
    });
    if (error) throw new Error(error.message ?? 'Failed to send message');
    const body = data as { leadId?: string; error?: string } | null;
    if (body?.error) throw new Error(body.error);
    if (!body?.leadId) throw new Error('Invalid response');
    return { leadId: body.leadId };
  }

  async createLeadWhatsApp(params: CreateLeadWhatsAppParams): Promise<{ leadId: string }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke<{ leadId: string }>('create-lead-whatsapp', {
      body: { listingId: params.listingId },
    });
    if (error) throw new Error(error.message ?? 'Failed to create lead');
    const body = data as { leadId?: string; error?: string } | null;
    if (body?.error) throw new Error(body.error);
    if (!body?.leadId) throw new Error('Invalid response');
    return { leadId: body.leadId };
  }

  /** Normalize phone for wa.me: digits only (no +). */
  normalizePhoneForWhatsApp(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  getWhatsAppUrl(phone: string, prefillText: string): string {
    const num = this.normalizePhoneForWhatsApp(phone);
    const text = encodeURIComponent(prefillText);
    return `https://wa.me/${num}?text=${text}`;
  }
}
