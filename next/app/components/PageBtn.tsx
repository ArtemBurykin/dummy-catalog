'use client';

import { useRouter, useSearchParams } from "next/navigation";

export default function PageBtn({ page }: { page: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const redirectToPage = (page: string) => {
    const title = params.get('title') || '';
    router.push(`?title=${title}&page=${page}`);
  }

  return (<div className="pagination__btn" onClick={() => redirectToPage(page)}> { page } </div>);
}