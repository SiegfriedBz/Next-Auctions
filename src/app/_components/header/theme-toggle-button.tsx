"use client";

import { Trans } from "@lingui/react/macro";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  className?: string;
};

export const ThemeToggleButton: FC<Props> = (props) => {
  const { className } = props;
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="ghost"
          className="group cursor-pointer min-w-full rounded-md px-2 gap-x-2 flex justify-start items-center dark:hover:bg-input/50 "
        >
          <span className="inline-flex relative w-4 h-8 opacity-50 group-hover:opacity-100 group-hover:font-extrabold transition-all duration-200">
            <Sun className="absolute top-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] scale-100 transition-all dark:scale-0" />
            <Moon className="absolute top-1/2 -translate-y-1/2  h-[1.2rem] w-[1.2rem] scale-0 transition-all dark:scale-100" />
          </span>
          <Trans>Toggle theme</Trans>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="mt-2">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Trans>Light</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Trans>Dark</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Trans>System</Trans>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
