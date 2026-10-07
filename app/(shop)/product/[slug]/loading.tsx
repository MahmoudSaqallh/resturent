/** Skeleton for the product details page. */
export default function ProductLoading() {
  return (
    <div className="container-page py-5 md:py-8" aria-busy="true" aria-label="جارٍ تحميل تفاصيل الوجبة">
      <div className="skeleton mb-4 h-5 w-48 rounded-sm" />
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="skeleton aspect-4/3 w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <div className="skeleton h-9 w-3/4 rounded-sm" />
          <div className="skeleton h-7 w-28 rounded-sm" />
          <div className="skeleton h-4 w-full rounded-sm" />
          <div className="skeleton h-4 w-5/6 rounded-sm" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="skeleton h-16 rounded-md" />
            <div className="skeleton h-16 rounded-md" />
            <div className="skeleton h-16 rounded-md" />
          </div>
          <div className="skeleton mt-4 h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
