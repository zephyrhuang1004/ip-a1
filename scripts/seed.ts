/**
 * Seed script — generates ~1 year of realistic expense data for a uni student in Sydney.
 *
 * Usage:  bun run scripts/seed.ts
 *
 * - Keeps existing records untouched (inserts only new ones)
 * - Covers May 2025 → April 2026
 * - ~200 records across all 8 categories
 */

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) {
  // fallback: read from .env.local
  const fs = await import("fs")
  const envContent = fs.readFileSync(".env.local", "utf-8")
  const match = envContent.match(/MONGODB_URI=(.+)/)
  if (!match) {
    console.error("MONGODB_URI not found in env or .env.local")
    process.exit(1)
  }
  process.env.MONGODB_URI = match[1].trim()
}

const MONGODB_URI = process.env.MONGODB_URI!

// ─── helpers ───────────────────────────────────────────────────────────

function date(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function ts(dateStr: string, h = 10, min = 0): string {
  return `${dateStr}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00.000Z`
}

interface Expense {
  title: string
  category: string
  amount: number
  date: string
  description: string
  createdAt: string
  updatedAt: string
}

const expenses: Expense[] = []

function add(
  dateStr: string,
  title: string,
  category: string,
  amount: number,
  description: string,
  hour = 12,
) {
  const created = ts(dateStr, hour)
  expenses.push({ title, category, amount, date: dateStr, description, createdAt: created, updatedAt: created })
}

// ─── Recurring monthly expenses ────────────────────────────────────────

const months: [number, number][] = [
  [2025, 5], [2025, 6], [2025, 7], [2025, 8], [2025, 9], [2025, 10],
  [2025, 11], [2025, 12], [2026, 1], [2026, 2],
  // March & April 2026 already have data, but we add recurring items
]

for (const [y, m] of months) {
  // Netflix — 3rd of each month
  add(date(y, m, 3), "Netflix subscription", "entertainment", 16.99, "Monthly streaming", 0)
  // Spotify — 1st
  add(date(y, m, 1), "Spotify subscription", "entertainment", 12.99, "Monthly music", 0)
  // Internet — 15th
  add(date(y, m, 15), "Internet bill", "bills", 79, "Monthly NBN plan", 9)
  // Phone plan — 20th
  add(date(y, m, 20), "Phone plan", "bills", 39, "Optus prepaid", 9)
  // Gym — 1st
  add(date(y, m, 1), "Gym membership", "health", 59, "Fitness First monthly", 6)
}

// ─── Quarterly bills ───────────────────────────────────────────────────

add(date(2025, 6, 5), "Electricity bill", "bills", 138.7, "Q2 electricity", 9)
add(date(2025, 9, 5), "Electricity bill", "bills", 125.4, "Q3 electricity", 9)
add(date(2025, 12, 5), "Electricity bill", "bills", 152.8, "Q4 electricity", 9)

add(date(2025, 7, 10), "Water bill", "bills", 62.5, "Quarterly water usage", 9)
add(date(2025, 10, 10), "Water bill", "bills", 58.3, "Quarterly water usage", 9)
add(date(2026, 1, 10), "Water bill", "bills", 65.9, "Quarterly water usage", 9)

// ─── Groceries (weekly-ish) ────────────────────────────────────────────

const groceryStores = [
  "Woolworths Broadway", "Coles Broadway", "Woolworths Ultimo",
  "Aldi Surry Hills", "Coles Central",
]
const groceryAmounts = [
  72.3, 85.1, 68.9, 91.4, 77.6, 63.8, 88.2, 79.5, 94.7, 66.4,
  82.9, 73.1, 87.6, 69.3, 76.8, 90.2, 84.5, 71.7, 78.4, 93.6,
  67.2, 86.3, 74.9, 81.5, 70.8, 89.1, 75.3, 83.7, 92.4, 68.1,
  80.6, 87.9, 73.5, 66.8, 91.7, 85.4, 69.6, 78.2, 82.1, 76.0,
]

let groceryIdx = 0
for (const [y, m] of months) {
  // ~3-4 grocery trips per month
  for (const day of [3, 10, 18, 25]) {
    const maxDay = new Date(y, m, 0).getDate()
    if (day <= maxDay) {
      add(
        date(y, m, day),
        "Weekly groceries",
        "food",
        groceryAmounts[groceryIdx % groceryAmounts.length],
        groceryStores[groceryIdx % groceryStores.length],
        10,
      )
      groceryIdx++
    }
  }
}

// ─── Lunch & coffee (frequent) ─────────────────────────────────────────

const lunchSpots = [
  ["Lunch at Mamak", "Nasi goreng + teh tarik"],
  ["Lunch at food court", "Thai Express Broadway"],
  ["Sushi lunch", "Sushi Hub UTS"],
  ["Lunch at Thai restaurant", "Chat Thai Broadway"],
  ["Pho lunch", "Pho Pasteur Chinatown"],
  ["Ramen lunch", "Ippudo Broadway"],
  ["Kebab lunch", "Kebab station"],
  ["Lunch at uni", "UTS food court"],
  ["Banh mi", "Marrickville Pork Roll"],
  ["Burrito lunch", "Guzman y Gomez"],
  ["Noodle lunch", "Din Tai Fung"],
  ["Pad thai lunch", "Home Thai Broadway"],
  ["Rice bowl lunch", "TetsuYa's Express"],
  ["Laksa lunch", "Malay Chinese Takeaway"],
  ["Dumpling lunch", "Chinese Noodle Restaurant"],
]

const coffeeSpots = [
  ["Morning coffee", "Campos Coffee UTS"],
  ["Flat white", "Single O Surry Hills"],
  ["Coffee", "Mecca Espresso"],
  ["Afternoon coffee", "Pablo & Rusty's"],
  ["Coffee with friends", "Campos Coffee"],
]

let lunchIdx = 0
let coffeeIdx = 0

for (const [y, m] of months) {
  // ~6-8 lunches per month
  const lunchDays = [2, 5, 9, 12, 16, 19, 23, 27]
  for (const day of lunchDays) {
    const maxDay = new Date(y, m, 0).getDate()
    if (day <= maxDay) {
      const spot = lunchSpots[lunchIdx % lunchSpots.length]
      const amount = 13 + (lunchIdx * 1.3) % 15 // $13-28 range
      add(date(y, m, day), spot[0], "food", Math.round(amount * 100) / 100, spot[1], 12)
      lunchIdx++
    }
  }

  // ~4-5 coffees per month
  const coffeeDays = [1, 7, 14, 21, 28]
  for (const day of coffeeDays) {
    const maxDay = new Date(y, m, 0).getDate()
    if (day <= maxDay) {
      const spot = coffeeSpots[coffeeIdx % coffeeSpots.length]
      const amount = 5 + (coffeeIdx * 0.7) % 4 // $5-9 range
      add(date(y, m, day), spot[0], "food", Math.round(amount * 100) / 100, spot[1], 8)
      coffeeIdx++
    }
  }
}

// ─── Bubble tea (every 2 weeks or so) ──────────────────────────────────

const btShops = ["Gong Cha UTS", "CoCo Broadway", "Tiger Sugar Haymarket", "ShareTea Chinatown"]
let btIdx = 0
for (const [y, m] of months) {
  for (const day of [8, 22]) {
    add(
      date(y, m, day),
      "Bubble tea",
      "food",
      7 + (btIdx % 4) * 0.5,
      btShops[btIdx % btShops.length],
      15,
    )
    btIdx++
  }
}

// ─── Dining out (1-2x per month) ───────────────────────────────────────

const dinners = [
  ["Dinner with friends", "Korean BBQ Strathfield", 32],
  ["Birthday dinner", "Japanese Izakaya Surry Hills", 45],
  ["Friday dinner", "Burger Project Broadway", 24.5],
  ["Dinner out", "PappaRich Haymarket", 22],
  ["Dinner with housemates", "Dumpling house Ashfield", 28],
  ["Saturday dinner", "Messina + pasta night", 38],
  ["Family dinner", "Yum cha Chinatown", 35],
  ["Dinner celebration", "Thai Pothong Newtown", 42],
  ["Casual dinner", "Oporto Broadway", 19.5],
  ["Dinner with classmates", "Hot pot Burwood", 48],
]

let dinnerIdx = 0
for (const [y, m] of months) {
  const d = dinners[dinnerIdx % dinners.length]
  add(date(y, m, 13), d[0], "food", d[2] as number, d[1], 19)
  dinnerIdx++
  if (m % 2 === 0) {
    const d2 = dinners[dinnerIdx % dinners.length]
    add(date(y, m, 26), d2[0], "food", d2[2] as number, d2[1], 19)
    dinnerIdx++
  }
}

// ─── Transport ─────────────────────────────────────────────────────────

for (const [y, m] of months) {
  // Opal card top-up every 2-3 weeks
  add(date(y, m, 4), "Opal card top-up", "transport", m % 2 === 0 ? 50 : 30, "Auto top-up", 8)
  if (m % 2 === 0) {
    add(date(y, m, 18), "Opal card top-up", "transport", 20, "Weekly top-up", 8)
  }
}

// Occasional Uber rides
add(date(2025, 5, 17), "Uber to Bondi", "transport", 28, "Beach day", 10)
add(date(2025, 6, 21), "Uber home", "transport", 22.5, "Late night from city", 23)
add(date(2025, 7, 4), "Uber to airport", "transport", 45, "SYD international terminal", 5)
add(date(2025, 8, 15), "Uber from station", "transport", 15, "Heavy rain", 18)
add(date(2025, 9, 28), "Uber to friend's place", "transport", 19.5, "Strathfield", 17)
add(date(2025, 10, 31), "Uber home", "transport", 32, "Halloween night", 23)
add(date(2025, 11, 14), "Uber to Ikea", "transport", 24, "Rhodes", 11)
add(date(2025, 12, 24), "Uber to family dinner", "transport", 35, "Christmas Eve", 17)
add(date(2026, 1, 2), "Uber from airport", "transport", 48, "Back from holiday", 14)
add(date(2026, 2, 14), "Uber to restaurant", "transport", 18, "Valentine's dinner", 18)

// ─── Entertainment (beyond subscriptions) ──────────────────────────────

add(date(2025, 5, 24), "Movie tickets", "entertainment", 28, "Event Cinemas George St x2", 18)
add(date(2025, 6, 14), "Bowling night", "entertainment", 22, "Strike Bowling", 20)
add(date(2025, 7, 19), "Concert tickets", "entertainment", 89, "Enmore Theatre", 20)
add(date(2025, 8, 9), "Museum entry", "entertainment", 0, "Free first Saturday", 10)
add(date(2025, 8, 23), "Karaoke night", "entertainment", 35, "K-World Chinatown", 21)
add(date(2025, 9, 6), "Movie tickets", "entertainment", 25, "Hoyts Broadway", 14)
add(date(2025, 10, 11), "Theme park", "entertainment", 65, "Luna Park day pass", 9)
add(date(2025, 10, 25), "Board game cafe", "entertainment", 18, "Good Games Broadway", 15)
add(date(2025, 11, 8), "Movie tickets", "entertainment", 30, "Event Cinemas IMAX", 19)
add(date(2025, 12, 13), "Escape room", "entertainment", 38, "Mission Sydney", 14)
add(date(2025, 12, 31), "NYE event entry", "entertainment", 25, "Circular Quay viewing", 20)
add(date(2026, 1, 17), "Movie tickets", "entertainment", 26, "Dendy Newtown", 16)
add(date(2026, 1, 31), "Bowling night", "entertainment", 24, "Strike Bowling", 19)
add(date(2026, 2, 8), "Karaoke night", "entertainment", 32, "K-World Chinatown", 21)

// ─── Shopping ──────────────────────────────────────────────────────────

add(date(2025, 5, 10), "T-shirts", "shopping", 45, "Uniqlo Broadway", 14)
add(date(2025, 5, 28), "Haircut", "shopping", 35, "Barber on George St", 11)
add(date(2025, 6, 7), "Winter jacket", "shopping", 89.95, "Kathmandu sale", 13)
add(date(2025, 6, 22), "USB-C hub", "shopping", 49, "JB Hi-Fi", 15)
add(date(2025, 7, 12), "Headphones", "shopping", 149, "Sony WH-1000XM5 sale", 12)
add(date(2025, 7, 30), "Haircut", "shopping", 35, "Barber on George St", 11)
add(date(2025, 8, 5), "Backpack", "shopping", 79.95, "Herschel at The Iconic", 16)
add(date(2025, 8, 20), "Kitchen utensils", "shopping", 32, "Daiso Broadway", 10)
add(date(2025, 9, 14), "Jeans", "shopping", 59.95, "Uniqlo Broadway", 14)
add(date(2025, 9, 30), "Haircut", "shopping", 35, "Barber on George St", 11)
add(date(2025, 10, 8), "Mouse pad + keyboard wrist rest", "shopping", 42, "Amazon AU", 14)
add(date(2025, 11, 1), "Sneakers", "shopping", 119.95, "Nike outlet DFO", 13)
add(date(2025, 11, 26), "Black Friday sale - hoodie", "shopping", 35, "Cotton On", 10)
add(date(2025, 11, 30), "Haircut", "shopping", 35, "Barber on George St", 11)
add(date(2025, 12, 15), "Christmas gifts", "shopping", 85, "Various stores", 14)
add(date(2025, 12, 20), "Summer shorts x2", "shopping", 44, "Uniqlo Broadway", 12)
add(date(2026, 1, 5), "Desk lamp", "shopping", 39.95, "Kmart Broadway", 15)
add(date(2026, 1, 25), "Haircut", "shopping", 35, "Barber on George St", 11)
add(date(2026, 2, 9), "Valentine's gift", "shopping", 55, "Strand Arcade", 13)
add(date(2026, 2, 28), "Haircut", "shopping", 38, "Barber on George St (price increase)", 11)

// ─── Health ────────────────────────────────────────────────────────────

add(date(2025, 5, 14), "GP visit", "health", 38.5, "Gap payment after Medicare", 10)
add(date(2025, 5, 20), "Pharmacy", "health", 18.9, "Paracetamol + cold medicine", 16)
add(date(2025, 6, 18), "Dentist checkup", "health", 95, "UTS dental clinic", 14)
add(date(2025, 7, 8), "Pharmacy", "health", 12.5, "Sunscreen + vitamins", 11)
add(date(2025, 8, 12), "GP visit", "health", 42, "Blood test referral", 9)
add(date(2025, 8, 15), "Pathology", "health", 0, "Bulk billed blood test", 8)
add(date(2025, 9, 22), "Eye test", "health", 50, "OPSM Broadway", 14)
add(date(2025, 9, 25), "Contact lenses", "health", 89, "Online order 3-month supply", 20)
add(date(2025, 10, 5), "Pharmacy", "health", 22.5, "Allergy medication", 12)
add(date(2025, 11, 18), "GP visit", "health", 38.5, "Flu shot", 10)
add(date(2025, 12, 3), "Dentist cleaning", "health", 120, "UTS dental clinic", 14)
add(date(2026, 1, 9), "Pharmacy", "health", 15.9, "Vitamins refill", 16)
add(date(2026, 1, 22), "Contact lenses", "health", 89, "Quarterly reorder", 20)
add(date(2026, 2, 5), "Physio session", "health", 65, "Shoulder pain from gym", 15)

// ─── Education ─────────────────────────────────────────────────────────

add(date(2025, 5, 5), "Textbook - Data Structures", "education", 72, "Co-op Bookshop", 10)
add(date(2025, 5, 12), "Stationery pack", "education", 18.5, "Officeworks", 14)
add(date(2025, 6, 2), "Printing", "education", 8.5, "UTS print station", 11)
add(date(2025, 7, 15), "Textbook - Algorithms", "education", 58, "Amazon AU", 14)
add(date(2025, 8, 4), "Semester 2 printing", "education", 12, "UTS print station", 11)
add(date(2025, 8, 18), "Calculator", "education", 35, "Officeworks", 10)
add(date(2025, 9, 10), "Notebook refill x3", "education", 15, "Officeworks", 14)
add(date(2025, 10, 20), "USB drive 64GB", "education", 19, "JB Hi-Fi", 15)
add(date(2025, 11, 3), "Printing - assignment", "education", 6.5, "UTS print station", 11)
add(date(2025, 11, 25), "Udemy course - React", "education", 16.99, "Black Friday sale", 21)
add(date(2026, 1, 15), "Textbook - Web Dev", "education", 55, "QBD Books", 13)
add(date(2026, 2, 2), "Stationery", "education", 22, "Muji Sydney", 15)
add(date(2026, 2, 18), "Printing", "education", 9.5, "UTS print station", 11)

// ─── Other ─────────────────────────────────────────────────────────────

add(date(2025, 5, 25), "Gift for friend's birthday", "other", 30, "Myer gift card", 14)
add(date(2025, 6, 30), "Laundry card top-up", "other", 20, "Apartment laundry", 9)
add(date(2025, 7, 22), "Key replacement", "other", 15, "Lost apartment key", 17)
add(date(2025, 8, 28), "Donation - charity run", "other", 25, "City2Surf entry", 10)
add(date(2025, 9, 15), "Postage - send parcel", "other", 12.5, "Australia Post", 11)
add(date(2025, 10, 18), "Laundry card top-up", "other", 20, "Apartment laundry", 9)
add(date(2025, 11, 11), "Umbrella", "other", 15, "Lost old one on train", 13)
add(date(2025, 12, 25), "Christmas card postage", "other", 8.5, "International mail", 10)
add(date(2026, 1, 30), "Laundry card top-up", "other", 20, "Apartment laundry", 9)
add(date(2026, 2, 12), "Gift for housemate", "other", 25, "Birthday present", 14)

// ─── insert into MongoDB ───────────────────────────────────────────────

console.log(`Generated ${expenses.length} new expense records`)
console.log(`Date range: ${expenses.reduce((min, e) => e.date < min ? e.date : min, "9999")} → ${expenses.reduce((max, e) => e.date > max ? e.date : max, "0000")}`)

// Category breakdown
const byCategory: Record<string, number> = {}
for (const e of expenses) {
  byCategory[e.category] = (byCategory[e.category] ?? 0) + 1
}
console.log("\nCategory breakdown:")
for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`)
}

const total = expenses.reduce((sum, e) => sum + e.amount, 0)
console.log(`\nTotal amount: $${total.toFixed(2)} AUD`)

// Connect and insert
const client = new MongoClient(MONGODB_URI)
try {
  await client.connect()
  const db = client.db()
  const collection = db.collection("expenses")

  const existingCount = await collection.countDocuments()
  console.log(`\nExisting records in DB: ${existingCount}`)

  const result = await collection.insertMany(expenses)
  console.log(`Inserted ${result.insertedCount} new records`)

  const finalCount = await collection.countDocuments()
  console.log(`Total records now: ${finalCount}`)
} finally {
  await client.close()
}
