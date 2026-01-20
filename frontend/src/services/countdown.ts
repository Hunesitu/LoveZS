import api from './api';

export type CountdownDirection = 'countup' | 'countdown';
export type CountdownType = 'anniversary' | 'birthday' | 'event' | 'other';

export interface Countdown {
  _id: string;
  title: string;
  description?: string;
  targetDate: string;
  type: CountdownType;
  direction: CountdownDirection;
  isRecurring: boolean;
  recurringType?: 'yearly' | 'monthly' | 'daily';
  days?: number;        // can be negative for countup
  absoluteDays?: number; // always positive
  createdAt: string;
  updatedAt: string;
}

export const countdownService = {
  async getCountdowns(params?: { direction?: CountdownDirection; type?: CountdownType }) {
    const res = await api.get('/countdowns', { params });
    return res.data;
  },

  async createCountdown(payload: Partial<Countdown>) {
    const res = await api.post('/countdowns', payload);
    return res.data;
  },

  async updateCountdown(id: string, payload: Partial<Countdown>) {
    const res = await api.put(`/countdowns/${id}`, payload);
    return res.data;
  },

  async deleteCountdown(id: string) {
    const res = await api.delete(`/countdowns/${id}`);
    return res.data;
  }
};
