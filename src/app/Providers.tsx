"use client";

import { HeroUIProvider } from "@heroui/react";
import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider>
            {children}
        </HeroUIProvider>
    );
}