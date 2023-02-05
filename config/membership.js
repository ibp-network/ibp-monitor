/*
 * This file contains the config required to run the batch call for monthly payments
 * why .js? It allows for json, comments and utility functions all in one
 */

/**
 * points: cumulative, calculate 'rank'
 * reward: cost re-imbured per month (USD)
 * range: [low, high] of reward
 * rate: hourly rate for chargeable activities (USD)
 * advance: payment for hardware setup (USD)
 */

const levels = {
  // hobbyist                                              points
  h1:  { points: 60, reward: 300 }, // USD per month       cum.   60
  h2:  { points: 60, reward: 300 }, // USD per month             120
  h3:  { points: 40, reward: 0, rate: 50 }, // USD per hour      160
  // professional
  p1:  { points: 30, reward: 1200, range: [600, 3000],   advance: 5000 },  // 190
  p2:  { points: 0,  reward: 0,             advance: 15000 }, // 190
  p3:  { points: 30, reward: 5500, range: [2500, 10000], advance: 0 },     // 210
  p4:  { points: 0,  reward: 4500, range: [3000, 10500], advance: 15000 }, // 210
  p5:  { points: 30, reward: 6000, range: [3200, 11000], advance: 0 },
  p6:  { points: 15, reward: 800,           advance: 0 },
  p71: { points: 30, reward: 600,           advance: 0 },
  p72: { points: 30, reward: 1200,          advance: 0 },
  p73: { points: 30, reward: 1600,          advance: 0 },
  p8:  { points: 100, reward: 0,            advance: 0 },
}

const members = [
  { handle: 'stake.plus',    name: 'Tom',      levels: ['h1','h2','p1','p2'], advanced: 10000 },
  { handle: 'amforc',        name: 'Tugy',     levels: [] },
  { handle: 'crifferent.de', name: 'Dev0_sik', levels: [] },
  { handle: 'gatotech',      name: 'Miloš',    levels: [] },
  { handle: 'helikon.io',    name: 'Kukabi',   levels: [] },
  { handle: 'metaspan',      name: 'Derek',    levels: ['h1','h2','h3','p73'] }
]

let results = []

members.forEach(member => {
  var score = 0
  var reward = 0
  var advance = 0
  member.levels.forEach(level => {
    score += levels[level].points || 0
    reward += levels[level].reward || 0
    advance += levels[level].advance || 0
  })
  results.push({
    handle: member.handle, score, reward, 
    advance,
    advanced: member.advanced || 0,
    due: reward + Math.max(advance - member.advanced || 0, 0),
    levels: member.levels.join(',')
  })
  console.log(member.handle, )
})

console.table(results)
