import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { map, Subject, switchMap, tap } from 'rxjs';
import { ItemsResponse } from './items-response';
import { ItemsResource } from './items-resourse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ReactiveFormsModule]
})
export class AppComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient)

  items$ = signal<ItemsResource>({
    isLoading: true,
    data: [],
    error: null
  });

  titleFormControl = new FormControl('');

  httpParams$ = new Subject<{ title: string, page: string }>();

  ngOnInit() {
    this.route.queryParamMap.pipe(
      tap(params => this.titleFormControl.setValue(params.get('title'))),
      map(params => ({ title: params.get('title') || '', page: params.get('page') || '1' })),
      switchMap(params => {
        const query = new HttpParams({ fromObject: params });
        return this.http.get<ItemsResponse>('/api/items', { params: query });
      })
    ).subscribe({
      next: itemsResponse => {
          this.items$.set({
            isLoading: false,
            data: itemsResponse.items,
            error: null,
          })
        },
    });
  }

  submitFilter() {
    this.router.navigate([], { queryParams: { title: this.titleFormControl.value, page: 1 } });
  }
}
