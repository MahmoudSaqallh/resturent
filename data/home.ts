import type { HomeContent } from "@/types";

/**
 * Homepage content.
 *
 * SAMPLE COPY + STOCK PHOTOS — replace with the restaurant's own copy and
 * photography. Product-linked blocks read names and prices from the menu.
 */
export const home: HomeContent = {
  hero: {
    eyebrow: "الطعم اللي بتحبه",
    title: ["وجبة معمولة", "على مزاجك"],
    highlight: "مزاجك",
    supporting: "نكهات قوية، وجبات محضّرة بعناية، وتجربة طلب سهلة من أول ضغطة.",
    note: "من الجمر… لإيدك",
    image: {
      // Built from one studio photo: food on the left, quiet dark space for the copy.
      // wide ≥1280px, mid 1024–1279px (food pushed further left), tall for phones and tablets.
      wide: { src: "/images/hero/hero-wide.jpg", width: 3200, height: 1250 },
      mid: { src: "/images/hero/hero-mid.jpg", width: 2400, height: 1250 },
      tall: { src: "/images/hero/hero-tall.jpg", width: 1200, height: 1800 },
      alt: "برغر لحم مشوي مع جبنة ذائبة وخس وطماطم على لوح خشبي",
    },
  },
  categoryIds: ["burgers", "meals", "chicken", "cold-drinks", "desserts"],
  bestSellerIds: ["double-cheese-burger", "jamra-spicy-burger", "shawarma-sandwich", "bbq-wings"],
  buildSteps: [
    { title: "اختر الوجبة", text: "برغر أو ساندويش من اختياراتنا.", productId: "classic-burger" },
    { title: "اختر الإضافات", text: "بطاطا، بطاطا متبلة أو حلقات بصل.", productId: "fries" },
    { title: "اختر المشروب", text: "غازي، عصير أو مياه.", productId: "soda" },
  ],
  pair: [
    // RTL: the first block sits on the right.
    {
      categoryId: "cold-drinks",
      title: "مشروبات",
      text: "عصائر طازجة، موهيتو وميلك شيك بأحجام مختلفة.",
      image: { src: "/images/menu/xl-mojito.jpg", alt: "موهيتو فراولة مع ثلج ونعناع" },
    },
    {
      categoryId: "desserts",
      title: "حلويات",
      text: "براوني، تيراميسو وكيك لختام الوجبة.",
      image: { src: "/images/menu/xl-brownie.jpg", alt: "براوني مع آيس كريم" },
    },
  ],
  highlights: [
    { icon: "flame", title: "تحضير عند الطلب", text: "كل وجبة تُحضَّر لما تطلبها." },
    { icon: "layers", title: "خيارات متنوعة", text: "برغر، دجاج، بيتزا ومشروبات." },
    { icon: "pointer", title: "طلب سهل", text: "اختار، أضف للسلة، وأكّد بدقيقة." },
    { icon: "timer", title: "خدمة سريعة", text: "توصيل لبيتك أو استلام من المطعم." },
  ],
  story: {
    title: "مطبخ صغير بطعم ثابت",
    paragraphs: [
      "بدأنا بشوّاية واحدة وفكرة بسيطة: أكل سريع بطعم أكل البيت. كل يوم نجهّز اللحم والصوصات بإيدينا ونشوي عند كل طلب.",
      "منيو مختار نعرفه منيح، ونكهات ما بتتغير من طلب لطلب.",
    ],
    image: { src: "/images/menu/xl-grill.jpg", alt: "طاهٍ يشوي على نار مشتعلة في مطبخ المطعم" },
  },
  gallery: [
    { src: "/images/menu/kitchen-pizza-pull.jpg", alt: "قطعة بيتزا تُرفع مع جبنة ذائبة" },
    { src: "/images/menu/dining-room.jpg", alt: "صالة المطعم بإضاءة دافئة" },
    { src: "/images/menu/burger-smash.jpg", alt: "سماش برغر بحواف مقرمشة" },
    { src: "/images/menu/drink-latte.jpg", alt: "كوب لاتيه مع رسمة على الرغوة" },
  ],
  // No real reviews yet: the section stays hidden. Add genuine reviews only.
  reviews: [],
  infoImage: { src: "/images/menu/dining-evening.jpg", alt: "طاولات المطعم مساءً" },
  // Set to { productId, note } on days the kitchen runs a meal of the day.
  mealOfTheDay: null,
  // Seasonal collections (e.g. رمضان) with real product ids and dates; empty = hidden.
  collections: [],
};
