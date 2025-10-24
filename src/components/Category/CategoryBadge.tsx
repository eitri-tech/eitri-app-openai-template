import { View, Text } from "eitri-luminus";

interface CategoryBadgeProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryBadge = ({
  label,
  isActive,
  onClick,
}: CategoryBadgeProps) => {
  return (
    <View
      className={`
        flex-shrink-0 px-4 py-2 rounded-full cursor-pointer transition-all duration-200
        ${
          isActive
            ? "bg-orange-600 text-white shadow-md"
            : "bg-white text-gray-700 border border-gray-300 hover:border-orange-600 hover:text-orange-600"
        }
      `}
      onClick={onClick}
      style={{
        whiteSpace: 'nowrap',
      }}
    >
      <Text
        className={`text-sm font-medium ${
          isActive ? "text-white" : "text-inherit"
        }`}
        style={{
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Text>
    </View>
  );
};
