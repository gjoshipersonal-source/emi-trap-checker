'use client'

import { useMemo, useState } from 'react'

function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100

  if (!principal || !months) return 0

  if (monthlyRate === 0) return principal / months

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
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {screen === 'intro' && (
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
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
            onClick={() => setScreen('scan')}
            className="mt-20 bg-white text-black px-10 py-5 rounded-[30px] text-2xl font-black active:scale-95 transition"
          >
            Mera Future Scan Karo
          </button>
        </section>
      )}

      {screen === 'scan' && (
        <section className="min-h-screen px-5 py-10 flex flex-col justify-center">
          <div className="bg-white/5 border border-white/10 rounded-[35px] p-6 backdrop-blur-xl">
            <h2 className="text-4xl font-black">
              💰 Monthly Income
            </h2>

            <input
              type="range"
              min="10000"
              max="300000"
              step="1000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full mt-10"
            />

            <p className="text-5xl font-black mt-5">
              ₹{income.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[35px] p-6 mt-5 backdrop-blur-xl">
            <h2 className="text-4xl font-black">
              🏦 Loan Amount
            </h2>

            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={loan}
              onChange={(e) => setLoan(Number(e.target.value))}
              className="w-full mt-10"
            />

            <p className="text-5xl font-black mt-5">
              ₹{loan.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="bg-white/5 border border-white/10 rounded-[30px] p-5">
              <h3 className="font-black">
                🔥 Interest
              </h3>

              <input
                type="range"
                min="1"
                max="36"
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value))}
                className="w-full mt-6"
              />

              <p className="text-4xl font-black mt-3">
                {interest}%
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[30px] p-5">
              <h3 className="font-black">
                ⏳ Months
              </h3>

              <input
                type="range"
                min="6"
                max="84"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full mt-6"
              />

              <p className="text-4xl font-black mt-3">
                {months}
              </p>
            </div>
          </div>

          <button
            onClick={() => setScreen('result')}
            className="mt-8 bg-white text-black py-5 rounded-[30px] text-2xl font-black"
          >
            Sach Dikhao
          </button>
        </section>
      )}

      {screen === 'result' && (
        <section className="min-h-screen px-5 py-10 flex flex-col justify-center">
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 text-center backdrop-blur-xl">
            <div className="text-[120px]">
              {ratio > 50 ? '💀' : ratio > 30 ? '⚠️' : '✅'}
            </div>

            <h2 className="text-5xl font-black mt-8">
              {ratio}% pressure
            </h2>

            <p className="text-2xl font-black mt-10">
              Monthly EMI
            </p>

            <p className="text-7xl font-black text-red-400 mt-5">
              ₹{Math.round(emi).toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={() => setScreen('intro')}
            className="mt-8 border border-white/10 bg-white/5 py-5 rounded-[30px] text-2xl font-black"
          >
            Phir Se Scan
          </button>
        </section>
      )}
    </main>
  )
}