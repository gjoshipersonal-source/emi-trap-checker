'use client'

import { useEffect, useMemo, useState } from 'react'

function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100

  if (!principal || !months) return 0
  if (monthlyRate === 0) return principal / months

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  )
}

function formatINR(value) {
  return `₹${Math.round(value || 0).toLocaleString('en-IN')}`
}

function runSelfTests() {
  const zeroInterest = calculateEMI(120000, 0, 12)
  console.assert(Math.round(zeroInterest) === 10000, 'Zero-interest EMI test failed')

  const normalEMI = calculateEMI(100000, 12, 12)
  console.assert(normalEMI > 8800 && normalEMI < 8900, 'Standard EMI test failed')

  console.assert(formatINR(30000) === '₹30,000', 'INR formatting test failed')
}

const presets = {
  income: [15000, 25000, 30000, 50000, 75000, 100000],
  expenses: [8000, 12000, 18000, 25000, 40000, 60000],
  existingEMI: [0, 3000, 5000, 10000, 15000, 25000],
  loanAmount: [50000, 100000, 300000, 500000, 1000000, 1500000],
  interest: [8, 10, 12, 15, 18, 24],
  tenure: [6, 12, 24, 36, 48, 60],
  emergencyFund: [0, 5000, 10000, 30000, 100000, 300000]
}

const purposes = [
  { value: 'phone', emoji: '📱', label: 'Phone', interest: 15 },
  { value: 'bike', emoji: '🏍️', label: 'Bike', interest: 11 },
  { value: 'education', emoji: '🎓', label: 'Education', interest: 10 },
  { value: 'business', emoji: '💼', label: 'Business', interest: 13 },
  { value: 'travel', emoji: '✈️', label: 'Travel', interest: 18 },
  { value: 'status', emoji: '💎', label: 'Status', interest: 20 },
  { value: 'emergency', emoji: '🚨', label: 'Emergency', interest: 16 },
  { value: 'other', emoji: '➕', label: 'Other', interest: 12 }
]

export default function EMITrapChecker() {
  const [screen, setScreen] = useState('intro')
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState('hinglish')
  const [soundOn, setSoundOn] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Ask me if this loan is safe, risky, or how to reduce EMI pressure.' }
  ])

  const [income, setIncome] = useState(30000)
  const [expenses, setExpenses] = useState(12000)
  const [existingEMI, setExistingEMI] = useState(0)
  const [purpose, setPurpose] = useState('phone')
  const [loanAmount, setLoanAmount] = useState(300000)
  const [interest, setInterest] = useState(15)
  const [tenure, setTenure] = useState(36)
  const [emergencyFund, setEmergencyFund] = useState(10000)
  const [customMode, setCustomMode] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      runSelfTests()
    }
  }, [])

  const t = {
    hinglish: {
      introA: 'EMI slowly',
      introB: 'freedom kha jaati hai.',
      start: 'Mera Future Scan Karo',
      analyzing: 'Tumhari money reality scan ho rahi hai...',
      reveal: 'Sach Dikhao',
      again: 'Phir Se Scan',
      viewTruth: 'Sach Dekho',
      hideTruth: 'Sach Chhupao',
      shareResult: 'Result Share Karo',
      shareStory: 'Story Card Banao',
      moneyLine: 'Ye EMI tumhari freedom ka',
      moneyLineEnd: 'kha sakti hai.',
      lateA: 'Zyada log late samajhte hain.',
      lateB: 'Tum pehle dekh rahe ho.',
      scanLines: [
        'Income pressure check ho raha hai',
        'Emergency weakness scan ho rahi hai',
        'Interest burn calculate ho raha hai',
        'Brutal reality ready ho rahi hai'
      ]
    },
    english: {
      introA: 'EMIs slowly',
      introB: 'eat your freedom.',
      start: 'Scan My Future',
      analyzing: 'Scanning your money reality...',
      reveal: 'Reveal Reality',
      again: 'Scan Again',
      viewTruth: 'View Truth',
      hideTruth: 'Hide Truth',
      shareResult: '{t.shareResult}',
      shareStory: 'Create Story Card',
      moneyLine: 'This EMI may consume',
      moneyLineEnd: 'of your freedom.',
      lateA: '{t.lateA}',
      lateB: 'You are checking early.',
      scanLines: [
        'Reading income pressure',
        'Checking emergency weakness',
        'Calculating interest burn',
        'Preparing reality shock'
      ]
    }
  }[language]

  const playTone = (type = 'tap') => {
    if (!soundOn || typeof window === 'undefined') return

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audio = new AudioContext()
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()

      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.type = type === 'danger' ? 'sawtooth' : 'sine'
      oscillator.frequency.value = type === 'danger' ? 110 : type === 'success' ? 680 : 420
      gain.gain.setValueAtTime(0.06, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.16)
      oscillator.start(audio.currentTime)
      oscillator.stop(audio.currentTime + 0.16)
    } catch {
      // Audio unsupported.
    }
  }

  const result = useMemo(() => {
    const emi = calculateEMI(loanAmount, interest, tenure)
    const totalPayable = emi * tenure
    const totalInterest = totalPayable - loanAmount
    const totalEMI = emi + existingEMI
    const emiRatio = income > 0 ? (totalEMI / income) * 100 : 0
    const remaining = income - expenses - totalEMI
    const emergencyMonths = expenses > 0 ? emergencyFund / expenses : 0

    let score = emiRatio * 1.25

    if (remaining < 10000) score += 10
    if (remaining < 5000) score += 18
    if (remaining < 2000) score += 22
    if (remaining < 0) score += 25
    if (emergencyMonths < 3) score += 15
    if (emergencyMonths < 1) score += 15
    if (['phone', 'travel', 'status'].includes(purpose)) score += 12
    if (['business', 'education'].includes(purpose)) score -= 5

    score = Math.max(0, Math.min(Math.round(score), 100))

    let mood = {
      emoji: '✅',
      label: 'CONTROLLED',
      headline: 'This EMI looks manageable.',
      line: 'Debt still needs discipline, but your numbers are not screaming danger.',
      color: 'text-emerald-300',
      glow: 'shadow-emerald-500/20',
      bar: 'from-emerald-400 to-lime-200'
    }

    if (score >= 75) {
      mood = {
        emoji: '💀',
        label: 'DAMAGE DETECTED',
        headline: 'This loan can trap your next few years.',
        line: 'Your EMI is not just a payment. It is monthly pressure on your freedom.',
        color: 'text-red-300',
        glow: 'shadow-red-500/30',
        bar: 'from-red-700 via-red-400 to-orange-200'
      }
    } else if (score >= 55) {
      mood = {
        emoji: '⚠️',
        label: 'HIGH PRESSURE',
        headline: 'This EMI is eating too much income.',
        line: 'One bad month can turn this plan into stress.',
        color: 'text-orange-300',
        glow: 'shadow-orange-500/30',
        bar: 'from-orange-600 to-yellow-200'
      }
    } else if (score >= 35) {
      mood = {
        emoji: '🟡',
        label: 'CAUTION',
        headline: 'This loan needs caution, not confidence.',
        line: 'It may work only if income stays stable and expenses stay controlled.',
        color: 'text-yellow-300',
        glow: 'shadow-yellow-500/20',
        bar: 'from-yellow-500 to-yellow-200'
      }
    }

    const safeEMI = Math.max(income * 0.25 - existingEMI, 0)
    const daysLost = income > 0 ? Math.min(Math.round((emi / income) * 30), 30) : 0
    const stress = [
      { label: 'EMI Pressure', value: Math.min(emiRatio, 100), icon: '💸' },
      {
        label: 'Savings Damage',
        value: remaining <= 0 ? 100 : remaining < 5000 ? 88 : remaining < 10000 ? 60 : 25,
        icon: '📉'
      },
      {
        label: 'Emergency Risk',
        value: emergencyMonths < 1 ? 96 : emergencyMonths < 3 ? 72 : 24,
        icon: '🚨'
      },
      {
        label: 'Interest Burn',
        value: loanAmount ? Math.min((totalInterest / loanAmount) * 100, 100) : 0,
        icon: '🔥'
      }
    ]

    return {
      emi,
      totalPayable,
      totalInterest,
      totalEMI,
      emiRatio,
      remaining,
      emergencyMonths,
      score,
      mood,
      safeEMI,
      daysLost,
      stress
    }
  }, [income, expenses, existingEMI, purpose, loanAmount, interest, tenure, emergencyFund])

  const questions = [
    { key: 'income', icon: '💰', title: 'Monthly income?', value: income, set: setIncome, type: 'money', presets: presets.income },
    { key: 'expenses', icon: '📉', title: 'Monthly burn?', value: expenses, set: setExpenses, type: 'money', presets: presets.expenses },
    { key: 'existing', icon: '🧾', title: 'Existing EMI?', value: existingEMI, set: setExistingEMI, type: 'money', presets: presets.existingEMI },
    { key: 'purpose', icon: '🎯', title: 'Why this loan?', type: 'purpose' },
    { key: 'loan', icon: '🏦', title: 'Loan amount?', value: loanAmount, set: setLoanAmount, type: 'money', presets: presets.loanAmount },
    { key: 'interest', icon: '🔥', title: 'Interest rate?', value: interest, set: setInterest, type: 'percent', presets: presets.interest },
    { key: 'tenure', icon: '⏳', title: 'Loan duration?', value: tenure, set: setTenure, type: 'months', presets: presets.tenure },
    { key: 'emergency', icon: '🛡️', title: 'Emergency fund?', value: emergencyFund, set: setEmergencyFund, type: 'money', presets: presets.emergencyFund }
  ]

  const current = questions[step]

  const next = () => {
    playTone('tap')
    setCustomMode(false)

    if (step === questions.length - 1) {
      setScreen('analyzing')
      setTimeout(() => {
        setScreen('result')
        playTone(result.score >= 55 ? 'danger' : 'success')
      }, 2300)
      return
    }

    setStep(step + 1)
  }

  const back = () => {
    playTone('tap')
    setCustomMode(false)

    if (step === 0) {
      setScreen('intro')
      return
    }

    setStep(step - 1)
  }

  const resetScan = () => {
    setScreen('intro')
    setStep(0)
    setShowDetails(false)
    setCustomMode(false)
    setChatOpen(false)
  }

  const copyResult = async () => {
    playTone('success')
    const text = `My EMI Risk: ${result.score}/100\n${result.mood.headline}\nEMI: ${formatINR(result.emi)}\nMoney left: ${formatINR(result.remaining)}\nChecked on Goviox EMI Trap Checker`

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard unsupported.
    }
  }

  const downloadCard = () => {
    playTone('success')
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, 1080, 1920)
    ctx.fillStyle = '#111111'
    roundRect(ctx, 70, 100, 940, 1720, 54)
    ctx.fill()
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 46px Arial'
    ctx.fillText('GOVIOX EMI TRAP CHECKER', 115, 205)
    ctx.font = '120px Arial'
    ctx.fillText(result.mood.emoji, 115, 380)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 82px Arial'
    wrap(ctx, result.mood.headline, 115, 520, 830, 92)
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 150px Arial'
    ctx.fillText(`${result.score}/100`, 115, 890)
    ctx.fillStyle = '#d1d5db'
    ctx.font = '44px Arial'
    ctx.fillText(`EMI: ${formatINR(result.emi)}`, 115, 1040)
    ctx.fillText(`Money left: ${formatINR(result.remaining)}`, 115, 1125)
    ctx.fillText(`Interest burn: ${formatINR(result.totalInterest)}`, 115, 1210)
    ctx.fillText(`Salary days lost: ${result.daysLost} days/month`, 115, 1295)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 38px Arial'
    ctx.fillText('Reality:', 115, 1460)
    ctx.fillStyle = '#d1d5db'
    ctx.font = '34px Arial'
    wrap(ctx, result.mood.line, 115, 1530, 830, 52)
    ctx.fillStyle = '#6b7280'
    ctx.font = '30px Arial'
    ctx.fillText('Presented by Goviox — Govind Joshi', 115, 1740)

    const link = document.createElement('a')
    link.download = 'emi-trap-story.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const sendChat = () => {
    if (!chatInput.trim()) return

    const text = chatInput.trim()
    setChatInput('')
    const answer = getAnswer(text, result)
    setChatMessages([...chatMessages, { role: 'user', text }, { role: 'assistant', text: answer }])
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#030303] text-white">
      <style jsx global>{`
        @keyframes enter {
          from { opacity: 0; transform: translateY(28px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: .35; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.08); }
        }

        @keyframes scan {
          0% { transform: translateY(-120%); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(420%); opacity: 0; }
        }

        @keyframes flash {
          0%, 100% { opacity: .15; }
          50% { opacity: .55; }
        }
      `}</style>

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,.28),transparent_28%),radial-gradient(circle_at_0%_70%,rgba(6,182,212,.12),transparent_30%),radial-gradient(circle_at_100%_80%,rgba(249,115,22,.16),transparent_32%)]" />
      <div className="fixed left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />

      <div className="relative z-10 mx-auto min-h-screen max-w-md px-5">
        <header className="flex h-12 items-center justify-end gap-2">
          <button
            onClick={() => setLanguage(language === 'hinglish' ? 'english' : 'hinglish')}
            className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2 text-xs font-black text-gray-300"
          >
            {language === 'hinglish' ? 'HING' : 'ENG'}
          </button>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2 text-xs font-black text-gray-300"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </header>

        {screen === 'intro' && (
          <section className="flex min-h-[calc(100vh-48px)] flex-col items-center justify-center pb-24" style={{ animation: 'enter 1s ease-out' }}>
            <div className="flex h-44 w-44 items-center justify-center rounded-[60px] border border-red-400/10 bg-red-500/10 text-[120px] shadow-[0_0_140px_rgba(239,68,68,.25)]" style={{ animation: 'float 4s ease-in-out infinite' }}>
              💸
            </div>

            <h1 className="mt-16 text-center text-[56px] font-black leading-[0.82] tracking-tight text-white">
              {t.introA}
              <br />
              <span className="text-red-300">{t.introB}</span>
            </h1>

            <button
              onClick={() => {
                playTone('tap')
                setScreen('scan')
              }}
              className="mt-24 rounded-[40px] bg-white px-12 py-6 text-2xl font-black text-black shadow-[0_0_80px_rgba(255,255,255,.18)] transition active:scale-95"
            >
              {t.start}
            </button>
          </section>
        )}

        {screen === 'scan' && (
          <section className="flex min-h-[calc(100vh-48px)] flex-col pb-6">
            <div key={current.key} className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-[38px] border border-white/10 bg-white/[.045] p-6 shadow-2xl backdrop-blur-xl" style={{ animation: 'enter .35s ease-out' }}>
              <div className="absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-300 to-transparent" style={{ animation: 'scan 2.4s ease-in-out infinite' }} />

              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[34px] border border-white/10 bg-black/40 text-6xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
                {current.icon}
              </div>

              <h2 className="text-5xl font-black leading-[0.95] tracking-tight">{current.title}</h2>

              <div className="mt-8">
                {current.type === 'purpose' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {purposes.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          playTone('tap')
                          setPurpose(item.value)
                          setInterest(item.interest)
                        }}
                        className={`rounded-[28px] border p-4 text-left active:scale-95 ${purpose === item.value ? 'border-red-300 bg-red-500/20' : 'border-white/10 bg-black/30'}`}
                      >
                        <p className="text-3xl">{item.emoji}</p>
                        <p className="mt-2 font-black">{item.label}</p>
                      </button>
                    ))}
                  </div>
                ) : customMode ? (
                  <BigInput current={current} />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {current.presets.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          playTone('tap')
                          current.set(item)
                        }}
                        className={`rounded-[28px] border p-5 text-left text-2xl font-black active:scale-95 ${current.value === item ? 'border-red-300 bg-red-500/20' : 'border-white/10 bg-black/30'}`}
                      >
                        {current.type === 'money' ? formatINR(item) : current.type === 'percent' ? `${item}%` : `${item} mo`}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        playTone('tap')
                        setCustomMode(true)
                      }}
                      className="col-span-2 rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5 text-left text-lg font-black text-cyan-100 active:scale-95"
                    >
                      ✍️ Custom value
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={back} className="flex-1 rounded-[26px] border border-white/10 bg-white/[.05] py-4 font-black active:scale-95">Back</button>
              <button onClick={next} className="flex-[2] rounded-[26px] bg-white py-4 font-black text-black active:scale-95">{step === questions.length - 1 ? t.reveal : 'Next →'}</button>
            </div>
          </section>
        )}

        {screen === 'analyzing' && (
          <section className="flex min-h-[calc(100vh-48px)] flex-col justify-center pb-10" style={{ animation: 'enter .4s ease-out' }}>
            <div className="relative overflow-hidden rounded-[42px] border border-red-400/20 bg-white/[.045] p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-300 to-transparent" style={{ animation: 'scan 1.5s ease-in-out infinite' }} />

              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-[42px] border border-red-400/20 bg-red-500/10 text-7xl" style={{ animation: 'float 2.4s ease-in-out infinite' }}>🧠</div>

              <h2 className="mt-8 text-4xl font-black leading-tight">{t.analyzing}</h2>

              <div className="mt-8 space-y-3 text-left">
                {t.scanLines.map((line) => (
                  <ScanLine key={line} text={line} />
                ))}
              </div>
            </div>
          </section>
        )}

        {screen === 'result' && (
          <section className="pb-12" style={{ animation: 'enter .45s ease-out' }}>
            <div className={`relative overflow-hidden rounded-[42px] border border-white/10 bg-white/[.045] p-6 shadow-2xl ${result.mood.glow}`}>
              <div className="absolute inset-0 bg-red-500/10" style={{ animation: result.score >= 75 ? 'flash 1.4s ease-in-out infinite' : 'none' }} />

              <div className="relative">
                <div className="mt-6 text-center text-9xl">{result.mood.emoji}</div>

                <h2 className={`mt-8 text-center text-5xl font-black leading-[0.92] tracking-tight ${result.mood.color}`}>
                  {result.mood.label}
                </h2>

                <p className="mx-auto mt-8 max-w-xs text-center text-2xl font-black leading-tight text-white">
                  {t.moneyLine}
                  <br />
                  {Math.round(result.emiRatio)}% {t.moneyLineEnd}
                </p>

                <div className="mt-10 text-center">
                  <p className={`text-8xl font-black ${result.mood.color}`}>{result.score}</p>
                </div>

                <div className="mt-8 h-5 overflow-hidden rounded-full bg-black/60">
                  <div className={`h-full rounded-full bg-gradient-to-r ${result.mood.bar}`} style={{ width: `${result.score}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={copyResult} className="rounded-[28px] bg-white py-5 text-lg font-black text-black active:scale-95">
                Share Result
              </button>

              <button onClick={() => setShowDetails(!showDetails)} className="rounded-[28px] border border-white/10 bg-white/[.05] py-5 text-lg font-black active:scale-95">
                {showDetails ? t.hideTruth : t.viewTruth}
              </button>
            </div>

            {showDetails && (
              <div className="mt-5 space-y-4" style={{ animation: 'enter .3s ease-out' }}>
                <Panel title="📊 Stress Map">
                  {result.stress.map((item) => (
                    <div key={item.label} className="mb-4 last:mb-0">
                      <div className="mb-2 flex justify-between text-sm font-black">
                        <span>{item.icon} {item.label}</span>
                        <span>{Math.round(item.value)}%</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full bg-black/50">
                        <div className="h-full rounded-full bg-gradient-to-r from-red-700 to-yellow-200" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </Panel>

                <Panel title="💰 Money Breakdown">
                  <Row label="Income" value={formatINR(income)} />
                  <Row label="Expenses" value={formatINR(expenses)} />
                  <Row label="Existing EMI" value={formatINR(existingEMI)} />
                  <Row label="New EMI" value={formatINR(result.emi)} />
                  <Row label="EMI vs Income" value={`${Math.round(result.emiRatio)}%`} danger={result.emiRatio > 40} />
                  <Row label="Total Interest" value={formatINR(result.totalInterest)} />
                  <Row label="Emergency Survival" value={`${result.emergencyMonths.toFixed(1)} months`} danger={result.emergencyMonths < 3} />
                </Panel>

                <Panel title="🧠 Brutal Truth">
                  <Truth result={result} purpose={purpose} loanAmount={loanAmount} />
                </Panel>

                <Panel title="🛡️ Better Plan">
                  <p className="leading-7 text-gray-300">Safe EMI approx: <b className="text-white">{formatINR(result.safeEMI)}</b></p>
                  <p className="mt-3 leading-7 text-gray-300">If possible, reduce loan amount first. Tenure badhane se EMI kam hoti hai but interest burn badh sakta hai.</p>
                  <p className="mt-3 leading-7 text-gray-300">Build 3–6 months emergency fund before lifestyle debt.</p>
                </Panel>

                <Assistant chatOpen={chatOpen} setChatOpen={setChatOpen} messages={chatMessages} input={chatInput} setInput={setChatInput} send={sendChat} />
              </div>
            )}

            <div className="mt-12 rounded-[42px] border border-white/10 bg-white/[.04] p-10 text-center">
              <p className="text-4xl font-black leading-[1.05] text-white">
                Most people realize too late.
              </p>

              <p className="mt-3 text-5xl font-black text-red-300">
                {t.lateB}
              </p>

              <button onClick={downloadCard} className="mt-10 w-full rounded-[34px] bg-white py-6 text-2xl font-black text-black active:scale-95">
                {t.shareStory}
              </button>
            </div>

            <button onClick={resetScan} className="mt-5 w-full rounded-[30px] border border-white/10 bg-white/[.05] py-5 text-lg font-black active:scale-95">
              {t.again}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

function BigInput({ current }) {
  return (
    <div className="relative">
      {current.type === 'money' && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-500">₹</span>}

      <input
        type="number"
        inputMode="numeric"
        value={current.value}
        onChange={(event) => current.set(Number(event.target.value))}
        className={`w-full rounded-[30px] border border-white/10 bg-black/50 py-6 text-5xl font-black outline-none focus:border-red-300 ${current.type === 'money' ? 'pl-14 pr-5' : 'px-5'}`}
      />

      {current.type === 'percent' && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-500">%</span>}
      {current.type === 'months' && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-500">months</span>}
    </div>
  )
}

function ScanLine({ text }) {
  return <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-black text-gray-300">🔴 {text}</div>
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[.04] p-5">
      <h3 className="mb-4 text-2xl font-black">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, value, danger }) {
  return (
    <div className="mb-3 flex justify-between rounded-2xl bg-black/30 px-4 py-3 last:mb-0">
      <span className="text-sm text-gray-400">{label}</span>
      <b className={danger ? 'text-red-300' : 'text-white'}>{value}</b>
    </div>
  )
}

function Truth({ result, purpose, loanAmount }) {
  return (
    <div className="space-y-3 leading-7 text-gray-300">
      {result.emiRatio > 45 && <p>• EMI income ka bahut bada hissa kha rahi hai. Ye salary slavery ka start ho sakta hai.</p>}
      {result.remaining < 5000 && <p>• EMI ke baad money left dangerously low hai. Flexibility almost khatam.</p>}
      {result.emergencyMonths < 3 && <p>• Emergency fund weak hai. Pehle backup banao, phir debt lo.</p>}
      {result.totalInterest > loanAmount * 0.3 && <p>• Interest burn high hai. Product se zyada pressure kharid rahe ho.</p>}
      {['phone', 'travel', 'status'].includes(purpose) && <p>• Lifestyle loan dangerous hota hai. Asset nahi, stress kharid rahe ho.</p>}
      {result.score < 35 && <p>• Numbers safe lag rahe hain. Still, unnecessary debt habit mat banao.</p>}
    </div>
  )
}

function Assistant({ chatOpen, setChatOpen, messages, input, setInput, send }) {
  return (
    <section className="rounded-[32px] border border-purple-400/20 bg-purple-500/10 p-5">
      <button onClick={() => setChatOpen(!chatOpen)} className="flex w-full items-center justify-between text-left">
        <div>
          <h3 className="text-xl font-black">🤖 Ask Goviox Guide</h3>
          <p className="text-sm text-gray-400">AI-style help, no signup.</p>
        </div>
        <span className="text-3xl">{chatOpen ? '−' : '+'}</span>
      </button>

      {chatOpen && (
        <div className="mt-4">
          <div className="max-h-72 space-y-3 overflow-y-auto rounded-3xl bg-black/30 p-3">
            {messages.map((message, index) => (
              <div key={index} className={`rounded-2xl p-3 text-sm leading-6 ${message.role === 'assistant' ? 'bg-white/[.06]' : 'bg-purple-300 text-black'}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && send()}
              placeholder="Is this safe?"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none"
            />
            <button onClick={send} className="rounded-2xl bg-white px-4 font-black text-black">Send</button>
          </div>
        </div>
      )}
    </section>
  )
}

function getAnswer(text, result) {
  const question = text.toLowerCase()

  if (question.includes('safe') || question.includes('afford') || question.includes('lena')) {
    return result.score >= 55
      ? `Straight: risky. Score ${result.score}/100 hai. EMI pressure comfortable nahi hai.`
      : 'Numbers manageable lag rahe hain. Total EMI ko 25–30% income ke andar rakho.'
  }

  if (question.includes('interest')) return `Interest burn ${formatINR(result.totalInterest)} hai. Ye extra paisa bank/lender ko jaayega.`
  if (question.includes('emergency')) return `Emergency survival ${result.emergencyMonths.toFixed(1)} months hai. 3 months se kam weak hai.`
  if (question.includes('reduce') || question.includes('kam')) return 'Loan amount reduce karo. Tenure blindly badhane se interest burn badh sakta hai.'

  return 'Main EMI safety, interest burn, emergency risk aur safer plan explain kar sakta hoon. Ye financial advice nahi, educational guide hai.'
}

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''

  for (let index = 0; index < words.length; index++) {
    const test = line + words[index] + ' '

    if (ctx.measureText(test).width > maxWidth && index > 0) {
      ctx.fillText(line, x, y)
      line = words[index] + ' '
      y += lineHeight
    } else {
      line = test
    }
  }

  ctx.fillText(line, x, y)
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
