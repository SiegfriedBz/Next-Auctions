import { Trans, useLingui } from "@lingui/react/macro";
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { LinkPreview } from "@/components/ui/link-preview";
import { TypographyH6 } from "./typography/h6";

const ADMIN_LINK = process.env.ADMIN_LINK ?? "https://github.com/SiegfriedBz";

export const Footer: FC = () => {
  const { i18n } = useLingui();
  const { locale: lang } = i18n;

  return (
    <footer className="flex flex-col py-4 sm:pb-8 gap-2 sm:gap-4 items-center justify-center">
      <div className="flex gap-2 items-center">
        <TypographyH6>© {new Date().getFullYear()}</TypographyH6>

        <Link href={`/${lang}/`} scroll>
          <TypographyH6>
            GavL | <Trans>Track Auctions. Effortlessly.</Trans>
          </TypographyH6>
        </Link>
      </div>

      <LinkPreview url={ADMIN_LINK}>
        <span className="inline-flex items-center gap-1">
          <TypographyH6>Made with</TypographyH6>
          <HeartIcon className="text-red-400 size-4" />
          <TypographyH6>by Siegfried</TypographyH6>
        </span>
      </LinkPreview>
    </footer>
  );
};
