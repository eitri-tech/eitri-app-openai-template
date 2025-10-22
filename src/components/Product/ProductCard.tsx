import { View, Text, Image } from "eitri-luminus";
import { RiShoppingBag2Line } from "react-icons/ri";
import { Product } from "@/types/Product";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({
  product,
  onProductClick,
  onAddToCart,
}: ProductCardProps) => {
  const offer = product.items[0].sellers[0].commertialOffer;
  const hasDiscount = offer.ListPrice > offer.Price;

  const getGreaterProductInstallment = () => {
    const installments = offer.Installments;
    const instalment = installments.find(
      (installment) => installment.NumberOfInstallments > 1
    );

    if (!instalment) return "";

    return `Em até ${instalment.NumberOfInstallments}x sem juros`;
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",");
  };

  return (
    <View
      key={product.productId}
      className="flex-shrink-0 w-52 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <View className="relative aspect-[3/4]">
        {hasDiscount && (
          <View className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md z-10">
            <Text className="text-white text-xs font-bold">Oferta</Text>
          </View>
        )}
        <Image
          src={product.items[0].images[0].imageUrl}
          alt={product.productName}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onProductClick(product)}
        />
      </View>
      <View
        className="p-3 flex flex-col justify-between flex-grow"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <View>
          {/* Product Name */}
          <Text className="text-gray-900 font-medium text-sm line-clamp-2 mt-1">
            {product.productName}
          </Text>

          {/* Old Price */}
          {hasDiscount && (
            <Text className="text-gray-400 text-xs line-through">
              R$ {formatPrice(offer.ListPrice)}
            </Text>
          )}
        </View>

        {/* Current Price */}
        <View className="flex justify-between items-end">
          <View className="flex flex-col">
            <Text className="text-green-600 font-bold text-lg">
              R$ {formatPrice(offer.Price)}
            </Text>

            {/* Installments */}
            <Text className="text-gray-500 text-xs">
              {getGreaterProductInstallment()}
            </Text>
          </View>
          {/* Cart Button */}
          <View
            className="mt-2 bg-orange-600 hover:bg-orange-700 rounded-lg p-2 flex items-center justify-center cursor-pointer rounded-md z-99"
            onClick={() => onAddToCart(product)}
          >
            <RiShoppingBag2Line className="text-white h-6 w-6" />
          </View>
        </View>
      </View>
    </View>
  );
};
