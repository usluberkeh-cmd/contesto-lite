'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardClient from './_components/dashboard-client'
import type { Fine } from './types'
import { fineSelectFields } from './types'

const PAGE_SIZE = 9

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])
  const [user, setUser] = useState<any>(null)
  const [initialFines, setInitialFines] = useState<Fine[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const skeletonCards = Array.from({ length: PAGE_SIZE })

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!isMounted) return

      if (userError || !user) {
        router.replace('/login')
        setIsInitialLoading(false)
        return
      }

      setUser(user)

      const { data: fines, error: finesError } = await supabase
        .from('fines')
        .select(fineSelectFields)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)

      if (!isMounted) return

      if (finesError) {
        console.error('Error fetching fines:', finesError)
      }

      setInitialFines((fines as Fine[]) || [])
      setIsInitialLoading(false)
    }

    loadDashboard()

    return () => {
      // # Reason: Avoid setting state after navigating away from the dashboard.
      isMounted = false
    }
  }, [router, supabase])

  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`stat-skeleton-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16" />
                <Skeleton className="mt-2 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`filter-skeleton-${index}`} className="h-8 w-24" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skeletonCards.map((_, index) => (
                <Card key={`fine-skeleton-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-end mb-4">
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-7 w-20" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardClient
      user={user}
      initialFines={initialFines}
      pageSize={PAGE_SIZE}
    />
  )
}
