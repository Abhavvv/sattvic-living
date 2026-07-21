/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { PrismaClient, ArticleStatus, YogaClassStatus, YogaSessionStatus } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Categories if empty
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    console.log("Creating categories...");
    await prisma.category.createMany({
      data: [
        { name: "Ayurvedic Lifestyle", slug: "lifestyle", description: "Daily habits, dinacharya rituals, and seasonal adjustments." },
        { name: "Ayurvedic Foundations", slug: "foundations", description: "Core concepts, tri-dosha theory, and basic principles." },
        { name: "Herbalism", slug: "herbalism", description: "Vedic adaptogens, herbal formulas, and rasayana remedies." },
        { name: "Sattvic Nutrition", slug: "food", description: "Prana-rich, pure, seasonal vegetarian eating principles." },
      ],
    });
  }

  const categories = await prisma.category.findMany();
  const lifestyleCat = categories.find((c) => c.slug === "lifestyle");
  const foundationsCat = categories.find((c) => c.slug === "foundations");
  const herbalismCat = categories.find((c) => c.slug === "herbalism");
  const foodCat = categories.find((c) => c.slug === "food");

  // 2. Seed Articles if empty
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    console.log("Creating articles...");
    await prisma.article.create({
      data: {
        title: "Dinacharya: The Sacred Art of Ayurvedic Daily Routines",
        slug: "dinacharya-daily-routines",
        excerpt: "Aligning your daily habits with the natural rhythm of the sun and seasons is the ultimate cornerstone of Ayurvedic wellness.",
        content: "Dinacharya is composed of two words: 'dina' meaning day, and 'acharya' meaning activity or routine. In Ayurveda, synchronized harmony with the natural cycles of nature is the single most powerful defense against doshic imbalance and toxins (Ama).\n\nBy rising before the sun (Brahma Muhurta, approximately 45 minutes before sunrise), the body absorbs the pure, sattvic energies dominant in the atmosphere. The routine continues with tongue scraping to remove metabolic waste, warm oil self-massage (Abhyanga) to lubricate the joints and ground the nervous system, followed by pranayama to invite clean vital prana. Adopting even three core items from Dinacharya establishes a profound mental and physical sanctuary.",
        featuredImage: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800",
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        categoryId: lifestyleCat ? lifestyleCat.id : null,
        tags: "Routine, Morning Rituals, Self-Care, Dosha Balance",
      },
    });

    await prisma.article.create({
      data: {
        title: "Sattvic Nutrition: Eating for Spiritual Clarity & Vitality",
        slug: "sattvic-nutrition-spiritual-clarity",
        excerpt: "What we consume directly shapes our subtle mental states. Explore the philosophy of Sattvic food.",
        content: "In the Bhagavad Gita, food is divided into three categories matching the gunas (qualities) of nature: Sattva (purity, light), Rajas (passion, activity), and Tamas (darkness, inertia).\n\nSattvic foods are those that increase life force, purity, strength, health, happiness, and cheerfulness. They include fresh organic fruits, vegetables, whole grains, sprouted legumes, nuts, seeds, fresh raw milk, ghee, and mild sweet spices. Eating a Sattvic diet clears the nervous system channels (Nadis), enabling deep meditation and spiritual awareness.",
        featuredImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800",
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        categoryId: foodCat ? foodCat.id : null,
        tags: "Sattvic Diet, Nutrition, Purity, Mindful Eating",
      },
    });
  }

  // 3. Seed AyurvedaContent if empty
  const ayurvedaCount = await prisma.ayurvedaContent.count();
  if (ayurvedaCount === 0) {
    console.log("Creating ayurveda learning articles...");
    await prisma.ayurvedaContent.create({
      data: {
        title: "Understanding the Three Doshas: Vata, Pitta, and Kapha",
        slug: "understanding-three-doshas",
        content: "The bedrock of Ayurvedic science rests upon the concept of Tri-Dosha: Vata (Ether & Air), Pitta (Fire & Water), and Kapha (Water & Earth). These three energetic forces control all biological, physiological, and psychological functions of our mind-body constitution (Prakriti).\n\n- Vata controls movement, breathing, nerve impulses, and creative flow. When out of balance, it manifests as anxiety, insomnia, dry skin, and bloating.\n- Pitta governs metabolism, digestion, thermoregulation, and sharp intellect. In excess, it causes anger, acidity, inflammation, and skin rashes.\n- Kapha provides physical structure, immunity, lubrication, and emotional stability. Imbalanced Kapha triggers lethargy, congestion, weight gain, and stubborn attachment.",
        featuredImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800",
        status: ArticleStatus.PUBLISHED,
        categoryId: foundationsCat ? foundationsCat.id : null,
      },
    });

    await prisma.ayurvedaContent.create({
      data: {
        title: "Top 5 Ayurvedic Herbs for Modern Stress Relief",
        slug: "top-5-ayurvedic-herbs",
        content: "Nature holds the perfect botanical remedies to restore absolute nervous system harmony. Ayurvedic herbalism classifies certain herbs as Rasayanas—rejuvenatives that build vital force (Ojas) and adapt to stress:\n\n1. Ashwagandha: The ultimate grounding adaptogen. It lowers cortisol and grounds Vata.\n2. Brahmi (Bacopa): A premier brain tonic. It cools Pitta and enhances memory.\n3. Holy Basil (Tulsi): Known as the 'Queen of Herbs'. Tulsi supports immunity.\n4. Triphala: Detoxifies the digestive tract.\n5. Shatavari: Replenishes vital fluids.",
        featuredImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
        status: ArticleStatus.PUBLISHED,
        categoryId: herbalismCat ? herbalismCat.id : null,
      },
    });
  }

  // 4. Seed Books if empty
  const bookCount = await prisma.book.count();
  if (bookCount === 0) {
    console.log("Creating books...");
    await prisma.book.createMany({
      data: [
        {
          title: "The Heart of Yoga",
          slug: "the-heart-of-yoga",
          description: "Desikachar outlines the essential core principles of yoga, illustrating how to construct a personalized practice that fits individual needs, health levels, and stages of life.",
          author: "T.K.V. Desikachar",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
          isPremium: false,
        },
        {
          title: "Ayurveda: The Science of Self-Healing",
          slug: "ayurveda-science-self-healing",
          description: "A concise, beautifully structured manual explaining history, philosophy, tri-dosha theory, diagnostic methods, and herbal guidelines.",
          author: "Dr. Vasant Lad",
          coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
          isPremium: false,
        },
        {
          title: "The Yoga Sutras of Patanjali",
          slug: "the-yoga-sutras-of-patanjali",
          description: "Swami Satchidananda provides a highly practical, modern guide for mastering the mind and walking the classical eight-limbed path.",
          author: "Swami Satchidananda",
          coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
          isPremium: true,
        },
      ],
    });
  }

  // 5. Seed FAQs if empty
  const faqCount = await prisma.fAQ.count();
  if (faqCount === 0) {
    console.log("Creating FAQs...");
    await prisma.fAQ.createMany({
      data: [
        {
          question: "What does 'Sattvic' mean in daily practice?",
          answer: "Sattvic comes from the Sanskrit word 'Sattva', representing purity, truth, light, balance, and harmony. A Sattvic lifestyle cultivates calm clarity and spiritual growth through mindful eating (pure, organic vegetarian foods), gentle physical movements, daily meditation, truthfulness, and profound compassion for all living beings.",
          displayOrder: 1,
          isActive: true,
        },
        {
          question: "I am completely new to Yoga. Can I participate in your programs?",
          answer: "Absolutely! Our physical and spiritual programs are designed to accommodate all levels. We offer structured classes ranging from 'Hatha Foundations' (specifically designed to teach structural mechanics and joint alignment) to advanced Kundalini flows. You can easily filter classes by 'Beginner' level to build a comfortable, steady practice.",
          displayOrder: 2,
          isActive: true,
        },
        {
          question: "How is a Sattvic diet different from standard vegetarianism?",
          answer: "While both are plant-based, a Sattvic diet prioritizes high life force ('Prana') and purity. It mandates fresh, locally sourced organic fruits, vegetables, whole grains, sprouted beans, seeds, ghee, and mild warming spices. It strictly avoids processed or frozen foods, leftovers, and highly stimulating, agitating ingredients (Rajasic) like hot chili, garlic, onions, and caffeine.",
          displayOrder: 3,
          isActive: true,
        },
      ],
    });
  }

  // 6. Seed Instructors if empty
  const instructorCount = await prisma.instructor.count();
  if (instructorCount === 0) {
    console.log("Creating instructors...");
    await prisma.instructor.createMany({
      data: [
        {
          id: "inst-1",
          name: "Ananya Sen",
          slug: "ananya-sen",
          bio: "Deeply rooted in traditional lineages, Ananya guides students through soulful, rhythmic flows that connect conscious breathing with fluid physical movement.",
          profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
          certifications: "RYT-500 Advanced Yoga Alliance, Vipassana Meditation Facilitator, Somatic Movement Specialist",
          specialization: "Vinyasa & Mindfulness",
          experienceYears: 7,
          email: "ananya@sattvicliving.com",
          phone: "9876543210",
          isActive: true,
        },
        {
          id: "inst-2",
          name: "Swami Kripal",
          slug: "swami-kripal",
          bio: "Having spent 12 years studying and meditating in seclusion in the foothills of the Himalayas, Swami Kripal shares the energetic wisdom of Kundalini, pranayama, and Vedic philosophy.",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
          certifications: "Master of Yogic Science (Haridwar), Kundalini Tantra Acharya, Himalayan Kriya Guide",
          specialization: "Kundalini & Spiritual Philosophy",
          experienceYears: 15,
          email: "swamikripal@sattvicliving.com",
          phone: "9876543211",
          isActive: true,
        },
      ],
    });
  }

  // 7. Seed YogaClasses if empty
  const classCount = await prisma.yogaClass.count();
  if (classCount === 0) {
    console.log("Creating yoga classes...");
    await prisma.yogaClass.createMany({
      data: [
        {
          id: "class-1",
          title: "Vinyasa Flow Harmony",
          slug: "vinyasa-flow-harmony",
          description: "A continuous, moving meditation designed to align body, mind, and breath. This dynamic flow builds physical heat, purifies tissues, and settles the wandering mind.",
          category: "Vinyasa Flow",
          difficulty: "Intermediate",
          duration: 60,
          capacity: 15,
          price: 1500,
          featuredImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
          isOnline: false,
          status: YogaClassStatus.PUBLISHED,
          instructorId: "inst-1",
        },
        {
          id: "class-2",
          title: "Kundalini Energetic Awakening",
          slug: "kundalini-energetic-awakening",
          description: "Incorporate powerful repetitive postures, precise dynamic breathwork (pranayama), sacred mantras, and deep meditation to unlock dormant spiritual energy.",
          category: "Kundalini Yoga",
          difficulty: "Advanced",
          duration: 75,
          capacity: 20,
          price: 1800,
          featuredImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
          isOnline: true,
          status: YogaClassStatus.PUBLISHED,
          instructorId: "inst-2",
        },
      ],
    });
  }

  // 8. Seed YogaSessions if empty
  const sessionCount = await prisma.yogaSession.count();
  if (sessionCount === 0) {
    console.log("Creating upcoming sessions...");
    const tomorrow1 = new Date();
    tomorrow1.setDate(tomorrow1.getDate() + 1);
    tomorrow1.setHours(9, 0, 0, 0);

    const tomorrow2 = new Date();
    tomorrow2.setDate(tomorrow2.getDate() + 1);
    tomorrow2.setHours(11, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(17, 30, 0, 0);

    await prisma.yogaSession.createMany({
      data: [
        {
          classId: "class-1",
          startTime: tomorrow1,
          endTime: new Date(tomorrow1.getTime() + 60 * 60 * 1000),
          location: "Lotus Studio Hall A",
          capacity: 15,
          availableSeats: 15,
          status: YogaSessionStatus.SCHEDULED,
        },
        {
          classId: "class-2",
          startTime: tomorrow2,
          endTime: new Date(tomorrow2.getTime() + 75 * 60 * 1000),
          location: "Google Meet Broadcast Room",
          meetingLink: "https://meet.google.com/abc-defg-hij",
          capacity: 20,
          availableSeats: 20,
          status: YogaSessionStatus.SCHEDULED,
        },
        {
          classId: "class-1",
          startTime: dayAfter,
          endTime: new Date(dayAfter.getTime() + 60 * 60 * 1000),
          location: "Lotus Studio Hall A",
          capacity: 15,
          availableSeats: 15,
          status: YogaSessionStatus.SCHEDULED,
        },
      ],
    });
  }

  // 9. Seed MealCategory & Meals if empty
  const mealCategoryCount = await prisma.mealCategory.count();
  if (mealCategoryCount === 0) {
    console.log("Creating Meal Categories...");
    const breakfast = await prisma.mealCategory.create({
      data: {
        name: "Breakfast",
        slug: "breakfast",
        description: "High-prana morning foods to ignite your inner fire (Agni).",
        image: "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      }
    });

    const lunch = await prisma.mealCategory.create({
      data: {
        name: "Lunch",
        slug: "lunch",
        description: "Hearty, grounding, metabolic-balancing midday meals.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      }
    });

    const dinner = await prisma.mealCategory.create({
      data: {
        name: "Dinner",
        slug: "dinner",
        description: "Light, mineral-rich evening meals for overnight digestion.",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      }
    });

    const beverages = await prisma.mealCategory.create({
      data: {
        name: "Beverages",
        slug: "beverages",
        description: "Vitalizing herbal elixirs, adaptogenic moon milks, and teas.",
        image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      }
    });

    const snacks = await prisma.mealCategory.create({
      data: {
        name: "Snacks",
        slug: "snacks",
        description: "Nourishing, grounding bites to sustain energy levels.",
        image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&q=80&w=800",
        isActive: true,
      }
    });

    console.log("Creating Meals...");
    await prisma.meal.createMany({
      data: [
        {
          name: "Tridoshic Golden Kitchari",
          slug: "tridoshic-golden-kitchari",
          shortDescription: "Warm, highly digestible yellow split mung dal, basmati rice, grass-fed ghee, and balancing spices.",
          description: "The ultimate restorative meal of Ayurveda. This warm, easily digestible blend of yellow split mung dal, basmati rice, grass-fed ghee, and balancing spices is a complete protein source that gently purifies the digestive system (Agni). It is highly bioavailable and designed to soothe the gut while restoring deep metabolic balance.",
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
          categoryId: lunch.id,
          price: 18.5,
          calories: 380,
          protein: 14,
          carbs: 54,
          fat: 12,
          ingredients: "Organic Split Mung Dal, Aromatic Basmati Rice, Grass-fed Ghee, Fresh Ginger Root, Turmeric Powder, Whole Cumin Seeds, Fresh Cilantro",
          benefits: "Deeply soothing for digestion, Highly bioavailable complete protein, Gently removes metabolic toxins (Ama)",
          preparationNotes: "Simmer yellow split mung dal and basmati rice with freshly ground spices and fresh ginger in water until soft. Finish by stirring in grass-fed ghee and dynamic herbal garnishes.",
          isFeatured: true,
          isPublished: true,
          isAvailable: true,
          metaTitle: "Tridoshic Golden Kitchari - Sattvic Ayurveda Meal",
          metaDescription: "Nourish and cleanse your body with our signature Tridoshic Golden Kitchari, the ultimate Ayurvedic healing and balancing meal."
        },
        {
          name: "Saffron Almond Ojas Bowl",
          slug: "saffron-almond-ojas-bowl",
          shortDescription: "A vitalizing breakfast bowl packed with life force (Ojas), saffron, cardamom, and toasted almond flakes.",
          description: "A luxurious and vitalizing breakfast bowl packed with life force (Ojas). Features steel-cut oats cooked in fresh almond milk, infused with organic saffron threads, green cardamom, Medjool dates, and finished with soaked almonds.",
          image: "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=800",
          categoryId: breakfast.id,
          price: 15.0,
          calories: 420,
          protein: 12,
          carbs: 48,
          fat: 20,
          ingredients: "Steel-cut Organic Oats, Soaked Peeled Almonds, Medjool Dates, Kashmiri Saffron, Ground Cardamom, Unsweetened Coconut Flakes, Raw Wild Honey",
          benefits: "Rebuilds vital energy reserves (Ojas), Nourishes the nervous system, Provides long-sustained complex carbs",
          preparationNotes: "Slow-cook steel-cut oats in almond milk with crushed green cardamom. Stir in pure saffron threads and raw honey after cooking. Garnish with almonds and coconut flakes.",
          isFeatured: true,
          isPublished: true,
          isAvailable: true,
          metaTitle: "Saffron Almond Ojas Bowl - Energizing Sattvic Breakfast",
          metaDescription: "Replenish your body's energy reserves and boost mental clarity with the saffron, almond, and date Ojas breakfast bowl."
        },
        {
          name: "Sprouted Mung & Spinach Restorative Soup",
          slug: "sprouted-mung-spinach-restorative-soup",
          shortDescription: "Light, mineral-rich evening soup made of sprouted green mung beans, baby spinach, ginger, and lemon.",
          description: "A light, mineral-rich evening soup made of sprouted green mung beans, baby spinach, ginger, lemon juice, and a tempering of mustard seeds and curry leaves. Formulated to be incredibly easy to digest, ensuring your biological systems rest and regenerate overnight.",
          image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
          categoryId: dinner.id,
          price: 16.0,
          calories: 280,
          protein: 16,
          carbs: 36,
          fat: 6,
          ingredients: "Sprouted Green Mung Beans, Organic Baby Spinach, Freshly Grated Ginger, Lemon Zest & Juice, Black Mustard Seeds, Fresh Curry Leaves, Cold-pressed Sesame Oil",
          benefits: "Extremely light and easy to digest before sleep, Supports overnight biological cleansing, Rich in iron and folate",
          preparationNotes: "Sauté mustard seeds and curry leaves in sesame oil until fragrant. Add sprouted mung beans and water, simmer until soft, then stir in spinach, fresh ginger, and lemon juice.",
          isFeatured: false,
          isPublished: true,
          isAvailable: true,
          metaTitle: "Sprouted Mung & Spinach Soup - Light Ayurvedic Dinner",
          metaDescription: "End your day with a light, mineral-rich sprouted mung bean and organic spinach soup, designed for restorative sleep and effortless digestion."
        },
        {
          name: "Golden Ashwagandha Moon Milk",
          slug: "golden-ashwagandha-moon-milk",
          shortDescription: "A soothing bedtime beverage infused with adaptogenic Ashwagandha root, nutmeg, and cardamom.",
          description: "A nourishing evening beverage formulated to promote deep, restorative sleep. Warm homemade nut milk infused with adaptogenic Ashwagandha root, nutmeg, cinnamon, and a touch of raw maple syrup.",
          image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800",
          categoryId: beverages.id,
          price: 8.5,
          calories: 190,
          protein: 5,
          carbs: 14,
          fat: 12,
          ingredients: "Raw Almonds & Cashews, Adaptogenic Ashwagandha Root Powder, Freshly Grated Nutmeg, Ceylon Cinnamon, Pure Grade-A Maple Syrup, Vanilla Bean Extract",
          benefits: "Soothes overactive adrenal glands, Promotes natural deep sleep, Eases nighttime anxiety and muscle tension",
          preparationNotes: "Warm homemade nut milk on low heat. Whisk in Ashwagandha powder, cinnamon, and nutmeg. Remove from heat and sweeten with maple syrup and vanilla extract.",
          isFeatured: false,
          isPublished: true,
          isAvailable: true,
          metaTitle: "Golden Ashwagandha Moon Milk - Sleep Elixir",
          metaDescription: "Indulge in a warm cup of Golden Ashwagandha Moon Milk, an Ayurvedic sleeping elixir designed to calm the mind and soothe stress."
        }
      ]
    });
  }

  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
