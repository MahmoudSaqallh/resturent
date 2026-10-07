import type { ImageAsset } from "@/types";
import { Reveal } from "@/components/ui/reveal";
import { FoodImage } from "@/components/products/food-image";

/** Four photos, one ratio (4:3), 2×2 beside the heading on desktop. */
export function Gallery({ images }: { images: ImageAsset[] }) {
  const shown = images.slice(0, 4);
  if (shown.length < 2) return null;
  return (
    <section aria-labelledby="gallery-title" className="section-y">
      <div className="container-page grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="lg:col-span-4">
          <p className="text-sm font-semibold text-brand-ink">من مطبخنا</p>
          <h2 id="gallery-title" className="mt-2 text-section font-extrabold">
            لقطات من يومنا
          </h2>
          <p className="mt-2 max-w-sm text-ink-muted">من الشوّاية للصالة: نفس الاهتمام بكل طبق.</p>
        </div>
        <Reveal selector="[data-photo]" preset="scale" className="grid grid-cols-2 gap-3 md:gap-4 lg:col-span-8">
          {shown.map((image) => (
            <figure key={image.src} data-photo className="group relative aspect-4/3 overflow-hidden rounded-lg">
              <FoodImage
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 380px, (min-width: 1024px) 31vw, 50vw"
                imageClassName="transition-transform duration-500 ease-out-soft group-hover:scale-103"
              />
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
