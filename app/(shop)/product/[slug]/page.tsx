import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getProductBySlug } from "@/features/menu/api";
import { ProductPageView } from "@/components/products/product-page-view";

export async function generateStaticParams() {
  const { products } = await getMenu();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductPageView productId={product.id} />;
}
