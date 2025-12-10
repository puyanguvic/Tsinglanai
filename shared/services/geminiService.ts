import { apiClient } from './apiClient';

export async function analyzeMeetingMinutes(notes: string): Promise<string> {
  try {
    // Ideally call a dedicated /api/ai/analyze-meeting endpoint; fallback to weekly-report summarizer.
    const res = await apiClient.ai.summarizeWeeklyReport({ reportId: 'meeting-notes' });
    if (res && (res as any).summary) {
      return (res as any).summary as string;
    }
  } catch (err) {
    console.warn('AI analysis failed, returning fallback', err);
  }
  return 'AI analysis unavailable in this environment.';
}

export async function mockScanInvoice() {
  // Placeholder for invoice scan; keep shape compatible with existing UI.
  return {
    vendor: 'Demo Vendor',
    total: 0,
    tax: 0,
    items: [],
    notes: 'Invoice scan not wired to backend AI yet.'
  };
}
