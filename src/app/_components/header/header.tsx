import { Trans, useLingui } from "@lingui/react/macro";
import Link from "next/link";
import type { FC } from "react";
import { Separator } from "@/components/ui/separator";
import { TypographyLead } from "../typography/lead";
import { NavLinks } from "./nav-links";

export const Header: FC = () => {
  return (
    <>
      <header className="flex justify-between items-center h-28 sm:h-32 md:h-32 px-4 sm:px-16">
        <Logo />
        <NavLinks />
      </header>
      <Separator />
    </>
  );
};

const Logo: FC = () => {
  const { i18n } = useLingui();
  const { locale: lang } = i18n;

  return (
    <Link href={`/${lang}/`} className="flex flex-col">
      <span className="font-extrabold text-2xl sm:text-3xl tracking-widest">
        GavL
      </span>
      <TypographyLead className="max-sm:hidden text-xs md:text-base mt-1">
        <Trans>Track Auctions. Effortlessly</Trans>
      </TypographyLead>
    </Link>
  );
};
