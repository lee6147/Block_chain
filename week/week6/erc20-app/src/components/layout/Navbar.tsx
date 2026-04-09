"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "@/components/web3/ConnectWallet";
import NetworkStatus from "@/components/web3/NetworkStatus";
import { useState } from "react";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/tutorial", label: "튜토리얼" },
  { href: "/deploy-guide", label: "배포 가이드" },
  { href: "/token-interact", label: "토큰 실습" },
  { href: "/faucet", label: "퍼셋" },
  { href: "/dashboard", label: "대시보드" },
  { href: "/quiz", label: "퀴즈" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="text-lg font-bold">
          ERC20 튜토리얼
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 지갑 + 네트워크 */}
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <ConnectWallet />
          {/* 모바일 햄버거 */}
          <button
            className="ml-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className="border-t px-4 pb-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
