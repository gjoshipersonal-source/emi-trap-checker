'use client'
import { useMemo, useState } from 'react'

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

export default function EMITrapChecker() {
  const [step, setStep] = useState(0)
  const [salary, setSalary] = useState(30000)
  const [expenses, setExpenses] = useState(12000)
  const [existingEMI, setExistingEMI] = useState(0)
  const [loanAmount, setLoanAmount] = useState(300000)
  const [interest, setInterest] = useState(12)
  const [tenure, setTenure] = useState(36)
  const [emergencyFund, setEmergencyFund] = useState(10000)
  const [loanPurpose, setLoanPurpose] = useState('phone')
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const questions = [
    {
      key: 'salary',
      title: 'Tumhari monthly income kitni hai?',
      subtitle: 'Salary, business income ya fixed monthly earning dalo.',
      value: salary,
      setValue: setSalary,
      type: 'money',
      placeholder: '30000'
    },
    {
      key: 'expenses',
      title: 'Monthly expenses kitne hain?',
      subtitle: 'Rent, food, travel, bills, recharge — sab mila ke.',
      value: expenses,
      setValue: setExpenses,
      type: 'money',
      placeholder: '12000'
    },
    {
      key: 'existingEMI',
      title: 'Pehle se koi EMI chal rahi hai?',
      subtitle: 'Agar nahi hai to 0 rehne do.',
      value: existingEMI,
      setValue: setExistingEMI,
      type: 'money',
      placeholder: '0'
    },
    {
      key: 'loanAmount',
      title: 'Kitna loan lene ka soch rahe ho?',
      subtitle: 'Loan amount enter karo.',
      value: loanAmount,
      setValue: setLoanAmount,
      type: 'money',
      placeholder: '300000'
    },
    {
      key: 'interest',
      title: 'Interest rate kitna hai?',
      subtitle: 'Annual interest rate. Example: 12%',
      value: interest,
      setValue: setInterest,
      type: 'percent',
      placeholder: '12'
    },
    {
      key: 'tenure',
      title: 'Loan kitne months ka hai?',
      subtitle: 'Example: 12, 24, 36, 60 months.',
      value: tenure,
      setValue: setTenure,
      type: 'months',
      placeholder: '36'
    },
    {
      key: 'emergencyFund',
      title: 'Emergency fund kitna hai?',
      subtitle: 'Bank/cash me kitna backup hai jo emergency me use ho sake.',
      value: emergencyFund,
      setValue: setEmergencyFund,
      type: 'money',
      placeholder: '10000'
    },
    {
      key: 'loanPurpose',
      title: 'Loan kis cheez ke liye hai?',
      subtitle: 'Purpose risk ko affect karta hai. Status loan sabse dangerous hota hai.',
      value: loanPurpose,
      setValue: setLoanPurpose,
      type: 'select'
    }
  ]

  const isLastQuestion = step === questions.length - 1
  const showResult = step >= questions.length
  const currentQuestion = questions[step]
  const progress = Math.min(((step + 1) / questions.length) * 100, 100)

  const result = useMemo(() => {
    const emi = calculateEMI(loanAmount, interest, tenure)
    const totalPayable = emi * tenure
    const totalInterest = totalPayable - loanAmount
    const totalEMI = emi + existingEMI
    const emiRatio = salary > 0 ? (totalEMI / salary) * 100 : 0
    const remainingMoney = salary - expenses - totalEMI
    const emergencyMonths = expenses > 0 ? emergencyFund / expenses : 0
    const yearlyPressure = totalEMI * 12

    let riskScore = 0
    riskScore += emiRatio * 1.25

    if (remainingMoney < 10000) riskScore += 10
    if (remainingMoney < 5000) riskScore += 15
    if (remainingMoney < 2000) riskScore += 20
    if (remainingMoney < 0) riskScore += 25
    if (emergencyMonths < 3) riskScore += 15
    if (emergencyMonths < 1) riskScore += 15

    if (loanPurpose === 'phone' || loanPurpose === 'travel' || loanPurpose === 'status') riskScore += 10
    if (loanPurpose === 'business' || loanPurpose === 'education') riskScore -= 5

    riskScore = Math.max(0, Math.min(Math.round(riskScore), 100))

    let riskLevel = 'Safe Zone'
    let color = 'text-emerald-400'
    let bg = 'bg-emerald-500/10 border-emerald-500/20'
    let meter = 'from-emerald-500 to-emerald-300'
    let message = 'Ye EMI manageable lag rahi hai. Lekin unnecessary debt ko normal mat banao.'

    if (riskScore >= 75) {
      riskLevel = 'Financial Damage Zone'
      color = 'text-red-400'
      bg = 'bg-red-500/10 border-red-500/20'
      meter = 'from-red-600 to-red-300'
      message = 'Ye loan tumhe financially choke kar sakta hai. Ek emergency ya job issue tumhari life unstable bana sakta hai.'
    } else if (riskScore >= 55) {
      riskLevel = 'Danger Zone'
      color = 'text-orange-400'
      bg = 'bg-orange-500/10 border-orange-500/20'
      meter = 'from-orange-500 to-yellow-300'
      message = 'Ye EMI dangerous side par hai. Savings, freedom aur mental peace weak ho sakti hai.'
    } else if (riskScore >= 35) {
      riskLevel = 'Caution Zone'
      color = 'text-yellow-400'
      bg = 'bg-yellow-500/10 border-yellow-500/20'
      meter = 'from-yellow-500 to-yellow-200'
      message = 'Ye loan tabhi manageable hai jab income stable rahe. Savings par pressure aayega.'
    }

    const monthsToSaveInstead = salary > expenses ? Math.ceil(loanAmount / Math.max(salary - expenses - existingEMI, 1)) : null
    const suggestedMaxEMI = salary * 0.25 - existingEMI
    const emiCutNeeded = Math.max(0, totalEMI - salary * 0.3)

    return {
      emi,
      totalPayable,
      totalInterest,
      totalEMI,
      emiRatio,
      remainingMoney,
      emergencyMonths,
      yearlyPressure,
      riskScore,
      riskLevel,
      color,
      bg,
      meter,
      message,
      monthsToSaveInstead,
      suggestedMaxEMI,
      emiCutNeeded
    }
  }, [salary, expenses, existingEMI, loanAmount, interest, tenure, emergencyFund, loanPurpose])

  const shareText = `EMI Trap Checker\n\nIncome: ${formatINR(salary)}\nNew EMI: ${formatINR(result.emi)}\nTotal EMI burden: ${Math.round(result.emiRatio)}% of income\nMoney left after expenses: ${formatINR(result.remainingMoney)}\nRisk Score: ${result.riskScore}/100 - ${result.riskLevel}\n\n${result.message}`

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      alert('Copy failed. Select result manually.')
    }
  }

  const downloadCard = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawRoundedRect(ctx, 60, 60, 960, 1230, 40, '#111111')

    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 42px Arial'
    ctx.fillText('EMI Trap Checker', 100, 150)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px Arial'
    ctx.fillText(result.riskLevel, 100, 270)

    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 110px Arial'
    ctx.fillText(`${result.riskScore}/100`, 100, 410)

    ctx.fillStyle = '#d1d5db'
    ctx.font = '36px Arial'
    ctx.fillText(`Income: ${formatINR(salary)}`, 100, 540)
    ctx.fillText(`New EMI: ${formatINR(result.emi)}`, 100, 610)
    ctx.fillText(`EMI Burden: ${Math.round(result.emiRatio)}%`, 100, 680)
    ctx.fillText(`Money Left: ${formatINR(result.remainingMoney)}`, 100, 750)
    ctx.fillText(`Total Interest: ${formatINR(result.totalInterest)}`, 100, 820)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 34px Arial'
    ctx.fillText('Brutal Truth:', 100, 950)

    ctx.fillStyle = '#d1d5db'
    ctx.font = '30px Arial'
    wrapText(ctx, result.message, 100, 1010, 850, 44)

    ctx.fillStyle = '#6b7280'
    ctx.font = '26px Arial'
    ctx.fillText('Presented by Goviox — Govind Joshi', 100, 1210)

    const link = document.createElement('a')
    link.download = 'emi-trap-result.png'
    link.href = canvas.toDataURL('image/png')
    link.click()

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1800)
  }

  const nextStep = () => {
    if (!currentQuestion) return
    if (Number(currentQuestion.value) < 0) return
    setStep((prev) => prev + 1)
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))
  const restart = () => setStep(0)

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-400 selection:text-black">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-black tracking-tight">EMI Trap Checker</p>
            <p className="text-xs text-gray-500">Mobile-first loan reality test</p>
          </div>

          {showResult && (
            <button onClick={restart} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-gray-300">
              Restart
            </button>
          )}
        </div>
      </header>

      {!showResult ? (
        <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col px-4 py-6">
          <div className="mb-8">
            <div className="mb-3 flex justify-between text-xs font-bold text-gray-500">
              <span>Step {step + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-300 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <section className="flex flex-1 flex-col justify-center">
            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.14),transparent_42%),rgba(255,255,255,0.04)] p-6 shadow-2xl md:p-10">
              <div className="mb-8 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300">
                Loan lene se pehle sach dekho
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                {currentQuestion.title}
              </h1>

              <p className="mt-5 text-base leading-7 text-gray-400 md:text-lg">
                {currentQuestion.subtitle}
              </p>

              <div className="mt-10">
                {currentQuestion.type === 'select' ? (
                  <div className="grid gap-3">
                    {[
                      ['phone', 'Phone / Gadget'],
                      ['bike', 'Bike / Vehicle'],
                      ['education', 'Education'],
                      ['business', 'Business / Income Growth'],
                      ['travel', 'Travel / Lifestyle'],
                      ['status', 'Status Purchase'],
                      ['emergency', 'Emergency']
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setLoanPurpose(value)}
                        className={`rounded-2xl border px-5 py-4 text-left font-bold transition ${loanPurpose === value ? 'border-red-400 bg-red-500/20 text-white' : 'border-white/10 bg-black/30 text-gray-300'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    {currentQuestion.type === 'money' && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-500">₹</span>}
                    <input
                      inputMode="numeric"
                      type="number"
                      min="0"
                      value={currentQuestion.value}
                      placeholder={currentQuestion.placeholder}
                      onChange={(event) => currentQuestion.setValue(Number(event.target.value))}
                      className={`w-full rounded-[28px] border border-white/10 bg-black/50 py-6 text-4xl font-black outline-none transition focus:border-red-400 ${currentQuestion.type === 'money' ? 'pl-14 pr-5' : 'px-5'}`}
                    />
                    {currentQuestion.type === 'percent' && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-500">%</span>}
                    {currentQuestion.type === 'months' && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">months</span>}
                  </div>
                )}
              </div>

              <div className="mt-10 flex gap-3">
                <button
                  onClick={prevStep}
                  disabled={step === 0}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-black text-gray-300 disabled:opacity-40"
                >
                  Back
                </button>

                <button
                  onClick={nextStep}
                  className="flex-[2] rounded-2xl bg-white px-5 py-4 font-black text-black transition hover:scale-[1.02]"
                >
                  {isLastQuestion ? 'Show Result' : 'Next'}
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <ResultScreen
          result={result}
          salary={salary}
          expenses={expenses}
          existingEMI={existingEMI}
          loanAmount={loanAmount}
          interest={interest}
          tenure={tenure}
          emergencyFund={emergencyFund}
          loanPurpose={loanPurpose}
          copied={copied}
          downloaded={downloaded}
          copyResult={copyResult}
          downloadCard={downloadCard}
          restart={restart}
        />
      )}
    </div>
  )
}

function ResultScreen({
  result,
  salary,
  expenses,
  existingEMI,
  loanAmount,
  interest,
  tenure,
  emergencyFund,
  loanPurpose,
  copied,
  downloaded,
  copyResult,
  downloadCard,
  restart
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
      <section id="share-card" className={`rounded-[32px] border p-6 ${result.bg}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Risk Analysis</p>
            <h1 className={`mt-3 text-4xl font-black leading-tight ${result.color}`}>{result.riskLevel}</h1>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 px-5 py-4 text-center">
            <p className="text-xs text-gray-500">Score</p>
            <p className={`text-5xl font-black ${result.color}`}>{result.riskScore}</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex justify-between text-xs text-gray-400">
            <span>Safe</span>
            <span>Danger</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-black/50">
            <div className={`h-full rounded-full bg-gradient-to-r ${result.meter}`} style={{ width: `${result.riskScore}%` }} />
          </div>
        </div>

        <p className="mt-7 text-lg leading-8 text-gray-200">{result.message}</p>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button onClick={copyResult} className="rounded-2xl bg-white px-6 py-4 font-black text-black">
          {copied ? 'Copied ✓' : 'Copy Result'}
        </button>
        <button onClick={downloadCard} className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 font-black">
          {downloaded ? 'Downloaded ✓' : 'Download Image'}
        </button>
      </div>

      <section className="mt-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-3xl font-black">Financial Breakdown</h2>
        <div className="mt-6 space-y-3">
          <ResultRow label="Monthly Income" value={formatINR(salary)} />
          <ResultRow label="Monthly Expenses" value={formatINR(expenses)} />
          <ResultRow label="Existing EMI" value={formatINR(existingEMI)} />
          <ResultRow label="New EMI" value={formatINR(result.emi)} />
          <ResultRow label="EMI vs Income" value={`${Math.round(result.emiRatio)}%`} danger={result.emiRatio > 40} />
          <ResultRow label="Money Left" value={formatINR(result.remainingMoney)} danger={result.remainingMoney < 5000} />
          <ResultRow label="Total Interest" value={formatINR(result.totalInterest)} danger={result.totalInterest > loanAmount * 0.25} />
          <ResultRow label="Total Payable" value={formatINR(result.totalPayable)} />
          <ResultRow label="Emergency Survival" value={`${result.emergencyMonths.toFixed(1)} months`} danger={result.emergencyMonths < 3} />
          <ResultRow label="Yearly EMI Pressure" value={formatINR(result.yearlyPressure)} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <ImpactCard title="Loan Life" value={`${tenure} months`} text="Itne time tak ye EMI tumhare upar pressure rakhegi." />
        <ImpactCard title="Interest Shock" value={formatINR(result.totalInterest)} text="Ye extra paisa bank ko jayega." />
        <ImpactCard title="Safe EMI Limit" value={formatINR(Math.max(result.suggestedMaxEMI, 0))} text="Approx safer new EMI limit." />
      </section>

      <section className="mt-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6">
        <h2 className="text-3xl font-black">Brutal Truth</h2>
        <div className="mt-5 space-y-4 leading-8 text-gray-300">
          {result.emiRatio > 45 && <p>• EMI income ka bahut bada hissa kha rahi hai. Ye salary slavery ka starting point ho sakta hai.</p>}
          {result.remainingMoney < 5000 && <p>• Expenses ke baad bacha paisa dangerously low hai. Tum flexibility lose kar rahe ho.</p>}
          {result.emergencyMonths < 3 && <p>• Emergency fund weak hai. Loan lene se pehle backup banana zyada important hai.</p>}
          {result.totalInterest > loanAmount * 0.3 && <p>• Interest cost high hai. Tum actual product se kaafi zyada pay kar rahe ho.</p>}
          {(loanPurpose === 'phone' || loanPurpose === 'travel' || loanPurpose === 'status') && <p>• Lifestyle/status loan dangerous hota hai. Tum asset nahi, pressure kharid rahe ho.</p>}
          {result.riskScore < 35 && <p>• Numbers safe lag rahe hain, but unnecessary debt ko habit mat banao.</p>}
        </div>
      </section>

      <section className="mt-6 rounded-[32px] border border-cyan-500/20 bg-cyan-500/10 p-6">
        <h2 className="text-3xl font-black text-cyan-200">Better Alternative</h2>
        <div className="mt-5 space-y-4 leading-8 text-gray-200">
          {result.emiCutNeeded > 0 ? (
            <p>• EMI ko kam se kam {formatINR(result.emiCutNeeded)} reduce karo to safer zone ke paas aa sako.</p>
          ) : (
            <p>• EMI current numbers ke hisaab se safer zone me hai. Still, loan purpose justify hona chahiye.</p>
          )}
          {result.monthsToSaveInstead && result.monthsToSaveInstead < 24 && <p>• Approx {result.monthsToSaveInstead} months save karke loan avoid kar sakte ho.</p>}
          <p>• Loan amount reduce karo. Tenure blindly increase mat karo — interest badhega.</p>
          <p>• Pehle 3–6 months emergency fund build karo.</p>
        </div>
      </section>

      <button onClick={restart} className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 font-black text-gray-300">
        Check Another Loan
      </button>

      <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-500">
          Presented By
        </p>

        <h3 className="mt-3 text-3xl font-black tracking-tight">
          Goviox — Govind Joshi
        </h3>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400">
          Most people destroy their financial future slowly through emotional purchases,
          lifestyle pressure and fake affordability. This tool exists to force reality
          before debt becomes stress.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Mission</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Help people avoid dangerous financial decisions before they become trapped.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Reality</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Just because a bank approves your loan does not mean your life can safely handle it.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Reminder</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Debt should build assets or income — not fund temporary status or impulse buying.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs leading-6 text-gray-500">
          Educational awareness tool only. Ye financial advice nahi hai.
        </p>
      </div>
    </main>
  )
}

function ResultRow({ label, value, danger }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/30 px-4 py-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-right text-lg font-black ${danger ? 'text-red-300' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y)
      line = words[i] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y)
}

function drawRoundedRect(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color
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
  ctx.fill()
}

function ImpactCard({ title, value, text }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">{title}</p>
      <h3 className="mt-3 text-2xl font-black">{value}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-400">{text}</p>
    </div>
  )
}
