import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminToastService } from '../../services/admin-toast.service';

@Component({
  selector: 'app-admin-toast',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./admin-toast.component.scss'],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div class="pointer-events-auto flex flex-col gap-2">
        @for (t of toastService.messages(); track t.id) {
          <div
            role="alert"
            class="rounded-xl border px-4 py-3 shadow-lg flex items-start gap-3"
            [class.bg-green-900/95]="t.type === 'success'"
            [class.border-green-600]="t.type === 'success'"
            [class.text-green-100]="t.type === 'success'"
            [class.bg-amber-900/95]="t.type === 'warning'"
            [class.border-amber-600]="t.type === 'warning'"
            [class.text-amber-100]="t.type === 'warning'"
            [class.bg-red-900/95]="t.type === 'error'"
            [class.border-red-600]="t.type === 'error'"
            [class.text-red-100]="t.type === 'error'">
            <span class="shrink-0 text-lg" [attr.aria-hidden]="true">
              @switch (t.type) {
                @case ('success') { ✓ }
                @case ('warning') { ⚠ }
                @case ('error') { ✕ }
              }
            </span>
            <p class="flex-1 text-sm font-medium m-0">{{ t.message }}</p>
            <button
              type="button"
              (click)="toastService.dismiss(t.id)"
              class="shrink-0 p-1 rounded hover:opacity-80 transition-opacity"
              aria-label="Fechar">
              ×
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminToastComponent {
  constructor(readonly toastService: AdminToastService) {}
}
