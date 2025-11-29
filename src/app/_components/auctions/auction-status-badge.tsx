import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react/macro";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import type { AuctionStatus } from "@/core/domains/auction";
import { cn } from "@/lib/utils";
import {
  AuctionStatusClassNames,
  AuctionStatusToMessage,
} from "./message/auction-status-to-message";

type Props = {
  status: AuctionStatus;
  className?: string;
};

export const AuctionStatusBadge: FC<Props> = (props) => {
  const {
    status,
    className = "px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-foreground text-sm sm:text-base",
  } = props;
  const { i18n } = useLingui();

  return (
    <Badge className={cn(className, AuctionStatusClassNames[status])}>
      {i18n._(AuctionStatusToMessage[status] as MessageDescriptor)}
    </Badge>
  );
};
