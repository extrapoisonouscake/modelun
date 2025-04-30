import { flattenCountryInfo } from "@/app/committee/helpers";
import { Badge, BadgeProps } from "../ui/badge";
export function CountryBadge({
  country,
  rightElement,
  ...props
}: {
  country: ReturnType<ReturnType<typeof flattenCountryInfo>>;
  rightElement?: React.ReactNode;
} & BadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-sm flex gap-1.5"
      key={country.code}
      {...props}
    >
      <span>
        {country.emoji || (
          <img
            src={"imageUrl" in country ? country.imageUrl : ""}
            alt={country.name}
            className="w-4 h-4 object-cover inline-block mr-1 align-[-0.2rem]"
          />
        )}{" "}
        {country.name}
      </span>

      {rightElement}
    </Badge>
  );
}
