"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authenticationService } from "./Authentication"; // <- adjust relative path
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Button } from "@heroui/button";
import SignatureDialog from "./SignatureDialog";

type UserLike = {
  name?: string;
  full_name?: string;
  user_name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  [k: string]: any;
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserLike | null>(null);
  const [sigOpen, setSigOpen] = useState(false);

  // Refresh current user on route change (e.g., right after login)
  useEffect(() => {
    setUser(authenticationService.currentUserValue ?? null);
  }, [pathname]);

  // same condition you already use for the username on the right
  const showUser = !!user && pathname?.startsWith("/cases");
  const displayName = user?.name;

  const onAction = (key: string | number) => {
    if (key === "signature") setSigOpen(true);
    if (key === "signout") {
      authenticationService.logout();
      setUser(null);
      router.replace("/");
    }
  };

  return (
    <header className="w-full bg-[#07214A] h-11 px-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        {showUser ? (
          <button
            aria-label="Open sidebar"
            className="xl:hidden inline-flex items-center justify-center rounded-md px-1 py-1 shadow"
            onClick={() => window.dispatchEvent(new CustomEvent("open-sidebar"))}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}

        <Image src="/livo-mono.png" alt="LIVO Logo" width={77} height={19} priority />
      </div>

      {showUser ? (
        <Dropdown placement="bottom-end" offset={6}>
          <DropdownTrigger>
            <Button
              variant="light"
              className="text-white text-medium font-bold data-[hover=true]:bg-white/10 h-8 px-3"
              endContent={<span className="ml-1 text-white/80">▾</span>}
            >
              {displayName}
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="User menu"
            onAction={onAction}
            itemClasses={{ base: "data-[hover=true]:bg-default-100" }}
          >
            <DropdownItem key="profile-header" isReadOnly className="cursor-default">
              <div className="text-sm">
                <div className="font-semibold">My profile</div>
                <div className="mt-1">
                  <div className="font-medium">{displayName}</div>
                  <div className="text-foreground-500">{user?.email}</div>
                </div>
              </div>
            </DropdownItem>

            <DropdownItem key="signature" className="text-primary underline underline-offset-2">
              Upload signature
            </DropdownItem>

            <DropdownItem key="signout">Sign out</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        // keep layout stable when logged out (optional spacer)
        <div className="w-0" />
      )}

      <SignatureDialog open={sigOpen} onClose={() => setSigOpen(false)} />
    </header>
  );
}
