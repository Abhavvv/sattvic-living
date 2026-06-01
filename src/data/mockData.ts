export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  certifications: string[];
}

export interface YogaProgram {
  id: string;
  title: string;
  category: 'Vinyasa' | 'Hatha' | 'Yin' | 'Kundalini' | 'Pranayama';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: number; // in minutes
  instructorId: string;
  description: string;
  image: string;
  sessions: number;
  benefits: string[];
}

export interface AyurvedaArticle {
  id: string;
  title: string;
  category: 'Lifestyle' | 'Foundations' | 'Herbalism' | 'Food' | 'Rituals';
  author: string;
  readTime: number; // in minutes
  description: string;
  content: string;
  image: string;
  tags: string[];
  publishedDate: string;
}

export interface SattvicMeal {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Beverage' | 'Snack';
  description: string;
  image: string;
  macros: {
    calories: number;
    carbs: number; // in grams
    protein: number; // in grams
    fat: number; // in grams
  };
  ingredients: string[];
  benefits: string[];
  doshaSuitability: {
    vata: 'Excellent' | 'Good' | 'Neutral' | 'Reduce';
    pitta: 'Excellent' | 'Good' | 'Neutral' | 'Reduce';
    kapha: 'Excellent' | 'Good' | 'Neutral' | 'Reduce';
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'Philosophy' | 'Practice' | 'Recipes' | 'Ayurveda';
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  pages: number;
  publishYear: number;
  purchaseLink: string;
  featuredReview: {
    user: string;
    rating: number;
    comment: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

// -------------------------------------------------------------
// MOCK DATASETS
// -------------------------------------------------------------

export const instructors: Instructor[] = [
  {
    id: "inst-1",
    name: "Ananya Sen",
    specialty: "Vinyasa & Mindfulness",
    bio: "Deeply rooted in traditional lineages, Ananya guides students through soulful, rhythmic flows that connect conscious breathing with fluid physical movement. Her classes balance solar energy and lunar grace, helping you find stillness inside motion.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
    certifications: ["RYT-500 Advanced Yoga Alliance", "Vipassana Meditation Facilitator", "Somatic Movement Specialist"]
  },
  {
    id: "inst-2",
    name: "Swami Kripal",
    specialty: "Kundalini & Spiritual Philosophy",
    bio: "Having spent 12 years studying and meditating in seclusion in the foothills of the Himalayas, Swami Kripal shares the profound energetic wisdom of Kundalini, pranayama, and Vedic philosophy. His presence radiates quietude and spiritual depth.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    certifications: ["Master of Yogic Science (Haridwar)", "Kundalini Tantra Acharya", "Himalayan Kriya Guide"]
  },
  {
    id: "inst-3",
    name: "Kabir Dev",
    specialty: "Hatha Alignment & Ashtanga",
    bio: "Kabir blends rigorous anatomical precision with deep devotional chanting. He focuses heavily on structural alignment, the mechanics of bandhas (energy locks), and building a sustainable daily practice that protects the physical form while expanding consciousness.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    certifications: ["Ashtanga Yoga Authorized Level 2 (Mysore)", "B.S. in Kinesiology & Human Anatomy", "Therapeutic Alignment Practitioner"]
  },
  {
    id: "inst-4",
    name: "Elena Rostova",
    specialty: "Yin Yoga & Restorative Sound Healing",
    bio: "Elena's gentle teachings are a soothing sanctuary for the modern nervous system. Combining passive somatic holds, deep myofascial release, and sacred sound baths using crystal bowls, she guides students to let go of stored cellular tension.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    certifications: ["Restorative & Yin Yoga Certified (200hr)", "Licensed Sound Therapist", "Integrative Breathwork Coach"]
  }
];

export const yogaPrograms: YogaProgram[] = [
  {
    id: "yoga-1",
    title: "Vinyasa Flow Harmony",
    category: "Vinyasa",
    level: "Intermediate",
    duration: 60,
    instructorId: "inst-1",
    description: "A continuous, moving meditation designed to align body, mind, and breath. This dynamic flow builds physical heat, purifies tissues, and settles the wandering mind into pristine, present-moment awareness.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    sessions: 8,
    benefits: ["Builds core strength and flexibility", "Enhances cardiovascular respiratory flow", "Fosters intense mental concentration", "Elevates daily energy levels"]
  },
  {
    id: "yoga-2",
    title: "Kundalini Energetic Awakening",
    category: "Kundalini",
    level: "Advanced",
    duration: 75,
    instructorId: "inst-2",
    description: "Incorporate powerful repetitive postures, precise dynamic breathwork (pranayama), sacred mantras, and deep meditation to unlock the dormant spiritual energy residing along the spine. Prepare to shift your consciousness.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    sessions: 10,
    benefits: ["Strengthens nervous and endocrine systems", "Releases deep-seated emotional patterns", "Expands spiritual perception and intuition", "Improves vital life force (Prana) flow"]
  },
  {
    id: "yoga-3",
    title: "Yin Yoga Restorative Sanctuary",
    category: "Yin",
    level: "Beginner",
    duration: 45,
    instructorId: "inst-4",
    description: "A soothing, slow-paced practice featuring passive, long-held floor postures targeting connective tissues, joints, and meridians. Accompanied by therapeutic sound frequencies for nervous system resetting.",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=800",
    sessions: 6,
    benefits: ["Improves joint mobility and flexibility", "Reduces chronic stress and cortisol levels", "Soothes the sympathetic nervous system", "Nurtures quiet, reflective self-compassion"]
  },
  {
    id: "yoga-4",
    title: "Hatha Foundations & Alignment",
    category: "Hatha",
    level: "Beginner",
    duration: 50,
    instructorId: "inst-3",
    description: "Perfect for beginners and seasoned practitioners looking to refine their form. Focuses on classical Hatha postures, static holds, strict alignment cues, prop modifications, and basic breathwork principles.",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800",
    sessions: 12,
    benefits: ["Teaches safe skeletal alignment principles", "Improves balance, posture, and stability", "Establishes a solid foundational vocabulary", "Gently tones muscle groups"]
  },
  {
    id: "yoga-5",
    title: "Pranayama & Himalayan Meditation",
    category: "Pranayama",
    level: "All Levels",
    duration: 30,
    instructorId: "inst-2",
    description: "Explore the ancient science of breath regulation (Pranayama) followed by deep Himalayan silence. Learn tools to calm anxiety, balance brain hemispheres, and tap into infinite spiritual stillness within.",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
    sessions: 5,
    benefits: ["Calms immediate stress and anxiety", "Increases cellular oxygenation and vitality", "Balances left/right brain hemispheres", "Builds a baseline for quiet meditation"]
  }
];

export const ayurvedaArticles: AyurvedaArticle[] = [
  {
    id: "art-1",
    title: "Dinacharya: The Sacred Art of Ayurvedic Daily Routines",
    category: "Lifestyle",
    author: "Ananya Sen",
    readTime: 6,
    description: "Aligning your daily habits with the natural rhythm of the sun and seasons is the ultimate cornerstone of Ayurvedic wellness. Learn how a structured morning ritual can transform your vitality.",
    content: "Dinacharya is composed of two words: 'dina' meaning day, and 'acharya' meaning activity or routine. In Ayurveda, synchronized harmony with the natural cycles of nature is the single most powerful defense against doshic imbalance and toxins (Ama). \n\nBy rising before the sun (Brahma Muhurta, approximately 45 minutes before sunrise), the body absorbs the pure, sattvic energies dominant in the atmosphere. The routine continues with tongue scraping to remove metabolic waste, warm oil self-massage (Abhyanga) to lubricate the joints and ground the nervous system, followed by pranayama to invite clean vital prana. Adopting even three core items from Dinacharya establishes a profound mental and physical sanctuary.",
    image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800",
    tags: ["Routine", "Morning Rituals", "Self-Care", "Dosha Balance"],
    publishedDate: "May 20, 2026"
  },
  {
    id: "art-2",
    title: "Understanding the Three Doshas: Vata, Pitta, and Kapha",
    category: "Foundations",
    author: "Swami Kripal",
    readTime: 8,
    description: "Ayurveda defines every human as a unique composition of the five elements, represented by three metabolic templates. Discover your primary forces and how they impact your health.",
    content: "The bedrock of Ayurvedic science rests upon the concept of Tri-Dosha: Vata (Ether & Air), Pitta (Fire & Water), and Kapha (Water & Earth). These three energetic forces control all biological, physiological, and psychological functions of our mind-body constitution (Prakriti).\n\n- Vata controls movement, breathing, nerve impulses, and creative flow. When out of balance, it manifests as anxiety, insomnia, dry skin, and bloating.\n- Pitta governs metabolism, digestion, thermoregulation, and sharp intellect. In excess, it causes anger, acidity, inflammation, and skin rashes.\n- Kapha provides physical structure, immunity, lubrication, and emotional stability. Imbalanced Kapha triggers lethargy, congestion, weight gain, and stubborn attachment.\n\nHealth represents the dynamic balance of these three, and disease is their deviation. Understanding your unique constitution allows you to select food, movements, and meditations that naturally balance your primary elements.",
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800",
    tags: ["Doshas", "Foundations", "Vata", "Pitta", "Kapha"],
    publishedDate: "April 15, 2026"
  },
  {
    id: "art-3",
    title: "Top 5 Ayurvedic Herbs for Modern Stress Relief",
    category: "Herbalism",
    author: "Elena Rostova",
    readTime: 5,
    description: "Modern life places a massive tax on our nervous systems. These adaptogenic, organic plants offer gentle, time-tested support to restore grounding and soothe chronic exhaustion.",
    content: "Nature holds the perfect botanical remedies to restore absolute nervous system harmony. Ayurvedic herbalism classifies certain herbs as Rasayanas—rejuvenatives that build vital force (Ojas) and adapt to stress:\n\n1. **Ashwagandha**: The ultimate grounding adaptogen. It lowers cortisol, nourishes depleted adrenals, and grounds the airy, anxious qualities of Vata.\n2. **Brahmi (Bacopa)**: A premier brain tonic. It cools the fiery intellect of Pitta, enhances memory, and alleviates modern mental fatigue.\n3. **Holy Basil (Tulsi)**: Known as the 'Queen of Herbs'. Tulsi clears lungs, supports immunity, and raises the spiritual vibration (Sattva) of the mind.\n4. **Triphala**: A formulation of three fruits (Amalaki, Bibhitaki, Haritaki) that gently detoxifies the digestive tract and balances all three doshas.\n5. **Shatavari**: A deeply nourishing root that strengthens vitality, replenishes vital fluids, and promotes emotional balance.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
    tags: ["Herbs", "Adaptogens", "Stress Relief", "Supplements"],
    publishedDate: "March 10, 2026"
  },
  {
    id: "art-4",
    title: "Sattvic Nutrition: Eating for Spiritual Clarity & Vitality",
    category: "Food",
    author: "Kabir Dev",
    readTime: 7,
    description: "What we consume directly shapes our subtle mental states. Explore the philosophy of Sattvic food and why fresh, pure, seasonal ingredients are the key to a meditative mind.",
    content: "In the Bhagavad Gita, food is divided into three categories matching the gunas (qualities) of nature: Sattva (purity, light), Rajas (passion, activity), and Tamas (darkness, inertia). \n\nSattvic foods are those that increase life force, purity, strength, health, happiness, and cheerfulness. They are savory, soothing, nourishing, and pleasing to the heart. They include fresh organic fruits, vegetables, whole grains, sprouted legumes, nuts, seeds, fresh raw milk, ghee, and mild sweet spices. Eating a Sattvic diet clears the nervous system channels (Nadis), enabling deep meditation and spiritual awareness. Rajasic foods (chili, garlic, caffeine) agitate the mind, while Tamasic foods (frozen, processed, stale meat) induce dullness and fatigue.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800",
    tags: ["Sattvic Diet", "Nutrition", "Purity", "Mindful Eating"],
    publishedDate: "May 02, 2026"
  }
];

export const sattvicMeals: SattvicMeal[] = [
  {
    id: "meal-1",
    name: "Tridoshic Golden Kitchari",
    category: "Lunch",
    description: "The ultimate restorative meal of Ayurveda. This warm, easily digestible blend of organic yellow split mung dal, premium basmati rice, grass-fed ghee, and balancing spices is a complete protein source that gently purifies the digestive system (Agni).",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
    macros: { calories: 380, carbs: 54, protein: 14, fat: 12 },
    ingredients: ["Organic Split Mung Dal", "Aromatic Basmati Rice", "Grass-fed Ghee", "Fresh Ginger Root", "Turmeric Powder", "Whole Cumin Seeds", "Fresh Cilantro"],
    benefits: ["Deeply soothing for digestion", "Highly bioavailable complete protein", "Gently removes metabolic toxins (Ama)", "Balances all three constitutional Doshas"],
    doshaSuitability: { vata: "Excellent", pitta: "Excellent", kapha: "Good" }
  },
  {
    id: "meal-2",
    name: "Saffron Almond Ojas Bowl",
    category: "Breakfast",
    description: "A luxurious and vitalizing breakfast bowl packed with life force (Ojas). Features soaked organic almonds, soft Medjool dates, steel-cut oats, organic saffron threads, green cardamom, and toasted coconut flakes.",
    image: "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=800",
    macros: { calories: 420, carbs: 48, protein: 12, fat: 20 },
    ingredients: ["Steel-cut Organic Oats", "Soaked Peeled Almonds", "Medjool Dates", "Kashmiri Saffron", "Ground Cardamom", "Unsweetened Coconut Flakes", "Raw Wild Honey"],
    benefits: ["Rebuilds vital energy reserves (Ojas)", "Nourishes the nervous system", "Provides long-sustained complex carbs", "Soothes dry Vata types"],
    doshaSuitability: { vata: "Excellent", pitta: "Excellent", kapha: "Reduce" }
  },
  {
    id: "meal-3",
    name: "Sprouted Mung & Spinach Restorative Soup",
    category: "Dinner",
    description: "A light, mineral-rich evening soup made of sprouted green mung beans, wilted organic baby spinach, freshly grated ginger, lemon juice, and a delicate tempering of mustard seeds and curry leaves.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
    macros: { calories: 280, carbs: 36, protein: 16, fat: 6 },
    ingredients: ["Sprouted Green Mung Beans", "Organic Baby Spinach", "Freshly Grated Ginger", "Lemon Zest & Juice", "Black Mustard Seeds", "Fresh Curry Leaves", "Cold-pressed Sesame Oil"],
    benefits: ["Extremely light and easy to digest before sleep", "Rich in iron, folate, and trace minerals", "Supports gentle overnight liver cleansing", "Highly balancing for Kapha and Pitta"],
    doshaSuitability: { vata: "Neutral", pitta: "Excellent", kapha: "Excellent" }
  },
  {
    id: "meal-4",
    name: "Golden Ashwagandha Moon Milk",
    category: "Beverage",
    description: "A nourishing evening beverage formulated to promote deep, restorative sleep. Warm, homemade almond and cashew milk infused with adaptogenic Ashwagandha root, nutmeg, cinnamon, and a touch of raw maple syrup.",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800",
    macros: { calories: 190, carbs: 14, protein: 5, fat: 12 },
    ingredients: ["Raw Almonds & Cashews", "Adaptogenic Ashwagandha Root Powder", "Freshly Grated Nutmeg", "Ceylon Cinnamon", "Pure Grade-A Maple Syrup", "Vanilla Bean Extract"],
    benefits: ["Soothes overactive adrenal glands", "Promotes natural, deep sleep cycles", "Eases nighttime anxiety and muscle tension", "Deeply pacifies dry, restless Vata energy"],
    doshaSuitability: { vata: "Excellent", pitta: "Good", kapha: "Neutral" }
  }
];

export const books: Book[] = [
  {
    id: "book-1",
    title: "The Heart of Yoga",
    author: "T.K.V. Desikachar",
    category: "Practice",
    description: "A modern spiritual classic written by the son of Sri Tirumalai Krishnamacharya, the father of modern yoga. Desikachar outlines the essential core principles of yoga, illustrating how to construct a personalized practice that fits individual needs, health levels, and stages of life.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 312,
    pages: 272,
    publishYear: 1995,
    purchaseLink: "#",
    featuredReview: {
      user: "David K.",
      rating: 5,
      comment: "This book completely demystified yoga for me. It shifts the focus from acrobatics back to the breath and spiritual intimacy. Truly a masterpiece of wisdom."
    }
  },
  {
    id: "book-2",
    title: "Ayurveda: The Science of Self-Healing",
    author: "Dr. Vasant Lad",
    category: "Ayurveda",
    description: "A concise, beautifully structured manual that explains the basic concepts of Ayurveda. Dr. Lad outlines history, philosophy, the tri-dosha theory, diagnosis methods (pulse, tongue, face), herbal therapeutics, and dietary guidelines for absolute constitutional balance.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 425,
    pages: 176,
    publishYear: 1984,
    purchaseLink: "#",
    featuredReview: {
      user: "Nisha S.",
      rating: 5,
      comment: "The absolute best introductory book on Ayurveda. The diagnostic charts and drawings are clear, making ancient medical concepts completely understandable."
    }
  },
  {
    id: "book-3",
    title: "The Yoga Sutras of Patanjali",
    author: "Swami Satchidananda",
    category: "Philosophy",
    description: "A powerful, definitive translation and commentary on Patanjali's core 196 sutras. Swami Satchidananda provides a highly practical, modern guide for mastering the mind, achieving mental clarity, and walking the classical eight-limbed path of spiritual liberation (Raja Yoga).",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 654,
    pages: 464,
    publishYear: 1978,
    purchaseLink: "#",
    featuredReview: {
      user: "Michael R.",
      rating: 5,
      comment: "The commentary makes ancient Sanskrit aphorisms incredibly relevant to modern struggles. I read a page every morning to ground my perspective."
    }
  },
  {
    id: "book-4",
    title: "What to Eat for How You Feel",
    author: "Divya Alter",
    category: "Recipes",
    description: "A stunning, practical guide to seasonal Ayurvedic cooking. Divya Alter shares delicious vegetarian recipes designed to soothe digestion, balance active doshic flare-ups, and elevate mental clarity. Features helpful charts explaining how to tailor meals.",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 145,
    pages: 352,
    publishYear: 2017,
    purchaseLink: "#",
    featuredReview: {
      user: "Sarah L.",
      rating: 4,
      comment: "The recipes are absolutely delicious and actually make sense. My bloating vanished after a week of cooking from this book. Highly recommended!"
    }
  },
  {
    id: "book-5",
    title: "Autobiography of a Yogi",
    author: "Paramahansa Yogananda",
    category: "Philosophy",
    description: "One of the most acclaimed spiritual autobiographies of all time. Yogananda recounts his remarkable childhood, encounters with legendary saints and sages in India, his 15 years of spiritual training under his guru Swami Sri Yukteswar, and the profound science of Kriya Yoga.",
    image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewsCount: 928,
    pages: 520,
    publishYear: 1946,
    purchaseLink: "#",
    featuredReview: {
      user: "Arthur C.",
      rating: 5,
      comment: "A book that changes the trajectory of lives. It expands your perception of what is humanly possible and fills the soul with deep, cosmic hope."
    }
  }
];

export const faqs: FaqItem[] = [
  {
    question: "What does 'Sattvic' mean in daily practice?",
    answer: "Sattvic comes from the Sanskrit word 'Sattva', representing purity, truth, light, balance, and harmony. A Sattvic lifestyle cultivates calm clarity and spiritual growth through mindful eating (pure, organic vegetarian foods), gentle physical movements, daily meditation, truthfulness, and profound compassion for all living beings.",
    category: "Philosophy"
  },
  {
    question: "I am completely new to Yoga. Can I participate in your programs?",
    answer: "Absolutely! Our physical and spiritual programs are designed to accommodate all levels. We offer structured classes ranging from 'Hatha Foundations' (specifically designed to teach structural mechanics and joint alignment) to advanced Kundalini flows. You can easily filter classes by 'Beginner' level to build a comfortable, steady practice.",
    category: "Yoga"
  },
  {
    question: "How is a Sattvic diet different from standard vegetarianism?",
    answer: "While both are plant-based, a Sattvic diet prioritizes high life force ('Prana') and purity. It mandates fresh, locally sourced organic fruits, vegetables, whole grains, sprouted beans, seeds, ghee, and mild warming spices. It strictly avoids processed or frozen foods, leftovers, and highly stimulating, agitating ingredients (Rajasic) like hot chili, garlic, onions, and caffeine.",
    category: "Meals"
  },
  {
    question: "What is an Ayurvedic 'Dosha' and how do I identify mine?",
    answer: "Ayurveda defines three basic biological energies—Vata (associated with Wind/Ether), Pitta (associated with Fire/Water), and Kapha (associated with Earth/Water)—which exist in unique combinations in every individual. To discover your constitution, you can complete our interactive Dosha Quiz on the Ayurveda page of our platform.",
    category: "Ayurveda"
  },
  {
    question: "Are your meals shipped fresh or frozen?",
    answer: "All meals in our showcase plans are designed to be prepped fresh daily by specialized chefs using organic local produce. They are hand-delivered in eco-friendly insulated packaging each morning before 7:00 AM, ensuring you receive maximum pranic energy and flavor without freezing or pasteurization. (Please note that in this prototype, orders are for visual/functional demonstration only.)",
    category: "Meals"
  }
];
