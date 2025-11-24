import { Trans, useLingui } from "@lingui/react/macro";
import Link from "next/link";
import { type FC, Suspense } from "react";
import { AuctionsCreateButton } from "@/app/_components/auctions/auctions-create-button";
import { AuctionsCreateButtonWithMe } from "@/app/_components/auctions/auctions-create-button-with-me";
import { TypographyH1 } from "@/app/_components/typography/h1";
import { TypographyLead } from "@/app/_components/typography/lead";
import { Button } from "@/components/ui/button";
import { ScrollDownButton } from "./scroll-down-button";

export const Hero: FC = () => {
  const { i18n } = useLingui();
  const { locale: lang } = i18n;

  return (
    <section className="flex flex-col items-center justify-between text-center min-h-[calc(100svh-6rem)] sm:min-h-[calc(100svh-12rem)]">
      <div className="h-full sm:max-w-3xl mx-auto my-auto space-y-6">
        <TypographyH1>
          <Trans>Discover, Bid & Win Unique Auctions</Trans>
        </TypographyH1>
        <TypographyLead>
          <Trans>
            Join our community-driven platform to find exclusive deals and
            one-of-a-kind items.
          </Trans>
        </TypographyLead>
        <div className="flex justify-center flex-wrap mt-8 gap-2 sm:gap-4">
          <Button>
            <Link href={`/${lang}/auctions`}>
              <Trans>Browse Auctions</Trans>
            </Link>
          </Button>

          <Suspense fallback={<AuctionsCreateButton disabled />}>
            <AuctionsCreateButtonWithMe />
          </Suspense>
        </div>
      </div>

      <ScrollDownButton lang={lang} />
    </section>
  );
};
