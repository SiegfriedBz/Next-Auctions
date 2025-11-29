"use client";

import { useLingui } from "@lingui/react/macro";
import type { FC } from "react";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { User } from "@/core/domains/user";
import { cn } from "@/lib/utils";
import { LogOutButton } from "../../auth/log-out-button";
import { UserAvatar } from "../../user-avatar";
import { NavListItem } from "../nav-list-item";
import { navMenuItemClasses } from "../navigation-menu-classes";
import { getUserNavLinks } from "./get-user-nav-links";

type Props = {
  me: User;
};

export const UserMenu: FC<Props> = (props) => {
  const { me } = props;

  const { i18n } = useLingui();
  const { locale: lang } = i18n;

  if (!me) return null;

  const userNavLinks = getUserNavLinks(lang);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={cn("h-10 sm:h-12", navMenuItemClasses)}>
        <UserAvatar
          user={me}
          onlyAvatar
          className={navMenuItemClasses}
          avatarClassName="size-10 sm:size-12 bg-transparent opacity-90 hover:opacity-100 transition-all duration-200"
        />
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <ul className="grid w-58 gap-2 grid-cols-1">
          {userNavLinks.map((c) => (
            <NavListItem
              key={c.title.id}
              title={i18n._(c.title)}
              icon={c.icon}
              href={c.href}
            />
          ))}

          <li>
            <NavigationMenuLink asChild>
              <LogOutButton className="h-8 sm:h-10 text-sm leading-none font-medium flex flex-row justify-end items-center gap-x-2" />
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};
