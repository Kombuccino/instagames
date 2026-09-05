import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'minifugg:core-economy-mock:v2'
const EVENT_NAME = 'minifugg:coin-balance'
const FREE_DAILY_ALLOWANCE = 40

type StoredEconomy = {
  day: string
  dailyCoins: number
  durableCoins: number
}

function todayId() {
  return new Date().toISOString().slice(0, 10)
}

function readStore(): StoredEconomy {
  if (typeof window === 'undefined') return { day: todayId(), dailyCoins: FREE_DAILY_ALLOWANCE, durableCoins: 0 }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredEconomy>
      const durableCoins = Number.isFinite(parsed.durableCoins) ? Math.max(0, Math.trunc(parsed.durableCoins!)) : 0
      if (parsed.day === todayId() && Number.isFinite(parsed.dailyCoins)) {
        return { day: todayId(), dailyCoins: Math.max(0, Math.trunc(parsed.dailyCoins!)), durableCoins }
      }
      return { day: todayId(), dailyCoins: FREE_DAILY_ALLOWANCE, durableCoins }
    }
  } catch {
    // The prototype economy must never block discovery.
  }
  return { day: todayId(), dailyCoins: FREE_DAILY_ALLOWANCE, durableCoins: 0 }
}

function writeStore(next: StoredEconomy) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next.dailyCoins + next.durableCoins }))
  } catch {
    // Keep the UI usable if persistence is unavailable.
  }
}

export function gameCoinCost(status: 'fugg' | 'beta' | 'trash' | undefined) {
  if (status === 'beta') return 1
  if (status === 'trash') return 0
  return 2
}

export function useCoreCoinBalance() {
  const [balance, setBalance] = useState(() => {
    const store = readStore()
    return store.dailyCoins + store.durableCoins
  })

  useEffect(() => {
    const refresh = () => {
      const store = readStore()
      setBalance(store.dailyCoins + store.durableCoins)
    }
    const onBalance = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail)
      if (Number.isFinite(value)) setBalance(Math.max(0, Math.trunc(value)))
      else refresh()
    }
    window.addEventListener(EVENT_NAME, onBalance)
    window.addEventListener('storage', refresh)
    refresh()
    return () => {
      window.removeEventListener(EVENT_NAME, onBalance)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const spend = useCallback((cost: number) => {
    const amount = Math.max(0, Math.trunc(cost))
    const store = readStore()
    if (store.dailyCoins + store.durableCoins < amount) return false
    const fromDaily = Math.min(store.dailyCoins, amount)
    store.dailyCoins -= fromDaily
    store.durableCoins -= amount - fromDaily
    writeStore(store)
    setBalance(store.dailyCoins + store.durableCoins)
    return true
  }, [])

  return { balance, spend, mock: true as const }
}
