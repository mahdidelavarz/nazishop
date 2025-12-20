// features/products/components/ProductFeatures.tsx
"use client";

import { Icon } from "@iconify/react";

const features = [
  {
    icon: "ph:truck-duotone",
    color: "text-pink-500",
    label: "ارسال سریع",
  },
  {
    icon: "ph:shield-check-duotone",
    color: "text-green-500",
    label: "ضمانت اصالت",
  },
  {
    icon: "ph:arrow-counter-clockwise-duotone",
    color: "text-blue-500",
    label: "۷ روز ضمانت",
  },
];

export function ProductFeatures() {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
      {features.map((feature, index) => (
        <div key={index} className="text-center">
          <Icon
            icon={feature.icon}
            className={`${feature.color} mx-auto mb-2`}
            width={32}
          />
          <p className="text-xs text-gray-600">{feature.label}</p>
        </div>
      ))}
    </div>
  );
}