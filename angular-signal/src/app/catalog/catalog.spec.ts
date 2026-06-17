import { TestBed } from '@angular/core/testing';
import { Catalog } from './catalog';
import { App} from '../app';
import { NavigationEnd, provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { filter, firstValueFrom } from 'rxjs';

describe('Catalog', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalog, App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '', component: Catalog}], withComponentInputBinding()),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load data from the server', async () => {
    await harness.navigateByUrl('/?title=test&page=1', Catalog);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    expect(harness.routeNativeElement?.innerHTML).toContain('Loading...');

    req.flush({ items: [{ id: '1', title: 'test 1' }], pages: 2 });

    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerHTML).toContain('test 1');
  });

  it('should show the error if it ocurred', async () => {
    await harness.navigateByUrl('/?title=test&page=1', Catalog);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    expect(harness.routeNativeElement?.innerHTML).toContain('Loading...');

    req.flush({ error: 'an error' }, { status: 500, statusText: 'fail' });

    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.innerHTML).toContain('an error');
  });

  it('should show no items label if nothing is received', async () => {
    await harness.navigateByUrl('/?title=test&page=1', Catalog);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    expect(harness.routeNativeElement?.innerHTML).toContain('Loading...');

    req.flush({ items: [], pages: 2 });

    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.innerHTML).toContain('No items found');
  });

  it('should navigate to the page', async () => {
    await harness.navigateByUrl('/?title=test&page=1', Catalog);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    req.flush({ items: [{ id: '1', title: 'test 1' }], pages: 2 });

    await harness.fixture.whenStable();
    const router = TestBed.inject(Router);

    const pageBtn = harness.routeNativeElement!.querySelectorAll('.pagination__page')[1] as HTMLElement;
    pageBtn.click();

    const navigationComplete = firstValueFrom(
      router.events.pipe(filter(event => event instanceof NavigationEnd))
    );

    const event = await navigationComplete;

    expect(event.url).toBe('/?title=test&page=2');
  });

  it('should apply the title filter', async () => {
    await harness.navigateByUrl('/?title=test&page=1', Catalog);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    req.flush({ items: [{ id: '1', title: 'test 1' }], pages: 2 });

    await harness.fixture.whenStable();

    const filterInput = harness.routeNativeElement!.querySelector('#title') as HTMLInputElement;
    filterInput.value = 'te';
    filterInput.dispatchEvent(new Event('input'));

    const router = TestBed.inject(Router);
    const navigationComplete = firstValueFrom(
      router.events.pipe(filter(event => event instanceof NavigationEnd))
    );

    const filterBtn = harness.routeNativeElement!.querySelector('.filter__btn') as HTMLElement;
    filterBtn.click();

    const event = await navigationComplete;

    expect(event.url).toBe('/?title=te&page=1');
  });
});
