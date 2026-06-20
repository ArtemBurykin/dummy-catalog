import PageBtn from "./components/PageBtn";
import { ItemsResponse } from "./items-response";
import Form from 'next/form';

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const filter = await searchParams;

  const title: string = !filter.title ? '' : filter.title;
  const page: string = !filter.page ? '1' : filter.page;

  const res = await fetch(`${process.env.BACK_URL}/api/items?title=${title}&page=${page}`);
  const data: ItemsResponse | { error: string } = await res.json();

  let itemsData: ItemsResponse = { items: [], pages: 1 };
  let error = null;
  let pages: string[] = [];

  if (res.ok) {
    itemsData = data as ItemsResponse;
    pages = Array.from({ length: itemsData.pages }, (_, i) => (i + 1).toString());
  } else {
    const errorResponse = data as { error: string };
    error = errorResponse.error;
  }

  const renderList = (items: { id: string, title: string }[]) => {
    if (items.length === 0) {
      return (<div>Nothing found...</div>);
    }

    return (
      <div className="items-list flex justify-start gap-10">
        {itemsData.items.map((item) => <div className="items-list__item" key={item.id}>{item.title}</div>)}
      </div>
    );
  }

  const renderPagination = (pages: string[]) => {
    return (
      <div className="flex gap-5 mt-2 pagination">
        {pages.map(p => (<PageBtn key={p} page={p} isActive={p === page} />))}
      </div>
    );
  }

  return (
    <div>
      <main className="main p-1">
        <section className="flex gap-10">
          <div className="w-70 border-r-1">
            <Form action="">
              <label htmlFor="title">Title:</label>
              <input className="input" type="text" name="title" id="title" defaultValue={title} />
              <button className="primary-btn">Search</button>
            </Form>
          </div>

          {error === null ? (
            <div className="catalog-page__list grow">
              {renderList(itemsData.items)}
              {renderPagination(pages)}
            </div>
          ) : (
            <div className="catalog-page__error">{error}</div>
          )}
        </section>
      </main>
    </div >
  );
}
