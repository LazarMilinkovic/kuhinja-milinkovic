import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { HistoryEntry, HistoryDaySummary, DayIndex } from '@/types'

function toHistory(row: Record<string, unknown>): HistoryEntry {
  return {
    id: row.id as string,
    weekStart: row.week_start as number,
    daySummaries: (row.day_summaries ?? []) as HistoryDaySummary[],
    createdAt: row.created_at as number,
  }
}

export function useHistory(limit = 20): HistoryEntry[] {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase
      .from('history')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(limit)
    if (data) setHistory(data.map((r) => toHistory(r as Record<string, unknown>)))
  }, [limit])

  useEffect(() => {
    fetchHistory()
    const channel = supabase
      .channel('history-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, fetchHistory)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchHistory])

  return history
}

export async function deleteHistoryEntry(id: string) {
  await supabase.from('history').delete().eq('id', id)
}
