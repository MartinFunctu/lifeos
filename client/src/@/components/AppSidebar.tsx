import * as React from "react"
import {
    LayoutDashboard,
    LogOut,
    LineChart,
    ChevronRight,
    GalleryVerticalEnd,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import routes from 'routes'
import { pb } from "@/lib/pocketbase"

const navMain = [
    {
        title: "Dashboard",
        url: routes.ADMIN_DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Stats",
        url: routes.ADMIN_STATS,
        icon: LineChart, // Reusing LineChart for now, or could use another icon if imported
    },
    {
        title: "KPIs",
        url: routes.ADMIN_KPI,
        icon: LineChart,
        items: [
            {
                title: "Revenue",
                url: `${routes.ADMIN_KPI}?view=revenue`,
            },
            {
                title: "Churn Rate",
                url: `${routes.ADMIN_KPI}?view=churn`,
            },
            {
                title: "Membership Lifetime",
                url: `${routes.ADMIN_KPI}?view=lifetime`,
            },
            {
                title: "% Chargebacks/Refunds",
                url: `${routes.ADMIN_KPI}?view=refunds`,
            },
        ],
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        pb.authStore.clear()
        navigate(0) // Reload to trigger auth check
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navMain.map((item) => (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={location.pathname.startsWith(routes.ADMIN_KPI) && item.title === "KPIs"}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        {item.items ? (
                                            <>
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={item.title}
                                                    isActive={location.pathname === item.url && !location.search}
                                                >
                                                    <Link to={item.url}>
                                                        {item.icon && <item.icon />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                        <ChevronRight />
                                                        <span className="sr-only">Toggle</span>
                                                    </SidebarMenuAction>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={location.search === subItem.url.split('?')[1] && location.pathname === routes.ADMIN_KPI}>
                                                                    <Link to={subItem.url}>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </>
                                        ) : (
                                            <SidebarMenuButton
                                                asChild
                                                isActive={location.pathname === item.url}
                                                tooltip={item.title}
                                            >
                                                <Link to={item.url}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut />
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-semibold">Log out</span>
                                <span className="truncate text-xs">{pb.authStore.model?.email}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
