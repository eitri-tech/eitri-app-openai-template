import { View, Text } from "eitri-luminus";
import { RiShoppingBag2Line } from "react-icons/ri";

interface ToastProps {
  show: boolean;
  message: string;
  icon?: React.ReactNode;
}

export const Toast = ({ show, message, icon }: ToastProps) => {
  if (!show) return null;

  return (
    <View
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down"
      style={{
        position: "fixed",
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        animation: "fadeInDown 0.3s ease-in-out",
      }}
    >
      <View className="flex flex-row items-center gap-2">
        {icon || <RiShoppingBag2Line className="text-white h-5 w-5" />}
        <Text className="text-white font-medium text-sm">{message}</Text>
      </View>
    </View>
  );
};
