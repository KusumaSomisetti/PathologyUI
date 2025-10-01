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
  // Read current user whenever the route changes (e.g., after logging in)
  useEffect(() => {
    setUser(authenticationService.currentUserValue ?? null);
  }, [pathname]);

  const showUser = !!user && pathname?.startsWith("/cases");

  const displayName = user?.name;

  const onAction = (key: string | number) => {
    if (key === "signature") {
      setSigOpen(true); // change to your real route
    }
    if (key === "signout") {
      authenticationService.logout();
      setUser(null);
      router.replace("/");
    }
  };

  return (
    <header className="w-full bg-[#07214A] h-11 px-3 flex items-center justify-between">
      <Image src="/livo-mono.png" alt="LIVO Logo" width={77} height={19} priority />

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
            className="w-50px"
            itemClasses={{
              base: "data-[hover=true]:bg-default-100",
            }}
          >
            {/* Header block (read-only) */}
            <DropdownItem key="profile-header" isReadOnly className="cursor-default">
              <div className="flex gap-3">
                <div className="py-0.5">
                  <div className="text-sm font-semibold">My profile</div>
                  <div className="mt-1 text-sm leading-tight">
                    <div className="font-medium">{displayName}</div>
                    <div className="text-foreground-500">{user?.email}</div>
                  </div>
                </div>
              </div>
            </DropdownItem>

            <DropdownItem key="signature" className="text-primary underline underline-offset-2">
              Upload signature
            </DropdownItem>

            <DropdownItem key="signout">
              Sign out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : null}
      <SignatureDialog open={sigOpen} onClose={() => setSigOpen(false)} />
    </header>


  );
}
