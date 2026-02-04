import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const AUTO_DISMISS_MS = 5000;

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  private nextId = 0;
  private toasts = signal<Toast[]>([]);

  readonly messages = computed(() => this.toasts());

  showSuccess(message: string): void {
    this.push({ message, type: 'success' });
  }

  showWarning(message: string): void {
    this.push({ message, type: 'warning' });
  }

  showError(message: string): void {
    this.push({ message, type: 'error' });
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(toast: Omit<Toast, 'id'>): void {
    const id = this.nextId++;
    const full: Toast = { ...toast, id };
    this.toasts.update((list) => [...list, full]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
