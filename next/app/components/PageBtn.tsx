'use client';

import { useRouter, useSearchParams } from "next/navigation";

export default function PageBtn({ page, isActive }: { page: string, isActive: boolean}) {
  const router = useRouter();
  const params = useSearchParams();

  const redirectToPage = (page: string) => {
    const title = params.get('title') || '';
    router.push(`?title=${title}&page=${page}`);
  }

  let elCls = 'pagination__btn';
  elCls += isActive ? ' pagination__btn--active' : '';

  return (<div className={elCls} onClick={() => redirectToPage(page)}> { page } </div>);
}