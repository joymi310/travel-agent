export interface TreeQuestion {
  id: string
  question: string
  type?: 'options' | 'text'
  placeholder?: string
  options?: { id: string; label: string; desc?: string }[]
}

const ORIGIN_QUESTION: TreeQuestion = {
  id: 'origin',
  type: 'text',
  question: 'Where are you flying from?',
  placeholder: 'e.g. Wellington, Sydney, London, New York…',
}

const DESTINATION_QUESTION: TreeQuestion = {
  id: 'destination',
  type: 'text',
  question: 'Do you have a destination in mind?',
  placeholder: 'e.g. Japan, Southeast Asia, Europe — or leave blank if you\'d like suggestions',
}

export const PROFILE_TREE: Record<string, TreeQuestion[]> = {
  backpacker: [
    {
      id: 'companions',
      question: 'Who are you travelling with?',
      options: [
        { id: 'solo', label: 'Solo' },
        { id: 'partner', label: 'Partner' },
        { id: 'group', label: 'Small group of friends' },
      ],
    },
    ORIGIN_QUESTION,
    DESTINATION_QUESTION,
    {
      id: 'budget',
      question: 'Daily budget per person (NZD)?',
      options: [
        { id: 'tight', label: 'Under $80/day', desc: 'Dorms, street food, free activities' },
        { id: 'mid', label: '$80–150/day', desc: 'Private rooms, local restaurants' },
        { id: 'flex', label: '$150+/day', desc: 'Comfort when it matters' },
      ],
    },
    {
      id: 'trip_length',
      question: 'How long is the trip?',
      options: [
        { id: 'week', label: 'Up to 1 week' },
        { id: 'two_weeks', label: '1–2 weeks' },
        { id: 'three_weeks', label: '2–3 weeks' },
        { id: 'month_plus', label: 'A month or more' },
      ],
    },
    {
      id: 'extra',
      type: 'text',
      question: 'Anything else we should know?',
      placeholder: 'e.g. avoiding certain regions, must-see places, physical limitations…',
    },
  ],

  family_young_kids: [
    {
      id: 'num_kids',
      question: 'How many kids are travelling?',
      options: [
        { id: 'one', label: '1 child' },
        { id: 'two', label: '2 children' },
        { id: 'three_plus', label: '3 or more' },
      ],
    },
    ORIGIN_QUESTION,
    DESTINATION_QUESTION,
    {
      id: 'ages',
      question: 'How old are the youngest kids?',
      options: [
        { id: 'infant', label: 'Under 1 (lap infant)' },
        { id: 'toddler', label: '1–2 years' },
        { id: 'preschool', label: '3–5 years' },
        { id: 'mixed', label: 'Mix of young ages' },
      ],
    },
    {
      id: 'naps',
      question: 'Are nap schedules a factor?',
      options: [
        { id: 'strict', label: 'Yes — naps are sacred', desc: 'Itinerary needs to work around them' },
        { id: 'flexible', label: 'Somewhat — we can push when needed' },
        { id: 'none', label: 'No — past that stage' },
      ],
    },
    {
      id: 'flight_tolerance',
      question: 'Longest flight you\'re comfortable with?',
      options: [
        { id: 'short', label: 'Up to 4 hours', desc: 'Pacific islands, Australia' },
        { id: 'medium', label: 'Up to 8 hours', desc: 'Asia with a stopover' },
        { id: 'long', label: 'We\'ll manage anything', desc: 'Europe, Americas' },
      ],
    },
    {
      id: 'interests',
      question: 'What do the kids love?',
      options: [
        { id: 'beach', label: 'Beach & water', desc: 'Sand, pools, snorkelling' },
        { id: 'animals', label: 'Animals & wildlife', desc: 'Zoos, safaris, farms' },
        { id: 'theme_parks', label: 'Theme parks & rides' },
        { id: 'culture', label: 'New experiences', desc: 'Happy to explore anything' },
      ],
    },
    {
      id: 'priority',
      question: 'What matters most to the grown-ups?',
      options: [
        { id: 'ease', label: 'Minimising stress', desc: 'Easy logistics, resort base' },
        { id: 'beach', label: 'Beach & pool time', desc: 'The kids can run free' },
        { id: 'culture', label: 'Cultural experiences', desc: 'Worth the extra effort' },
        { id: 'budget', label: 'Keeping costs down', desc: 'Family travel is expensive enough' },
      ],
    },
    {
      id: 'trip_length',
      question: 'How long is the trip?',
      options: [
        { id: 'week', label: 'Up to 1 week' },
        { id: 'two_weeks', label: '1–2 weeks' },
        { id: 'three_weeks', label: '2–3 weeks' },
        { id: 'month_plus', label: 'A month or more' },
      ],
    },
    {
      id: 'extra',
      type: 'text',
      question: 'Anything else we should know?',
      placeholder: 'e.g. first overseas trip, one child has dietary needs, grandparents coming too…',
    },
  ],

  family_teens: [
    {
      id: 'teen_ages',
      question: 'How old are the teens?',
      options: [
        { id: 'young_teens', label: '12–14' },
        { id: 'older_teens', label: '15–17' },
        { id: 'mixed', label: 'Mixed ages' },
      ],
    },
    ORIGIN_QUESTION,
    DESTINATION_QUESTION,
    {
      id: 'trip_vibe',
      question: 'What kind of trip?',
      options: [
        { id: 'adventure', label: 'Adventure & active', desc: 'Hiking, surfing, adrenaline' },
        { id: 'cities', label: 'Cities & culture', desc: 'Food, history, street life' },
        { id: 'beach', label: 'Beach & chill', desc: 'Relaxed base, day trips' },
        { id: 'mix', label: 'Mix of everything' },
      ],
    },
    {
      id: 'independence',
      question: 'How much teen independence do you want to build in?',
      options: [
        { id: 'together', label: 'Everything together' },
        { id: 'some', label: 'Some free time for them' },
        { id: 'lots', label: 'Lots — they\'re nearly adults' },
      ],
    },
    {
      id: 'trip_length',
      question: 'How long is the trip?',
      options: [
        { id: 'week', label: 'Up to 1 week' },
        { id: 'two_weeks', label: '1–2 weeks' },
        { id: 'three_weeks', label: '2–3 weeks' },
        { id: 'month_plus', label: 'A month or more' },
      ],
    },
    {
      id: 'extra',
      type: 'text',
      question: 'Anything else we should know?',
      placeholder: 'e.g. teens have specific interests, budget constraints, school holiday dates…',
    },
  ],

  senior: [
    {
      id: 'style',
      question: 'How do you prefer to travel?',
      options: [
        { id: 'independent', label: 'Independent', desc: 'Self-planned, own pace' },
        { id: 'guided', label: 'Guided tours', desc: 'Everything arranged' },
        { id: 'cruise', label: 'Cruise-based', desc: 'Ship as home base' },
        { id: 'mix', label: 'Mix — independent with some structure' },
      ],
    },
    ORIGIN_QUESTION,
    DESTINATION_QUESTION,
    {
      id: 'mobility',
      question: 'Any mobility or accessibility considerations?',
      options: [
        { id: 'none', label: 'No special requirements' },
        { id: 'some', label: 'Prefer to avoid long walks or stairs' },
        { id: 'wheelchair', label: 'Wheelchair or mobility aid' },
      ],
    },
    {
      id: 'accommodation',
      question: 'Accommodation preference?',
      options: [
        { id: 'comfort', label: '3–4 star hotels', desc: 'Comfortable and reliable' },
        { id: 'premium', label: 'Premium / luxury', desc: 'Worth the extra cost' },
        { id: 'variety', label: 'Mix — boutique and interesting' },
      ],
    },
    {
      id: 'trip_length',
      question: 'How long is the trip?',
      options: [
        { id: 'week', label: 'Up to 1 week' },
        { id: 'two_weeks', label: '1–2 weeks' },
        { id: 'three_weeks', label: '2–3 weeks' },
        { id: 'month_plus', label: 'A month or more' },
      ],
    },
    {
      id: 'extra',
      type: 'text',
      question: 'Anything else we should know?',
      placeholder: 'e.g. dietary requirements, specific interests, health considerations…',
    },
  ],

  off_beaten_track: [
    {
      id: 'companions',
      question: 'Travelling solo or with others?',
      options: [
        { id: 'solo', label: 'Solo' },
        { id: 'partner', label: 'Partner' },
        { id: 'small_group', label: 'Small group' },
      ],
    },
    ORIGIN_QUESTION,
    DESTINATION_QUESTION,
    {
      id: 'comfort',
      question: 'Comfort level on the road?',
      options: [
        { id: 'rough', label: 'Happy roughing it', desc: 'Basic guesthouses, local transport' },
        { id: 'mid', label: 'Adventurous but not spartan', desc: 'Some comfort matters' },
        { id: 'comfort', label: 'Off the beaten track, not off the grid', desc: 'Nice beds at the end of the day' },
      ],
    },
    {
      id: 'trip_length',
      question: 'How long is the trip?',
      options: [
        { id: 'week', label: 'Up to 1 week' },
        { id: 'two_weeks', label: '1–2 weeks' },
        { id: 'three_weeks', label: '2–3 weeks' },
        { id: 'month_plus', label: 'A month or more' },
      ],
    },
    {
      id: 'extra',
      type: 'text',
      question: 'Anything else we should know?',
      placeholder: 'e.g. regions to avoid, specific interests, visa constraints…',
    },
  ],

  other: [],
}

// Map profile data to system prompt context text
export function buildProfileContext(
  travelStyle: string,
  profileData: Record<string, string>
): string {
  const lines: string[] = []
    const tripLengths: Record<string, string> = { week: 'up to 1 week', two_weeks: '1–2 weeks', three_weeks: '2–3 weeks', month_plus: 'a month or more' }
  const tripLength = profileData.trip_length ? `Trip length: ${tripLengths[profileData.trip_length] ?? profileData.trip_length}.` : null
  const origin = profileData.origin ? `Flying from: ${profileData.origin}.` : null
  const destination = profileData.destination ? `Destination in mind: ${profileData.destination}.` : 'No specific destination yet — they want guidance on where to go.'
  const extra = profileData.extra ? `Additional context: ${profileData.extra}` : null

  if (travelStyle === 'backpacker') {
    const companions: Record<string, string> = { solo: 'solo', partner: 'with a partner', group: 'with a small group' }
    const budgets: Record<string, string> = { tight: 'under NZD $80/day (dorms, street food)', mid: 'NZD $80–150/day (private rooms, local restaurants)', flex: 'NZD $150+/day (comfort when it matters)' }
    lines.push('This is a budget-conscious backpacker traveller.')
    if (profileData.companions) lines.push(`Travelling ${companions[profileData.companions] ?? profileData.companions}.`)
    if (profileData.budget) lines.push(`Budget: ${budgets[profileData.budget] ?? profileData.budget}.`)
    lines.push('Prioritise hostels, guesthouses, cheap eats, slow travel, and value. Mention free activities.')
  }

  else if (travelStyle === 'family_young_kids') {
    const numKids: Record<string, string> = { one: '1 child', two: '2 children', three_plus: '3 or more children' }
    const ages: Record<string, string> = { infant: 'a lap infant (under 1)', toddler: 'a toddler (1–2 years)', preschool: 'preschool-age children (3–5)', mixed: 'a mix of young children' }
    const naps: Record<string, string> = { strict: 'nap schedules are strict and must be factored into daily planning', flexible: 'nap schedules are somewhat flexible', none: 'kids are past napping' }
    const flights: Record<string, string> = { short: 'up to 4 hours', medium: 'up to 8 hours', long: 'any duration' }
    const interests: Record<string, string> = { beach: 'beach and water activities', animals: 'animals and wildlife', theme_parks: 'theme parks and rides', culture: 'open to new experiences' }
    const priorities: Record<string, string> = { ease: 'minimising travel stress and logistics', beach: 'beach and resort-style holidays where kids can run free', culture: 'cultural experiences worth the extra effort', budget: 'keeping costs down' }
    lines.push('This traveller has young children.')
    if (profileData.num_kids) lines.push(`Number of kids: ${numKids[profileData.num_kids] ?? profileData.num_kids}.`)
    if (profileData.ages) lines.push(`Youngest child: ${ages[profileData.ages] ?? profileData.ages}.`)
    if (profileData.naps) lines.push(`Nap schedule: ${naps[profileData.naps] ?? profileData.naps}.`)
    if (profileData.flight_tolerance) lines.push(`Comfortable with flights up to ${flights[profileData.flight_tolerance] ?? profileData.flight_tolerance}.`)
    if (profileData.interests) lines.push(`Kids' interests: ${interests[profileData.interests] ?? profileData.interests}.`)
    if (profileData.priority) lines.push(`Adults' top priority: ${priorities[profileData.priority] ?? profileData.priority}.`)
    lines.push('Suggest nap-friendly pacing, family rooms, child-friendly restaurants, and early dinners. When a destination or activity has challenges for young kids, explain how to handle them — not whether to avoid them.')
  }

  else if (travelStyle === 'family_teens') {
    const ages: Record<string, string> = { young_teens: '12–14 year olds', older_teens: '15–17 year olds', mixed: 'a mix of teen ages' }
    const vibes: Record<string, string> = { adventure: 'adventure and active experiences', cities: 'cities and cultural experiences', beach: 'beach and relaxed base with day trips', mix: 'a mix of everything' }
    const independence: Record<string, string> = { together: 'everything together as a family', some: 'some free time built in for the teens', lots: 'significant independence for the teens' }
    lines.push('This traveller has teenagers.')
    if (profileData.teen_ages) lines.push(`Teen ages: ${ages[profileData.teen_ages] ?? profileData.teen_ages}.`)
    if (profileData.trip_vibe) lines.push(`Looking for: ${vibes[profileData.trip_vibe] ?? profileData.trip_vibe}.`)
    if (profileData.independence) lines.push(`Approach to independence: ${independence[profileData.independence] ?? profileData.independence}.`)
    lines.push('Avoid framing everything as "family-friendly" in a patronising way — teens want genuine experiences.')
  }

  else if (travelStyle === 'senior') {
    const styles: Record<string, string> = { independent: 'independent self-planned travel', guided: 'guided tours with everything arranged', cruise: 'cruise-based travel', mix: 'a mix of independent and structured travel' }
    const mobility: Record<string, string> = { none: 'no special mobility requirements', some: 'preference to avoid long walks or many stairs', wheelchair: 'requires wheelchair or mobility aid accessibility' }
    const accom: Record<string, string> = { comfort: '3–4 star hotels', premium: 'premium or luxury properties', variety: 'boutique and interesting mix' }
    lines.push('This is a senior traveller.')
    if (profileData.style) lines.push(`Prefers ${styles[profileData.style] ?? profileData.style}.`)
    if (profileData.mobility) lines.push(`Mobility: ${mobility[profileData.mobility] ?? profileData.mobility}.`)
    if (profileData.accommodation) lines.push(`Accommodation: ${accom[profileData.accommodation] ?? profileData.accommodation}.`)
    lines.push('Prioritise comfort and manageable pacing. When something involves physical demands, explain what to expect and how to adapt — not whether to skip it.')
  }

  else if (travelStyle === 'off_beaten_track') {
    const companions: Record<string, string> = { solo: 'solo', partner: 'with a partner', small_group: 'with a small group' }
    const comfort: Record<string, string> = { rough: 'happy with basic guesthouses and local transport', mid: 'adventurous but not spartan — some comfort matters', comfort: 'off the beaten track but wants a nice bed at the end of the day' }
    lines.push('This traveller wants to avoid tourist crowds and find genuine, lesser-known experiences.')
    if (profileData.companions) lines.push(`Travelling ${companions[profileData.companions] ?? profileData.companions}.`)
    if (profileData.comfort) lines.push(`Comfort level: ${comfort[profileData.comfort] ?? profileData.comfort}.`)
    lines.push('Suggest lesser-known destinations, off-season timing, alternatives to obvious choices.')
  }

  if (origin) lines.push(origin)
  if (destination) lines.push(destination)
  if (tripLength) lines.push(tripLength)
  if (extra) lines.push(extra)

  return lines.join(' ')
}
