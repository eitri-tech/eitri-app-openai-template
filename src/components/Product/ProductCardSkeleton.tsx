import { View } from "eitri-luminus";

export const ProductCardSkeleton = () => {
  return (
    <View
      className="flex-shrink-0 w-52 rounded-2xl overflow-hidden shadow-md bg-gray-50"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <View className="relative aspect-[3/4] bg-gray-200 animate-pulse" />
      <View
        className="p-3"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <View className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <View className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <View className="h-5 bg-gray-200 rounded animate-pulse w-1/2 mt-1" />
      </View>
    </View>
  );
};
