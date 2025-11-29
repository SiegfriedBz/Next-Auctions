"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { ArrowRightFromLineIcon } from "lucide-react";
import { type FC, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AuthForm } from "./auth-form";

type Props = {
  onCloseSideSheet: () => void;
};

export const AuthSheetContent: FC<Props> = (props) => {
  const { onCloseSideSheet } = props;

  const [isLogin, setIsLogin] = useState<boolean>(true);

  const { t } = useLingui();

  const handleSwitchForm = useCallback(() => {
    setIsLogin((prev) => !prev);
  }, []);

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {isLogin ? (
            <Trans>Welcome back!</Trans>
          ) : (
            <Trans>Create your account.</Trans>
          )}
        </SheetTitle>

        <SheetDescription>
          {isLogin ? (
            <Trans>Enter your email and password to login.</Trans>
          ) : (
            <Trans>Fill in your details to create a new account.</Trans>
          )}
        </SheetDescription>
      </SheetHeader>

      <div
        className="flex flex-col gap-1.5 px-4 pb-4 animate-fade-in"
        key={isLogin.toString()}
      >
        <AuthForm isLogin={isLogin} onCloseSideSheet={onCloseSideSheet} />

        <Separator className="my-4" />

        <div className="flex items-center justify-end gap-x-2">
          <span className="max-sm:text-xs text-sm">
            {isLogin ? (
              <Trans>Don't have an account ? </Trans>
            ) : (
              <Trans>Already have an account ?</Trans>
            )}
          </span>

          <Button
            onClick={handleSwitchForm}
            variant={"secondary"}
            aria-label={t`Switch login/signup forms`}
            className="flex items-center gap-x-2 max-sm:text-xs text-sm cursor-pointer"
          >
            <ArrowRightFromLineIcon size={8} />
            {isLogin ? <Trans>Sign up</Trans> : <Trans>Login</Trans>}
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};
