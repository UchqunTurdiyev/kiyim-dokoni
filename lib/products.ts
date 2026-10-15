// Mahsulotlar katalogi — shu yerdan tahrirlang (rasm, narx, o'lcham, ta'rif, otzivlar)
// DIQQAT: rasmlar va otzivlar namuna sifatida qo'yilgan. Ishga tushirishdan oldin
// do'konning haqiqiy mahsulot rasmlari va mijozlarning haqiqiy otzivlari bilan almashtiring.

export type Category = "krossovka" | "kedi" | "tufli" | "etik" | "klassik";
export type Gender = "erkak" | "ayol" | "unisex";

export type Review = {
  name: string;
  city: string;
  rating: number;
  date: string;
  text: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: Category;
  gender: Gender;
  price: number;
  oldPrice?: number;
  image: string;
  color: string;
  material: string;
  sizes: number[];
  description: string;
  features: string[];
  badge?: "Yangi" | "Hit" | "Chegirma";
  popularity: number;
  createdAt: string;
  reviews: Review[];
};

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=900&q=75`;

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "krossovka", label: "Krossovkalar" },
  { value: "kedi", label: "Kedlar" },
  { value: "tufli", label: "Tuflilar" },
  { value: "etik", label: "Etiklar" },
  { value: "klassik", label: "Klassik" },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "erkak", label: "Erkaklar" },
  { value: "ayol", label: "Ayollar" },
  { value: "unisex", label: "Unisex" },
];

export const products: Product[] = [
  {
    id: "p01",
    sku: "MS-101",
    name: "Velocity Run Red",
    category: "krossovka",
    gender: "erkak",
    price: 489000,
    oldPrice: 649000,
    image: img("1542291026-7eec264c27ff"),
    color: "Qizil",
    material: "Nafas oluvchi to'qima (knit)",
    sizes: [40, 41, 42, 43, 44, 45],
    description:
      "Yengil va egiluvchan yugurish krossovkasi. To'qima ustki qismi oyoqni qisib qo'ymaydi, yumshoq taglik esa uzoq yurishda ham charchatmaydi.",
    features: ["Og'irligi atigi 260 g", "Amortizatsiyali taglik", "Sport va kundalik kiyish uchun"],
    badge: "Chegirma",
    popularity: 98,
    createdAt: "2026-09-20",
    reviews: [
      { name: "Sardor", city: "Toshkent", rating: 5, date: "2026-10-02", text: "Juda yengil, ertalabki yugurishga zo'r. O'lchami aniq tushdi." },
      { name: "Jasur", city: "Samarqand", rating: 5, date: "2026-09-28", text: "Rangi rasmdagidek, yetkazib berish 2 kunda keldi." },
      { name: "Bekzod", city: "Buxoro", rating: 4, date: "2026-09-25", text: "Qulay, faqat yarim o'lcham kattaroq oldim, to'g'ri qilgan ekanman." },
    ],
  },
  {
    id: "p02",
    sku: "MS-102",
    name: "Urban Leather Caramel",
    category: "krossovka",
    gender: "erkak",
    price: 559000,
    image: img("1549298916-b41d501d3772"),
    color: "Karamel",
    material: "Tabiiy charm",
    sizes: [39, 40, 41, 42, 43, 44],
    description:
      "Tabiiy charmdan tikilgan shahar uslubidagi krossovka. Jinsi, chinos va klassik shim bilan birdek chiroyli ko'rinadi.",
    features: ["100% tabiiy charm", "Rezina taglik", "Kuz-qish mavsumi uchun"],
    badge: "Yangi",
    popularity: 87,
    createdAt: "2026-10-05",
    reviews: [
      { name: "Akmal", city: "Toshkent", rating: 5, date: "2026-10-10", text: "Charmi sifatli, hidi ham yo'q. Narxiga arziydi." },
      { name: "Doniyor", city: "Andijon", rating: 4, date: "2026-10-08", text: "Chiroyli, birinchi kunlari biroz qattiq edi, keyin yumshadi." },
    ],
  },
  {
    id: "p03",
    sku: "MS-103",
    name: "Neon Trainer Lime",
    category: "krossovka",
    gender: "unisex",
    price: 429000,
    oldPrice: 519000,
    image: img("1606107557195-0e29a4b5b4aa"),
    color: "Laym",
    material: "Mesh + sintetika",
    sizes: [37, 38, 39, 40, 41, 42, 43],
    description:
      "Zal va fitnes mashg'ulotlari uchun barqaror trenirovka krossovkasi. Keng taglik yon tomonga harakatda oyoqni ushlab turadi.",
    features: ["Barqaror keng taglik", "Sirpanmaydigan protektor", "Tez quriydi"],
    badge: "Chegirma",
    popularity: 76,
    createdAt: "2026-08-14",
    reviews: [
      { name: "Madina", city: "Namangan", rating: 5, date: "2026-09-30", text: "Zalga kiyib yuribman, oyoq umuman terlamaydi." },
      { name: "Otabek", city: "Toshkent", rating: 4, date: "2026-09-18", text: "Rangi juda yorqin, yoqdi." },
    ],
  },
  {
    id: "p04",
    sku: "MS-104",
    name: "Pastel Cloud",
    category: "krossovka",
    gender: "ayol",
    price: 519000,
    image: img("1595950653106-6c9ebd614d3a"),
    color: "Pastel",
    material: "Ekocharm",
    sizes: [36, 37, 38, 39, 40],
    description:
      "Qalin platformali, pastel ranglardagi ayollar krossovkasi. Bo'yni sal baland ko'rsatadi va har qanday kiyim bilan uyg'unlashadi.",
    features: ["4 sm platforma", "Yumshoq ichki qavat", "Trend pastel ranglar"],
    badge: "Hit",
    popularity: 95,
    createdAt: "2026-09-01",
    reviews: [
      { name: "Nilufar", city: "Samarqand", rating: 5, date: "2026-10-11", text: "Rasmdagidan ham chiroyli! Hamma qayerdan olding deb so'rayapti." },
      { name: "Shahnoza", city: "Toshkent", rating: 5, date: "2026-10-03", text: "Juda qulay, kun bo'yi kiyib yurdim." },
      { name: "Gulnora", city: "Farg'ona", rating: 4, date: "2026-09-27", text: "Sifati yaxshi, faqat oq qismini ehtiyot qilish kerak." },
    ],
  },
  {
    id: "p05",
    sku: "MS-105",
    name: "Minimal White",
    category: "klassik",
    gender: "unisex",
    price: 399000,
    image: img("1608231387042-66d1773070a5"),
    color: "Oq",
    material: "Silliq charm",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "Ortiqcha detallarsiz oq charm krossovka — garderobning asosiy juftligi. Ofisga ham, sayrga ham mos.",
    features: ["Minimalistik dizayn", "Oson tozalanadi", "Barcha o'lchamlar mavjud"],
    popularity: 91,
    createdAt: "2026-07-10",
    reviews: [
      { name: "Kamola", city: "Toshkent", rating: 5, date: "2026-09-21", text: "Oddiy, lekin juda chiroyli. Ikkinchi juftini ham oldim." },
      { name: "Aziz", city: "Qarshi", rating: 5, date: "2026-09-15", text: "Tikilishi sifatli, ichi yumshoq." },
    ],
  },
  {
    id: "p06",
    sku: "MS-106",
    name: "Skate Classic Bordo",
    category: "kedi",
    gender: "unisex",
    price: 329000,
    oldPrice: 389000,
    image: img("1525966222134-fcfa99b8ae77"),
    color: "Bordo",
    material: "Zamsh + kanva",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "Klassik skeyt uslubidagi past kedlar. Mustahkam zamsh qo'shimchalar va vulkanizatsiyalangan taglik uzoq xizmat qiladi.",
    features: ["Vulkanizatsiyalangan taglik", "Zamsh qo'shimchalar", "Kundalik kiyish uchun"],
    badge: "Chegirma",
    popularity: 72,
    createdAt: "2026-06-22",
    reviews: [
      { name: "Javohir", city: "Toshkent", rating: 4, date: "2026-09-12", text: "Rangi ajoyib, kuzga ayni muddao." },
      { name: "Ulug'bek", city: "Samarqand", rating: 5, date: "2026-09-02", text: "Narxi arzon, sifati a'lo." },
    ],
  },
  {
    id: "p07",
    sku: "MS-107",
    name: "Floral Stiletto",
    category: "tufli",
    gender: "ayol",
    price: 459000,
    image: img("1543163521-1bf539c55dd2"),
    color: "Gulli naqsh",
    material: "Atlas mato",
    sizes: [35, 36, 37, 38, 39],
    description:
      "Gulli naqshli nafis tufli — to'y, bayram va maxsus kechalar uchun. 9 sm ingichka poshna oyoqni uzun ko'rsatadi.",
    features: ["9 sm poshna", "Yumshoq ichki taglik", "Bayramona dizayn"],
    badge: "Yangi",
    popularity: 69,
    createdAt: "2026-10-08",
    reviews: [
      { name: "Dilnoza", city: "Toshkent", rating: 5, date: "2026-10-12", text: "To'yga kiyib bordim, hamma maqtadi!" },
      { name: "Mohira", city: "Jizzax", rating: 4, date: "2026-10-09", text: "Chiroyli, poshnasi baland bo'lsa ham qulay." },
    ],
  },
  {
    id: "p08",
    sku: "MS-108",
    name: "Retro Rose",
    category: "krossovka",
    gender: "ayol",
    price: 469000,
    oldPrice: 559000,
    image: img("1551107696-a4b0c5a0d9a2"),
    color: "Pushti / Kulrang",
    material: "Zamsh + mesh",
    sizes: [36, 37, 38, 39, 40, 41],
    description:
      "Retro uslubdagi pushti krossovka. Zamsh va mesh birikmasi yengillik va nafislikni birlashtiradi.",
    features: ["Retro silueti", "Yumshoq ko'pikli taglik", "Nafas oluvchi mesh"],
    badge: "Hit",
    popularity: 89,
    createdAt: "2026-08-30",
    reviews: [
      { name: "Sevara", city: "Samarqand", rating: 5, date: "2026-10-06", text: "Rangi juda nozik, rasmdagidek keldi." },
      { name: "Zarina", city: "Navoiy", rating: 5, date: "2026-09-29", text: "Oyoqni umuman qisib qo'ymaydi, kun bo'yi kiyaman." },
    ],
  },
  {
    id: "p09",
    sku: "MS-109",
    name: "High Top Canvas Red",
    category: "kedi",
    gender: "unisex",
    price: 299000,
    image: img("1607522370275-f14206abe5d3"),
    color: "Qizil",
    material: "Kanva (paxta mato)",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "Baland bo'yli klassik kanva kedlar. Yengil, yuviladigan va har qanday yoshga mos — vaqt sinovidan o'tgan uslub.",
    features: ["Baland bo'yin", "Paxta kanva", "Rezina tumshuq"],
    popularity: 83,
    createdAt: "2026-05-18",
    reviews: [
      { name: "Shoxrux", city: "Toshkent", rating: 5, date: "2026-09-19", text: "Klassika! Juda yengil." },
      { name: "Malika", city: "Urganch", rating: 4, date: "2026-09-08", text: "Yaxshi kedlar, o'lcham jadvaliga mos keldi." },
    ],
  },
  {
    id: "p10",
    sku: "MS-110",
    name: "Workwear Boot Brown",
    category: "etik",
    gender: "erkak",
    price: 689000,
    oldPrice: 790000,
    image: img("1520639888713-7851133b1ed0"),
    color: "Jigarrang",
    material: "Tabiiy charm + mo'yna astar",
    sizes: [40, 41, 42, 43, 44, 45, 46],
    description:
      "Qishga mo'ljallangan issiq charm etik. Suv o'tkazmaydigan charm va mo'yna astar sovuq kunlarda ham oyoqni issiq saqlaydi.",
    features: ["Suv o'tkazmaydi", "Issiq mo'yna astar", "Sirpanmaydigan qalin taglik"],
    badge: "Hit",
    popularity: 93,
    createdAt: "2026-10-01",
    reviews: [
      { name: "Rustam", city: "Toshkent", rating: 5, date: "2026-10-13", text: "Juda issiq va mustahkam. O'tgan yilgisi ham hali yangidek." },
      { name: "Farrux", city: "Samarqand", rating: 5, date: "2026-10-07", text: "Charmi qalin, tikilishi puxta." },
      { name: "Ilhom", city: "Termiz", rating: 4, date: "2026-10-04", text: "Biroz og'irroq, lekin qish uchun aynan shunisi kerak." },
    ],
  },
  {
    id: "p11",
    sku: "MS-111",
    name: "Navy Classic Heel",
    category: "tufli",
    gender: "ayol",
    price: 419000,
    image: img("1515347619252-60a4bf4fff4f"),
    color: "To'q ko'k",
    material: "Zamsh",
    sizes: [35, 36, 37, 38, 39, 40],
    description:
      "Ofis va rasmiy tadbirlar uchun klassik zamsh tufli. 7 sm barqaror poshna kun bo'yi kiyishga qulay.",
    features: ["7 sm barqaror poshna", "Tabiiy zamsh", "Ofis uslubi"],
    popularity: 64,
    createdAt: "2026-07-25",
    reviews: [
      { name: "Feruza", city: "Toshkent", rating: 5, date: "2026-09-24", text: "Ishga har kuni kiyaman, oyoq charchamaydi." },
      { name: "Lola", city: "Samarqand", rating: 4, date: "2026-09-10", text: "Rangi juda chiroyli, zamshi sifatli." },
    ],
  },
  {
    id: "p12",
    sku: "MS-112",
    name: "Free Run Olive",
    category: "krossovka",
    gender: "erkak",
    price: 449000,
    image: img("1582588678413-dbf45f4823e9"),
    color: "Zaytun",
    material: "Knit to'qima",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    description:
      "Paypoqdek oyoqqa yopishadigan yengil krossovka. Egiluvchan taglik tabiiy qadamni takrorlaydi.",
    features: ["Paypoq effekti", "Juda egiluvchan taglik", "Yozgi va kuzgi mavsum"],
    badge: "Yangi",
    popularity: 78,
    createdAt: "2026-10-10",
    reviews: [
      { name: "Abdulloh", city: "Toshkent", rating: 5, date: "2026-10-12", text: "Yengilligi hayratlanarli, rangi ham o'zgacha." },
      { name: "Sherzod", city: "Qo'qon", rating: 4, date: "2026-10-09", text: "Qulay, yozda ham kiyish mumkin." },
    ],
  },
];

export const ALL_SIZES = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b);
export const PRICE_MIN = Math.min(...products.map((p) => p.price));
export const PRICE_MAX = Math.max(...products.map((p) => p.price));

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const avgRating = (p: Product) =>
  p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;

export const formatPrice = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";

export const discountPercent = (p: Product) =>
  p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
