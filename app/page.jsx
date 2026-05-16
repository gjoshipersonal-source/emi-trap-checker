'use client'

import { useMemo, useState } from 'react'

function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100

  if (!principal || !months) return 0

  if (monthlyRate === 0) {
    return principal / months
  }

  return (
    (principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  )
}

export default function Home() {
  const [screen, setScreen] = useState('intro')

  const [income, setIncome] = useState(50000)
  const [loan, setLoan] = useState(300000)
  const [interest, setInterest] = useState(14)
  const [months, setMonths] = useState(36)

  const emi = useMemo(() => {
    return calculateEMI(loan, interest, months)
  }, [loan, interest, months])

  const ratio = Math.round((emi / income) * 100)

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {screen === 'intro' && (
        <>
          <div className="text-[120px] animate-pulse">
            💸
          </div>

          <h1 className="text-center text-6xl font-black leading-[0.9] mt-10">
            EMI slowly
            <br />
            <span className="text-red-400">
              freedom kha jaati hai.
            </span>
          </h1>

          <button
            onClick={() => setScreen('result')}
            className="mt-20 bg-white text-black px-10 py-5 rounded-[30px] text-2xl font-black"
          >
            Mera Future Scan Karo
          </button>
        </>
      )}

      {screen === 'result' && (
        <>
          <div className="text-[100px]">
            {ratio > 50 ? '💀' : ratio > 30 ? '⚠️' : '✅'}
          </div>

          <h2 className="text-5xl font-black mt-8">
            {ratio}% pressure
          </h2>

          <p className="text-2xl mt-6 text-center">
            Monthly EMI:
            <br />
            ₹{Math.round(emi).toLocaleString('en-IN')}
          </p>

          <button
            onClick={() => setScreen('intro')}
            className="mt-12 border border-white/20 px-10 py-5 rounded-[30px]"
          >
            Phir Se Scan
          </button>
        </>
      )}
    </main>
  )
}