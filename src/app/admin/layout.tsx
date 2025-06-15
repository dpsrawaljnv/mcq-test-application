"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      router.push("/")
      return
    }

    setMounted(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    router.push("/")
  }

  if (!mounted) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Teachers", href: "/admin/teachers" },
    { name: "Tests", href: "/admin/tests" },
    { name: "Performance", href: "/admin/performance" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden fixed top-4 left-4">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4 mt-4">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                {item.name}
              </Button>
            ))}
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full mt-4"
            >
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex min-h-screen">
        <div className="w-64 bg-white border-r">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push(item.href)}
                  >
                    {item.name}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
