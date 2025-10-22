import { View } from "eitri-luminus";
import { Product } from "@/types/Product";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductCarouselProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCarousel = ({
  products,
  loading,
  onProductClick,
  onAddToCart,
}: ProductCarouselProps) => {
  return (
    <View className="flex-1 overflow-x-auto scrollbar-hide">
      <View className="flex flex-row gap-3 mb-4 mx-2">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((item) => (
              <ProductCardSkeleton key={item} />
            ))}
          </>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))
        )}
      </View>
    </View>
  );
};
