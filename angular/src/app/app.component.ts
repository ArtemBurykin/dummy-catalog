import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs';
import { ItemsResponse } from './items-response';
import { ItemsResource } from './items-resourse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ReactiveFormsModule, CommonModule]
})
export class AppComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient)

  items$ = signal<ItemsResource>({
    isLoading: true,
    data: [],
    error: null,
    pages: [],
  });

  currentPage = signal<number>(1);
  titleFormControl = new FormControl('');

  ngOnInit() {
    this.route.queryParamMap.pipe(
      tap(params => this.titleFormControl.setValue(params.get('title'))),
      tap(params => {
        const page = params.get('page') || '1';
        this.currentPage.set(+page)
      }),
      map(params => ({ title: params.get('title') || '', page: params.get('page') || '1' })),
      switchMap(params => {
        const query = new HttpParams({ fromObject: params });
        return this.http.get<ItemsResponse>('/api/items', { params: query });
      }),
      catchError((err: HttpErrorResponse) => {
        const errorObj: { error: string } = err.error;
        throw errorObj.error;
      })
    ).subscribe({
      next: itemsResponse => {
        this.items$.set({
          isLoading: false,
          data: itemsResponse.items,
          error: null,
          pages: Array.from({ length: itemsResponse.pages }, (_, i) => i + 1),
        });
      },
      error: (error: string) => {
        this.items$.set({
          isLoading: false,
          data: [],
          error,
          pages: [1]
        });
      }
    });
  }

  submitFilter() {
    this.router.navigate([], { queryParams: { title: this.titleFormControl.value, page: 1 } });
  }

  goToPage(page: number) {
    this.router.navigate([], { queryParams: { title: this.titleFormControl.value, page } });
  }
}
