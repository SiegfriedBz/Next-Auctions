"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef, FC } from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const linkClassName =
  "group text-sm h-12 leading-none font-medium flex flex-row items-center gap-x-2";

const iconClassName =
  "opacity-50 group-hover:opacity-100 group-hover:font-extrabold transition-all duration-200";

type BaseProps = ComponentPropsWithoutRef<"li"> & {
  title: string;
  icon?: LucideIcon;
};

type LinkItemProps = {
  href: string;
};

type DisabledItemProps = {
  disabledLabel: string;
};

type ListItemProps = BaseProps & LinkItemProps;
export const NavListItem: FC<ListItemProps> = (props) => {
  const { title, icon, href, ...rest } = props;
  const Icon = icon;

  return (
    <li {...rest}>
      <NavigationMenuLink asChild>
        <Link href={href} className={cn(linkClassName, "min-w-full")}>
          {Icon && <Icon size={16} className={iconClassName} />}
          {title}
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

type DisabledNavListItemProps = BaseProps & DisabledItemProps;
export const DisabledNavListItem: FC<DisabledNavListItemProps> = (props) => {
  const { title, icon, disabledLabel, ...rest } = props;

  const Icon = icon;

  return (
    <li {...rest}>
      <NavigationMenuLink asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                linkClassName,
                "inline-flex p-2 text-muted-foreground cursor-not-allowed",
              )}
              aria-disabled={true}
            >
              {Icon && (
                <Icon
                  size={16}
                  className={cn(
                    iconClassName,
                    "group-hover:opacity-50 text-muted-foreground",
                  )}
                />
              )}
              {title}
            </span>
          </TooltipTrigger>
          <TooltipContent>{disabledLabel}</TooltipContent>
        </Tooltip>
      </NavigationMenuLink>
    </li>
  );
};
