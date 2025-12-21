import { Fragment } from "react"
import { Link, useMatches } from "react-router"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Separator } from "~/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbValue = BreadcrumbItem | BreadcrumbItem[]

export type RouteHandle = {
  breadcrumb?: BreadcrumbValue | ((data: unknown) => BreadcrumbValue)
}

export function PageHeader() {
  const matches = useMatches()

  // Build breadcrumbs from matched routes
  const breadcrumbs: BreadcrumbItem[] = []

  for (const match of matches) {
    const handle = match.handle as RouteHandle | undefined
    if (handle?.breadcrumb) {
      const crumb =
        typeof handle.breadcrumb === "function"
          ? handle.breadcrumb(match.data)
          : handle.breadcrumb

      if (Array.isArray(crumb)) {
        breadcrumbs.push(...crumb)
      } else {
        breadcrumbs.push(crumb)
      }
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {breadcrumbs.length > 0 ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <span className="text-sm font-medium">TodoApp</span>
      )}
    </header>
  )
}
