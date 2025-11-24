"use client";

import { Trans } from "@lingui/react/macro";
import Link from "next/link";
import { useEffect } from "react";
import { TypographyH3 } from "@/app/_components/typography/h3";
import { TypographyH5 } from "@/app/_components/typography/h5";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-16 text-center">
      <div className="w-full">
        <TypographyH3>
          <Trans>Something went wrong!</Trans>
        </TypographyH3>
        <TypographyH5>
          <Trans>
            An unexpected error occurred. You can try reloading this page.
          </Trans>
        </TypographyH5>

        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <ButtonGroup>
            <Button onClick={() => reset()} variant="outline">
              <Trans>Try Again</Trans>
            </Button>
            <ButtonGroupSeparator />
            <Button onClick={() => location.reload()} variant="default">
              <Trans>Reload Page</Trans>
            </Button>
          </ButtonGroup>

          <Button asChild variant="link">
            <Link href="/en">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
