import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';

describe('AppComponent', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([{ path: '', component: AppComponent }]),
        provideHttpClient(),
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
    await harness.navigateByUrl('/?title=test&page=1', AppComponent);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    expect(harness.routeNativeElement?.innerHTML).toContain('Loading...');

    req.flush({ items: [{ id: '1', title: 'test 1' }], pages: 2 });

    harness.detectChanges();
    expect(harness.routeNativeElement?.innerHTML).toContain('test 1');
  });

  it('should show the error if it ocurred', async () => {
    await harness.navigateByUrl('/?title=test&page=1', AppComponent);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    expect(harness.routeNativeElement?.innerHTML).toContain('Loading...');

    req.flush({ error: 'an error' }, { status: 500, statusText: 'fail' });

    harness.detectChanges();
    expect(harness.routeNativeElement?.innerHTML).toContain('an error');
  });

  it('should show no items label if nothing is received', async () => {
    await harness.navigateByUrl('/?title=test&page=1', AppComponent);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    expect(harness.routeNativeElement?.innerHTML).toContain('Loading...');

    req.flush({ items: [], pages: 2 });

    harness.detectChanges();
    expect(harness.routeNativeElement?.innerHTML).toContain('No items found');
  });

  it('should navigate to the page', fakeAsync(async () => {
    await harness.navigateByUrl('/?title=test&page=1', AppComponent);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    req.flush({ items: [{ id: '1', title: 'test 1' }], pages: 2 });

    harness.detectChanges();

    const pageBtn = harness.routeNativeElement!.querySelectorAll('.pagination__page')[1] as HTMLElement;
    pageBtn.click();

    tick();

    const req2 = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=2',
    });

    req2.flush({ items: [{ id: '2', title: 'test 2' }], pages: 2 });

    harness.detectChanges();
    expect(harness.routeNativeElement?.innerHTML).toContain('test 2');
  }));

  it('should apply the title filter', fakeAsync(async () => {
    await harness.navigateByUrl('/?title=test&page=1', AppComponent);

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=test&page=1',
    });

    req.flush({ items: [{ id: '1', title: 'test 1' }], pages: 2 });

    harness.detectChanges();

    const filterInput = harness.routeNativeElement!.querySelector('#title') as HTMLInputElement;
    filterInput.value = 'te';
    filterInput.dispatchEvent(new Event('input'));

    const filterBtn = harness.routeNativeElement!.querySelector('.filter__btn') as HTMLElement;
    filterBtn.click();

    tick();

    const req2 = httpTesting.expectOne({
      method: 'GET',
      url: '/api/items?title=te&page=1',
    });

    req2.flush({ items: [{ id: '2', title: 'test 2' }], pages: 2 });

    harness.detectChanges();
    expect(harness.routeNativeElement?.innerHTML).toContain('test 2');
  }));
});
