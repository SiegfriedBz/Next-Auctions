"use client";

import { useLingui } from "@lingui/react/macro";
import { CirclePlusIcon, GavelIcon } from "lucide-react";
import type { FC } from "react";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { User } from "@/core/domains/user";
import { cn } from "@/lib/utils";
import { DisabledNavListItem, NavListItem } from "../nav-list-item";
import { navMenuItemClasses } from "../navigation-menu-classes";

type Props = {
  me: User | null;
};

export const AuctionsMenu: FC<Props> = (props) => {
  const { me } = props;
  const { i18n, t } = useLingui();
  const { locale: lang } = i18n;

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn("h-8 sm:h-10 cursor-pointer", navMenuItemClasses)}
      >
        <GavelIcon
          size={20}
          className="size-8 sm:size-10 bg-transparent opacity-80 hover:opacity-100 transition-all duration-200"
        />
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <ul className="flex w-58 gap-2 flex-wrap">
          <NavListItem
            title={t`Auctions`}
            icon={GavelIcon}
            href={`/${lang}/auctions`}
            className="flex justify-center items-center w-full"
          />

          {me ? (
            <NavListItem
              title={t`Create auction`}
              icon={CirclePlusIcon}
              href={`/${lang}/auctions/new`}
              className="flex justify-center items-center w-full"
            />
          ) : (
            <DisabledNavListItem
              title={t`Create auction`}
              icon={CirclePlusIcon}
              disabledLabel={t`Please log in to create auctions.`}
            />
          )}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};
