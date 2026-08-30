# frontned logic
Create a single-page React + Tailwind CSS fintech dashboard called "Vyapar Pulse" 
for an AI agent that monitors a small merchant's Razorpay transactions and 
autonomously runs win-back/upsell campaigns. Combine three sections on one page:

1. TOP: Summary stat cards (Revenue Today, Transactions, Active Customers, 
   Revenue Recovered by Agent This Week) + a 7-day revenue trend line chart

2. MIDDLE: A "Flagged Customers" table — customer name, last purchase date, 
   days lapsed, signal type (Lapsed/Basket Shrink/Slow Day) as colored badges, 
   suggested action, redeemed status. Include a small "capped: 1/customer/30 
   days" tooltip to show bounded logic.

3. BOTTOM: An "Agent Activity Log" — a scrollable audit trail list showing 
   timestamp, what was detected, what action was taken, and a plain-language 
   "why" for each entry. Include one entry showing a gracefully-handled 
   delivery failure (amber badge, not an error crash).

Style: dark navy/charcoal fintech theme, gold and emerald accents for positive 
actions, red/amber for failures/warnings. Clean, minimal, no clutter — this 
will be shown live to hackathon judges. Use realistic dummy data throughout 
(15+ transactions, 8+ flagged customers, 8+ log entries). Fully responsive, 
single file, no routing or auth needed.

# correction 1 

Make it:
- Light theme
- Less congested
- More spacious
- Easier to scan
- More user-friendly
- More professional

Remove or simplify unnecessary visual elements.
Combine repetitive sections where appropriate.
Increase whitespace and padding.
Improve typography hierarchy.
Make primary actions visually obvious.
Reduce the number of competing colors.
Use subtle borders and shadows instead of heavy containers.
Avoid excessive cards within cards.
Avoid unnecessary icons and decorative graphics.

Think like a senior product designer optimizing the interface for a first-time user.

The user should understand:
1. Where they are
2. What the AI agent does
3. What they should do next
4. What the important results/status are

within a few seconds of opening the page.

Do NOT make the interface flashy.
Do NOT overcrowd the page.
Do NOT add unnecessary features.
Prioritize clarity, simplicity, whitespace, and usability.