import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.scss']
})
export class TagInputComponent {
  /** Form array of tag string controls. */
  tagsArray = input.required<FormArray>();

  /** Placeholder for the add-tag input. */
  placeholder = input<string>('Adicionar tag...');

  addTagFromInput(inputEl: HTMLInputElement): void {
    const raw = (inputEl.value ?? '').trim();
    inputEl.value = '';
    if (!raw) return;
    const arr = this.tagsArray();
    const existing = (arr.value as string[]).map((s) => String(s).trim().toLowerCase());
    if (existing.includes(raw.toLowerCase())) return;
    arr.push(new FormControl(raw));
  }

  removeTag(index: number): void {
    this.tagsArray().removeAt(index);
  }

  onKeydown(event: KeyboardEvent, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTagFromInput(inputEl);
    }
  }
}
