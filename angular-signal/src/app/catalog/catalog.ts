import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ItemsResponse } from '../items-response';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// This is a pretty dummy solution, just to play with signals.
// It can be decomposed to many components.
// But for the sake of simplicity it's the way it is.
@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog {
  private router = inject(Router);

  title = input(undefined, {
    transform: (val) => !val ? '' : val
  });

  page = input(undefined, {
    transform: (val) => !val ? '1' : val
  });

  itemsResource = httpResource<ItemsResponse>(() => {
    return `/api/items?title=${this.title()}&page=${this.page()}`
  });

  errorMessage = computed(() => {
    const err = this.itemsResource.error() as HttpErrorResponse;

    if (!err) return null;

    return err.error?.error;
  })

  pages = computed(() => {
    const data = this.itemsResource.value();

    if (!data) {
      return [];
    }

    return Array.from({ length: data.pages }, (_, i) => (i + 1).toString());
  });

  titleModel = signal<string>('');

  constructor() {
    effect(() => {
      this.titleModel.set(this.title() as string);
    });
  }

  submitFilter() {
    this.router.navigate([], { queryParams: { title: this.titleModel(), page: 1 } });
  }

  goToPage(page: string) {
    this.router.navigate([''], { queryParams: { title: this.title(), page } });
  }
}
