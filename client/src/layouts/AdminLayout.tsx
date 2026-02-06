import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import useAuth from 'api/pb_auth/useAuth'
import routes from 'routes'
import { pb } from '@/lib/pocketbase'
import { LayoutDashboard, LineChart, LogOut, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  items?: { title: string; url: string }[]
}


export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isValid = pb.authStore.isValid;

  if (!isValid) {
    return <Navigate to={routes.ADMIN_LOGIN} replace={true} />;
  }

  const handleLogout = () => {
    pb.authStore.clear();
    navigate(0);
  };

  const userEmail = pb.authStore.model?.email || "Admin";
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#13111C] text-foreground font-sans selection:bg-purple-500/30">
      {/* Dot Grid Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#4A4955 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          opacity: 1,
        }}
      />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#13111C]/80 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-8">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                L
              </div>
              <span>LifeOS</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-white/10 hover:ring-white/20 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-purple-600 text-white font-bold text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-[#13111C] border-white/10 text-gray-400 shadow-2xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-16 h-screen overflow-hidden bg-[#13111C]">
        <Outlet />
      </main>
    </div>
  );
}


