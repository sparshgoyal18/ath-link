// ATH-LINK v2 — Data (clean, no fake accounts)

const CITIES = [
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka',      turfCount: 24, tagline: 'Silicon City Sports Hub',     gradient: 'linear-gradient(135deg,#1a472a,#2d6a4f)' },
  { id: 'mumbai',    name: 'Mumbai',    state: 'Maharashtra',     turfCount: 31, tagline: 'City of Champions',           gradient: 'linear-gradient(135deg,#1a237e,#283593)' },
  { id: 'delhi',     name: 'Delhi',     state: 'NCR',             turfCount: 28, tagline: 'Capital Sports District',     gradient: 'linear-gradient(135deg,#b71c1c,#c62828)' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana',       turfCount: 19, tagline: 'Pearl City Turfs',            gradient: 'linear-gradient(135deg,#4a148c,#6a1b9a)' },
  { id: 'chennai',   name: 'Chennai',   state: 'Tamil Nadu',      turfCount: 22, tagline: 'Marina Sports Hub',           gradient: 'linear-gradient(135deg,#e65100,#bf360c)' },
  { id: 'pune',      name: 'Pune',      state: 'Maharashtra',     turfCount: 16, tagline: 'Sports City of the West',     gradient: 'linear-gradient(135deg,#004d40,#00695c)' },
  { id: 'kolkata',   name: 'Kolkata',   state: 'West Bengal',     turfCount: 18, tagline: 'Football Capital of India',   gradient: 'linear-gradient(135deg,#1b5e20,#2e7d32)' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat',         turfCount: 14, tagline: 'Sports Metro of Gujarat',     gradient: 'linear-gradient(135deg,#0d47a1,#1565c0)' },
  { id: 'indore',    name: 'Indore',    state: 'Madhya Pradesh',  turfCount: 12, tagline: 'Mini Mumbai of MP',           gradient: 'linear-gradient(135deg,#1a0a30,#5c1a7a)' },
];

const SPORTS_MAP = {
  football:   { name: 'Football',   icon: '⚽', color: '#4CAF50', players: 11 },
  cricket:    { name: 'Cricket',    icon: '🏏', color: '#FF9800', players: 11 },
  badminton:  { name: 'Badminton',  icon: '🏸', color: '#AB47BC', players: 4  },
  tennis:     { name: 'Tennis',     icon: '🎾', color: '#EF5350', players: 4  },
  basketball: { name: 'Basketball', icon: '🏀', color: '#FF7043', players: 10 },
  volleyball: { name: 'Volleyball', icon: '🏐', color: '#42A5F5', players: 12 },
};

const AMENITIES_MAP = {
  floodlights:   { name: 'Floodlights',      icon: '💡' },
  parking:       { name: 'Free Parking',     icon: '🅿️' },
  changing_room: { name: 'Changing Rooms',   icon: '🚪' },
  washroom:      { name: 'Washrooms',        icon: '🚿' },
  drinking_water:{ name: 'Drinking Water',   icon: '💧' },
  first_aid:     { name: 'First Aid',        icon: '🩺' },
  cafeteria:     { name: 'Cafeteria',        icon: '☕' },
  equipment:     { name: 'Equipment Rental', icon: '🎽' },
  wifi:          { name: 'Free Wi-Fi',       icon: '📶' },
  scoreboard:    { name: 'Scoreboard',       icon: '📊' },
  coaching:      { name: 'Coaching',         icon: '🏅' },
  ac:            { name: 'Air Conditioned',  icon: '❄️' },
};

const TURFS = [
  // ─── BANGALORE ────────────────────────────────────────────────────────────
  {
    id:'t1', name:'Arena Sports Complex', cityId:'bangalore',
    address:'Koramangala 5th Block, Bangalore', sports:['football','cricket'],
    amenities:['floodlights','parking','changing_room','washroom','drinking_water','first_aid','cafeteria'],
    rating:4.7, reviewCount:234, pricing:{football:1200,cricket:1800},
    gradient:'linear-gradient(135deg,#0d2b1a,#1a5c36)',
    description:'State-of-the-art sports complex featuring premium artificial turf with FIFA-certified grass. Perfect for competitive matches and casual games alike.',
    openHour:5, closeHour:23,
  },
  {
    id:'t2', name:'SportZone Indiranagar', cityId:'bangalore',
    address:'100 Feet Road, Indiranagar, Bangalore', sports:['badminton','tennis'],
    amenities:['floodlights','parking','changing_room','washroom','ac','equipment','wifi'],
    rating:4.5, reviewCount:189, pricing:{badminton:600,tennis:900},
    gradient:'linear-gradient(135deg,#1a0a30,#4a1090)',
    description:'Premium indoor badminton and tennis courts with wooden flooring and professional net systems.',
    openHour:6, closeHour:22,
  },
  {
    id:'t3', name:'Green Field Whitefield', cityId:'bangalore',
    address:'EPIP Zone, Whitefield, Bangalore', sports:['football','basketball','volleyball'],
    amenities:['floodlights','parking','changing_room','washroom','drinking_water','scoreboard'],
    rating:4.3, reviewCount:156, pricing:{football:1000,basketball:800,volleyball:700},
    gradient:'linear-gradient(135deg,#0a1a08,#2a5c20)',
    description:'Multi-sport turf complex in the heart of Whitefield with excellent facilities for corporate and casual bookings.',
    openHour:6, closeHour:22,
  },
  {
    id:'t4', name:'PlayMax HSR Layout', cityId:'bangalore',
    address:'Sector 2, HSR Layout, Bangalore', sports:['football','cricket'],
    amenities:['floodlights','parking','washroom','drinking_water','first_aid','cafeteria','coaching'],
    rating:4.6, reviewCount:312, pricing:{football:1400,cricket:2000},
    gradient:'linear-gradient(135deg,#001a20,#005a70)',
    description:'Professional-grade turf with coaching facilities. Home to multiple local football tournaments.',
    openHour:5, closeHour:23,
  },
  // ─── MUMBAI ───────────────────────────────────────────────────────────────
  {
    id:'t5', name:'Juhu Sports Arena', cityId:'mumbai',
    address:'Juhu Beach Road, Mumbai', sports:['football','volleyball'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','scoreboard'],
    rating:4.8, reviewCount:401, pricing:{football:1500,volleyball:900},
    gradient:'linear-gradient(135deg,#0a0a2a,#1a1a6a)',
    description:"Mumbai's premier beachside sports arena with stunning views and top-notch facilities.",
    openHour:5, closeHour:23,
  },
  {
    id:'t6', name:'Andheri Sports Hub', cityId:'mumbai',
    address:'Andheri West, Mumbai', sports:['cricket','badminton','tennis'],
    amenities:['floodlights','parking','changing_room','washroom','equipment','wifi','first_aid'],
    rating:4.4, reviewCount:267, pricing:{cricket:2200,badminton:700,tennis:1100},
    gradient:'linear-gradient(135deg,#1a0a00,#5a2a00)',
    description:'Multi-sport hub in Andheri with professional coaching available for all skill levels.',
    openHour:6, closeHour:22,
  },
  {
    id:'t7', name:'Bandra Turf Club', cityId:'mumbai',
    address:'Bandra Kurla Complex, Mumbai', sports:['football','basketball'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','coaching','scoreboard'],
    rating:4.6, reviewCount:198, pricing:{football:1800,basketball:1200},
    gradient:'linear-gradient(135deg,#0a1a30,#1a4a80)',
    description:'Premium turf at BKC with excellent corporate booking packages and state-of-the-art facilities.',
    openHour:5, closeHour:23,
  },
  // ─── DELHI ────────────────────────────────────────────────────────────────
  {
    id:'t8', name:'Capital Grounds Dwarka', cityId:'delhi',
    address:'Sector 10, Dwarka, New Delhi', sports:['football','cricket'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','first_aid'],
    rating:4.5, reviewCount:289, pricing:{football:1100,cricket:1600},
    gradient:'linear-gradient(135deg,#2a0a0a,#7a1a1a)',
    description:'Premium sports ground in Dwarka with well-maintained artificial grass and modern amenities.',
    openHour:5, closeHour:23,
  },
  {
    id:'t9', name:'Delhi Sports Complex Saket', cityId:'delhi',
    address:'Saket, South Delhi', sports:['badminton','tennis'],
    amenities:['floodlights','parking','ac','changing_room','washroom','equipment','coaching','wifi'],
    rating:4.7, reviewCount:345, pricing:{badminton:650,tennis:950},
    gradient:'linear-gradient(135deg,#1a0a2a,#4a1a7a)',
    description:"South Delhi's finest indoor sports complex with climate-controlled courts and expert coaching.",
    openHour:6, closeHour:22,
  },
  // ─── HYDERABAD ────────────────────────────────────────────────────────────
  {
    id:'t10', name:'HiTec Sports Arena', cityId:'hyderabad',
    address:'HITEC City, Hyderabad', sports:['football','cricket','basketball'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','wifi','scoreboard'],
    rating:4.6, reviewCount:278, pricing:{football:1300,cricket:1900,basketball:900},
    gradient:'linear-gradient(135deg,#1a0a30,#4a1a8a)',
    description:'Modern sports complex in the IT hub of Hyderabad, perfect for corporate teams and professional leagues.',
    openHour:5, closeHour:23,
  },
  {
    id:'t11', name:'Gachibowli Game Zone', cityId:'hyderabad',
    address:'Gachibowli, Hyderabad', sports:['football','volleyball'],
    amenities:['floodlights','parking','changing_room','washroom','first_aid','drinking_water'],
    rating:4.3, reviewCount:167, pricing:{football:1100,volleyball:750},
    gradient:'linear-gradient(135deg,#0a1a10,#1a5a30)',
    description:'Budget-friendly sports zone with quality turf near the stadium district.',
    openHour:6, closeHour:22,
  },
  // ─── CHENNAI ──────────────────────────────────────────────────────────────
  {
    id:'t12', name:'Marina Sports Hub', cityId:'chennai',
    address:'Nungambakkam, Chennai', sports:['football','cricket'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','coaching'],
    rating:4.5, reviewCount:223, pricing:{football:1000,cricket:1500},
    gradient:'linear-gradient(135deg,#1a0a00,#5a3000)',
    description:"Chennai's favourite sports destination with red earth and premium artificial turf options.",
    openHour:5, closeHour:23,
  },
  // ─── PUNE ─────────────────────────────────────────────────────────────────
  {
    id:'t13', name:'Pune Sports Village', cityId:'pune',
    address:'Viman Nagar, Pune', sports:['football','badminton','cricket'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','equipment','first_aid'],
    rating:4.4, reviewCount:198, pricing:{football:1000,badminton:550,cricket:1500},
    gradient:'linear-gradient(135deg,#001a15,#004d40)',
    description:'Multi-sport village in Viman Nagar, Pune with lush green turf and modern facilities.',
    openHour:5, closeHour:23,
  },
  // ─── KOLKATA ──────────────────────────────────────────────────────────────
  {
    id:'t14', name:'Calcutta Football Academy', cityId:'kolkata',
    address:'Salt Lake, Kolkata', sports:['football','cricket'],
    amenities:['floodlights','parking','changing_room','washroom','cafeteria','coaching','scoreboard'],
    rating:4.8, reviewCount:456, pricing:{football:900,cricket:1400},
    gradient:'linear-gradient(135deg,#0a1a05,#1a5010)',
    description:"Kolkata's premier football academy and turf, known for nurturing state-level talent.",
    openHour:5, closeHour:23,
  },
  // ─── INDORE ───────────────────────────────────────────────────────────────
  {
    id:'t15', name:'Indore Premier Sports Arena', cityId:'indore',
    address:'Vijay Nagar, Indore', sports:['football','cricket','badminton'],
    amenities:['floodlights','parking','changing_room','washroom','drinking_water','cafeteria','first_aid','scoreboard'],
    rating:4.6, reviewCount:187, pricing:{football:1000,cricket:1500,badminton:550},
    gradient:'linear-gradient(135deg,#1a0a30,#5c1a7a)',
    description:"Indore's finest multi-sport arena in Vijay Nagar, equipped with premium synthetic turf and well-lit courts.",
    openHour:5, closeHour:23,
  },
  {
    id:'t16', name:'Daly College Turf Ground', cityId:'indore',
    address:'Residency Area, Indore', sports:['football','cricket'],
    amenities:['floodlights','parking','changing_room','washroom','coaching','scoreboard','drinking_water'],
    rating:4.4, reviewCount:143, pricing:{football:900,cricket:1300},
    gradient:'linear-gradient(135deg,#0a1500,#2a4a00)',
    description:'Heritage-area turf with a legacy of sporting excellence. Professional coaching available.',
    openHour:6, closeHour:22,
  },
  {
    id:'t17', name:'Palasia Sports Hub', cityId:'indore',
    address:'Palasia Square, Indore', sports:['badminton','tennis','basketball'],
    amenities:['floodlights','parking','ac','changing_room','washroom','equipment','wifi','first_aid'],
    rating:4.5, reviewCount:98, pricing:{badminton:500,tennis:850,basketball:750},
    gradient:'linear-gradient(135deg,#001a2a,#003a5a)',
    description:'Modern indoor sports facility with air-conditioned courts. Ideal for all-weather play.',
    openHour:6, closeHour:22,
  },
];

// ─── SEED OPEN TEAMS (no fake members — only creator) ─────────────────────────
// These are demo teams. Real teams are created by logged-in users and stored in localStorage.
const SEED_TEAMS = [
  {
    id:'seed1', turfId:'t1', turfName:'Arena Sports Complex', cityId:'bangalore',
    sport:'football', slotDate:getTodayPlus(1), slotTime:'18:00',
    teamName:'Sunday Strikers', createdBy:'Team Captain', creatorId:null,
    avatar:'S', totalPlayersNeeded:11, currentPlayers:1, members:['Team Captain'],
    contact:'', description:'Looking for 10 more football players for a friendly Sunday match!',
    joinRequests:[],
  },
  {
    id:'seed2', turfId:'t2', turfName:'SportZone Indiranagar', cityId:'bangalore',
    sport:'badminton', slotDate:getTodayPlus(0), slotTime:'07:00',
    teamName:'Morning Shuttlers', createdBy:'Badminton Fan', creatorId:null,
    avatar:'M', totalPlayersNeeded:4, currentPlayers:1, members:['Badminton Fan'],
    contact:'', description:'Morning badminton doubles. Need 3 more players!',
    joinRequests:[],
  },
  {
    id:'seed3', turfId:'t5', turfName:'Juhu Sports Arena', cityId:'mumbai',
    sport:'football', slotDate:getTodayPlus(2), slotTime:'19:00',
    teamName:'Mumbai FC', createdBy:'Football Lover', creatorId:null,
    avatar:'M', totalPlayersNeeded:11, currentPlayers:1, members:['Football Lover'],
    contact:'', description:'Competitive 5-aside match. Skilled players preferred!',
    joinRequests:[],
  },
  {
    id:'seed4', turfId:'t10', turfName:'HiTec Sports Arena', cityId:'hyderabad',
    sport:'cricket', slotDate:getTodayPlus(1), slotTime:'06:00',
    teamName:'HiTec Hitters', createdBy:'Cricket Captain', creatorId:null,
    avatar:'H', totalPlayersNeeded:11, currentPlayers:1, members:['Cricket Captain'],
    contact:'', description:'Morning cricket session. All skill levels welcome!',
    joinRequests:[],
  },
  {
    id:'seed5', turfId:'t15', turfName:'Indore Premier Sports Arena', cityId:'indore',
    sport:'football', slotDate:getTodayPlus(3), slotTime:'17:00',
    teamName:'Indore United', createdBy:'Sports Enthusiast', creatorId:null,
    avatar:'I', totalPlayersNeeded:11, currentPlayers:1, members:['Sports Enthusiast'],
    contact:'', description:'Friendly football match in Indore. Join us!',
    joinRequests:[],
  },
];

// ─── TEAM STORAGE (localStorage-backed) ──────────────────────────────────────
function getTeams() {
  try {
    const s = localStorage.getItem('athlink_teams');
    if (s) return JSON.parse(s);
  } catch(e) {}
  // First time: seed + save
  localStorage.setItem('athlink_teams', JSON.stringify(SEED_TEAMS));
  return [...SEED_TEAMS];
}

function saveTeams(teams) {
  localStorage.setItem('athlink_teams', JSON.stringify(teams));
}

function getOpenTeamsByTurf(turfId) { return getTeams().filter(t => t.turfId === turfId); }
function getOpenTeamsByCity(cityId) { return getTeams().filter(t => t.cityId === cityId); }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTodayPlus(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function generateSlots(turf, dateStr) {
  const slots = [];
  let seed = 0;
  for (const c of (turf.id + dateStr)) seed = (seed * 31 + c.charCodeAt(0)) & 0xFFFF;
  for (let h = turf.openHour; h < turf.closeHour; h++) {
    const r = (seed + h * 7919) % 100;
    const isBooked = r < 28;
    const isPeak = h >= 17 && h <= 21;
    slots.push({
      time: String(h).padStart(2,'0') + ':00',
      endTime: String(h+1).padStart(2,'0') + ':00',
      available: !isBooked,
      isPeak,
    });
  }
  return slots;
}

function getTurfById(id) { return TURFS.find(t => t.id === id); }
function getTurfsByCity(cityId) { return TURFS.filter(t => t.cityId === cityId); }
function getCityById(id) { return CITIES.find(c => c.id === id); }
