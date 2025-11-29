import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react/macro";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import type { AuctionCategory } from "@/core/domains/auction";
import { cn } from "@/lib/utils";
import {
  AuctionCategoryClassNames,
  AuctionCategoryToMessage,
} from "./message/auction-category-to-message";

type Props = {
  category: AuctionCategory;
  className?: string;
};

export const AuctionCategoryBadge: FC<Props> = (props) => {
  const {
    category,
    className = "px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-foreground text-sm sm:text-base",
  } = props;
  const { i18n } = useLingui();

  return (
    <Badge className={cn(className, AuctionCategoryClassNames[category])}>
      {i18n._(AuctionCategoryToMessage[category] as MessageDescriptor)}
    </Badge>
  );
};
