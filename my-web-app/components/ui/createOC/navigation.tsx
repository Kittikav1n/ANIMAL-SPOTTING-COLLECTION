"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, BookOpen, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { label: "Map", href: "/map", icon: Compass },
  { label: "Collection", href: "/collection", icon: BookOpen },
  { label: "Profile", href: "/profile", icon: User },
]

export function Navigation() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const navItems = [
    { label: "Map", href: "/map", icon: Compass },
    { label: "Collection", href: "/collection", icon: BookOpen },
    {
      label: isLoading ? "…" : user ? "Profile" : "Login",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center gap-8 bg-card py-8 sm:flex z-50">
        <div className="flex flex-col items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isProfile = item.href === "/profile"
            const isActive =
              pathname === item.href ||
              (item.href === "/map" && pathname === "/")


            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className={`p-2.5 rounded-full transition-all ${isActive ? "bg-accent text-secondary" : ""}`}>
                  {isProfile && user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt=""
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <Icon className="size-6 stroke-[2]" />
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-around border-t border-border bg-card/95 px-4 backdrop-blur-md sm:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isProfile = item.href === "/profile"
          const isActive =
            pathname === item.href ||
            (item.href === "/map" && pathname === "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <div
                className={`flex items-center justify-center rounded-full transition-all ${isActive ? "bg-accent text-secondary px-4 py-1.5" : "px-4 py-1.5"
                  }`}
              >
                {isProfile && user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="size-7 rounded-full object-cover"
                  />
                ) : (
                  <Icon className="size-6 stroke-[2]" />
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}