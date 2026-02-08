'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Plus, Eye } from 'lucide-react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Fine } from '../types'
import { fineSelectFields } from '../types'

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  analyzing: { label: 'Analyse en cours', color: 'bg-blue-100 text-blue-800' },
  reviewed: { label: 'Révisé par avocat', color: 'bg-purple-100 text-purple-800' },
  submitted: { label: 'Soumis aux autorités', color: 'bg-orange-100 text-orange-800' },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
}
const fallbackStatus = { label: 'Inconnu', color: 'bg-slate-100 text-slate-700' }

function getStatusConfig(status?: Fine['status'] | string | null) {
  return statusConfig[status as keyof typeof statusConfig] ?? fallbackStatus
}

function sortFinesByCreatedAtDesc(fines: Fine[]) {
  return [...fines].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function upsertFine(list: Fine[], incoming: Fine | null | undefined) {
  if (!incoming?.id) return list

  const existingIndex = list.findIndex((fine) => fine.id === incoming.id)
  if (existingIndex === -1) {
    // # Reason: Keep the dashboard ordering consistent with the initial `created_at` sort.
    return sortFinesByCreatedAtDesc([incoming, ...list])
  }

  const next = [...list]
  // # Reason: Supabase payloads may omit columns depending on replication settings.
  next[existingIndex] = { ...next[existingIndex], ...incoming }
  return next
}

function removeFine(list: Fine[], id: string | null | undefined) {
  if (!id) return list
  return list.filter((fine) => fine.id !== id)
}

function mergeFines(current: Fine[], incoming: Fine[]) {
  if (incoming.length === 0) return current

  const byId = new Map(current.map((fine) => [fine.id, fine]))

  for (const fine of incoming) {
    if (!fine?.id) continue
    const existing = byId.get(fine.id)
    byId.set(fine.id, existing ? { ...existing, ...fine } : fine)
  }

  // # Reason: Keep ordering consistent after merging paginated results and realtime updates.
  return sortFinesByCreatedAtDesc(Array.from(byId.values()))
}

export default function DashboardClient({
  user,
  initialFines,
  pageSize = 9,
}: {
  user: any
  initialFines: Fine[]
  pageSize?: number
}) {
  const [fines, setFines] = useState<Fine[]>(initialFines)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [isPreviewLoading, setIsPreviewLoading] = useState<string | null>(null)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(initialFines.length >= pageSize)
  // # Reason: Track how many rows were paginated to avoid offset shifts from realtime inserts.
  const [loadedCount, setLoadedCount] = useState(initialFines.length)
  const [useManualPagination, setUseManualPagination] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const supabase = useMemo(() => createBrowserClient(), [])

  useEffect(() => {
    setFines(initialFines)
    setHasMore(initialFines.length >= pageSize)
    setLoadedCount(initialFines.length)
    setLoadMoreError(null)
  }, [initialFines, pageSize])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('IntersectionObserver' in window)) {
      // # Reason: Provide a manual fallback when IntersectionObserver is unavailable or blocked.
      setUseManualPagination(true)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`fines-updates-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fines', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const eventType = payload.eventType

          setFines((current) => {
            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              return upsertFine(current, payload.new as Fine)
            }

            if (eventType === 'DELETE') {
              return removeFine(current, (payload.old as Fine | undefined)?.id)
            }

            return current
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user?.id])

  const loadMore = useCallback(async () => {
    if (!user?.id || isFetchingMore || !hasMore) return

    setIsFetchingMore(true)
    setLoadMoreError(null)

    const from = loadedCount
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('fines')
      .select(fineSelectFields)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching more fines:', error)
      const message = 'Impossible de charger plus d\'amendes.'
      toast.error(message)
      setLoadMoreError(message)
      setIsFetchingMore(false)
      return
    }

    const incoming = (data as Fine[]) || []

    setFines((current) => mergeFines(current, incoming))
    setLoadedCount((current) => current + incoming.length)
    setHasMore(incoming.length === pageSize)
    setLoadMoreError(null)
    setIsFetchingMore(false)
  }, [hasMore, isFetchingMore, loadedCount, pageSize, supabase, user?.id])

  const handleRetryLoadMore = useCallback(() => {
    // # Reason: Only retry pagination on explicit user intent after a failure.
    setLoadMoreError(null)
    loadMore()
  }, [loadMore])

  useEffect(() => {
    if (useManualPagination) return
    if (!loadMoreRef.current || !hasMore || isFetchingMore || loadMoreError) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, loadMore, loadMoreError, useManualPagination])

  const handleFilterChange = (status: string) => {
    setActiveFilter(status)
  }

  const handlePreviewFile = async (fine: Fine) => {
    if (!fine.file_url) {
      // Reason: We need the storage path (includes user folder) to create a signed URL.
      toast.error('Chemin du fichier introuvable. Réessayez après avoir re-téléchargé le document.')
      return
    }

    setIsPreviewLoading(fine.id)

    try {
      const { data, error } = await supabase.storage
        .from('fine-documents')
        .createSignedUrl(fine.file_url, 3600)

      if (error || !data?.signedUrl) {
        throw error ?? new Error('Signed URL non générée')
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL signée:', error)
      toast.error('Impossible de prévisualiser le fichier.')
    } finally {
      setIsPreviewLoading(null)
    }
  }

  const allStatuses = Object.keys(statusConfig) as (keyof typeof statusConfig)[]
  const filteredFines =
    activeFilter === 'all' ? fines : fines.filter((fine) => fine.status === activeFilter)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, {user.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/submit-fine">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle amende
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des amendes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fines.length}</div>
            <p className="text-xs text-muted-foreground">
              Amendes soumises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fines.filter(fine => !['resolved', 'rejected'].includes(fine.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Dossiers actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fines.filter(fine => fine.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Amendes annulées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtrer par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('all')}
              className="text-sm"
            >
              Tous ({fines.length})
            </Button>
            {allStatuses.map((status) => {
              const count = fines.filter(fine => fine.status === status).length
              const config = getStatusConfig(status)
              return (
                <Button
                  key={status}
                  variant={activeFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(status)}
                  className={`text-sm ${activeFilter === status ? '' : config.color}`}
                >
                  {config.label} ({count})
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fines Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Mes amendes</CardTitle>
          <CardDescription>
            {activeFilter === 'all'
              ? 'Historique de vos contestations d\'amendes'
              : `Amendes avec le statut: ${getStatusConfig(activeFilter).label}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFines.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {activeFilter === 'all'
                  ? 'Aucune amende soumise'
                  : `Aucune amende avec le statut "${getStatusConfig(activeFilter).label}"`
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeFilter === 'all'
                  ? 'Commencez par soumettre votre première amende pour contestation.'
                  : 'Essayez de changer le filtre ou soumettez une nouvelle amende.'
                }
              </p>
              {activeFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/submit-fine">
                    <Plus className="w-4 h-4 mr-2" />
                    Soumettre une amende
                  </Link>
                </Button>
                )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFines.map((fine) => (
                <Card
                  key={fine.id}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-border"
                >
                  <CardContent className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-end mb-4">
                      <Badge className={getStatusConfig(fine.status).color}>
                        {getStatusConfig(fine.status).label}
                      </Badge>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-foreground">
                        Amende #{fine.fine_number}
                      </h3>

                      {fine.fine_amount && (
                        <div className="text-xl font-bold text-foreground">
                          €{fine.fine_amount}
                        </div>
                      )}

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Véhicule:</span>
                          <span>{fine.vehicle_plate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(fine.fine_date).toLocaleDateString('fr-FR')}</span>
                        </div>

                        {fine.location && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Lieu:</span>
                            <span>{fine.location}</span>
                          </div>
                        )}
                      </div>

                      {fine.user_notes && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Note:</span> {fine.user_notes}
                        </div>
                      )}

                      {/* Preview Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewFile(fine)}
                          disabled={isPreviewLoading === fine.id}
                          className="w-full"
                        >
                          {isPreviewLoading === fine.id ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Prévisualiser le fichier
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Mis à jour: {new Date(fine.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
          {isFetchingMore && (
            <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Chargement d'autres amendes...
            </div>
          )}
          {loadMoreError && (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
              <p>{loadMoreError}</p>
              <Button variant="outline" size="sm" onClick={handleRetryLoadMore}>
                Réessayer
              </Button>
            </div>
          )}
          {hasMore && !loadMoreError && (
            <div className="flex items-center justify-center py-6">
              <Button variant="outline" size="sm" onClick={loadMore} disabled={isFetchingMore}>
                {isFetchingMore ? 'Chargement...' : 'Charger plus'}
              </Button>
            </div>
          )}
          {!hasMore && fines.length > 0 && (
            <p className="text-center text-xs text-muted-foreground pt-4">
              Vous avez atteint la fin de la liste.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
