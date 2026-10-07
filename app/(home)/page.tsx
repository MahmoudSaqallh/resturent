import { home } from "@/data/home";
import { getHomeSelection } from "@/features/home/selection";
import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { BestSellers } from "@/components/home/best-sellers";
import { FeaturedOffer } from "@/components/home/featured-offer";
import { BuildPreview } from "@/components/home/build-preview";
import { DrinksDesserts } from "@/components/home/drinks-desserts";
import { Highlights } from "@/components/home/highlights";
import { Story } from "@/components/home/story";
import { Gallery } from "@/components/home/gallery";
import { Reviews } from "@/components/home/reviews";
import { Location } from "@/components/home/location";
import { FinalCta } from "@/components/home/final-cta";
import { MealOfTheDay } from "@/components/offers/meal-of-the-day";
import { QuickOrder } from "@/components/orders/quick-order";

/** Homepage: curated previews resolved on the server. The full menu lives at /menu. */
export default async function HomePage() {
  const { shortcuts, bestSellers, offer, build, mealOfTheDay } = await getHomeSelection();

  return (
    <>
      <Hero content={home.hero} />
      <CategoryStrip categories={shortcuts} />
      {/* Returning customers only; renders nothing on a first visit. */}
      <QuickOrder className="pt-2 pb-6" />
      {mealOfTheDay && (
        <div className="container-page pt-2 pb-4">
          <MealOfTheDay product={mealOfTheDay.product} note={mealOfTheDay.note} className="lg:max-w-3xl" />
        </div>
      )}
      <BestSellers products={bestSellers} />
      {offer && <FeaturedOffer promotion={offer.promotion} product={offer.product} />}
      {build && <BuildPreview steps={build.steps} saving={build.saving} />}
      <DrinksDesserts blocks={home.pair} />
      <Highlights items={home.highlights} />
      {home.story && <Story story={home.story} />}
      <Gallery images={home.gallery} />
      <Reviews reviews={home.reviews} />
      <Location image={home.infoImage} />
      <FinalCta image="/images/menu/burger-classic.jpg" />
    </>
  );
}
