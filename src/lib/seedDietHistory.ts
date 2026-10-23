import DietHistory, { pruneOldDietHistory } from '@/models/DietHistory';

export const INITIAL_DIET_SEEDS = [
  {
    dietId: 'DT-8510',
    patientName: 'Robert Vance',
    age: 58,
    gender: 'Male',
    disease: 'Hypertension & Type 2 Diabetes',
    dietaryPreference: 'Vegetarian (Shakahari)',
    targetCalories: 1750,
    language: 'Hindi',
    planName: 'डायबिटीज एवं हृदय स्वास्थ्य के लिए संपूर्ण आहार योजना',
    summary: 'यह संतुलित भारतीय शाकाहारी आहार रक्त शर्करा और रक्तचाप को नियंत्रित रखने के लिए डिज़ाइन किया गया है। इसमें जटिल कार्बोहाइड्रेट और कम सोडियम पर ध्यान दिया गया है।',
    patientForm: {
      patientName: 'Robert Vance',
      age: '58',
      gender: 'Male',
      weightKg: '84',
      heightCm: '172',
      disease: 'Hypertension & Type 2 Diabetes',
      dietaryPreference: 'Vegetarian (Shakahari)',
      language: 'Hindi',
      customCalories: '1750'
    },
    dietPlan: {
      planName: 'डायबिटीज एवं हृदय स्वास्थ्य के लिए संपूर्ण आहार योजना',
      targetCalories: 1750,
      summary: 'यह संतुलित भारतीय शाकाहारी आहार रक्त शर्करा और रक्तचाप को नियंत्रित रखने के लिए डिज़ाइन किया गया है।',
      macroBreakdown: {
        carbs: '220g (50%)',
        protein: '65g (15%)',
        fats: '48g (25%)',
        fiber: '38g'
      },
      electrolyteLimits: {
        sodium: '1800 mg (रक्तचाप नियंत्रण के लिए कम नमक)',
        potassium: '3000 mg (स्वस्थ हृदय और मांसपेशियों के लिए)',
        phosphorus: '800 mg',
        calcium: '1000 mg',
        magnesium: '350 mg',
        iron: '18 mg',
        vitaminD: '600 IU',
        vitaminB12: '2.4 mcg',
        uricAcid: 'प्यूरीन-युक्त खाद्य पदार्थों से परहेज'
      },
      mealSchedule: [
        {
          time: '7:00 AM',
          mealName: 'Early Morning (सुबह की शुरुआत)',
          portion: '1 गिलास (200ml)',
          focus: 'मेथी दाना पानी + 4 भीगे बादाम',
          clinicalNote: 'खाली पेट मेथी का पानी इंसुलिन संवेदनशीलता में सुधार करता है।'
        },
        {
          time: '8:30 AM',
          mealName: 'Breakfast (नाश्ता)',
          portion: '2 मीडियम कटोरी',
          focus: 'वेजिटेबल ओट्स उपमा या मूंग दाल चीला + पुदीना चटनी',
          clinicalNote: 'उच्च फाइबर और धीमे पचने वाला भोजन रक्त शर्करा में अचानक वृद्धि रोकता है।'
        },
        {
          time: '1:00 PM',
          mealName: 'Lunch (दोपहर का भोजन)',
          portion: '2 फुल्के + 1 कटोरी दाल + 1 कटोरी हरी सब्जी + खीरा सलाद',
          focus: 'जौ-गेहूं मिश्रित रोटी + पीली मूंग दाल + लौकी की सब्जी + बिना नमक छाछ',
          clinicalNote: 'संतुलित प्रोटीन और हरी सब्जियां हृदय और गुर्दे पर दबाव कम करती हैं।'
        },
        {
          time: '5:00 PM',
          mealName: 'Evening Snack (शाम का अल्पाहार)',
          portion: '1 कटोरी',
          focus: 'भुने हुए मखाने या अंकुरित मूंग चाट + ग्रीन टी',
          clinicalNote: 'हल्का नाश्ता शाम की भूख और कमजोरी को दूर करता है।'
        },
        {
          time: '8:00 PM',
          mealName: 'Dinner (रात का भोजन)',
          portion: '1.5 कटोरी',
          focus: 'सब्जियों से भरपूर दलिया या 1 फुल्का + तोरी की सब्जी',
          clinicalNote: 'रात में हल्का और सुपाच्य भोजन पाचन तंत्र को विश्राम देता है।'
        }
      ],
      recommendedFoods: [
        'जौ, जई (ओट्स), और साबुत गेहूं के फुल्के',
        'हरी पत्तेदार सब्जियां: मेथी, पालक, बथुआ, लौकी, तोरी',
        'छिलके वाली दालें: मूंग दाल, मसूर दाल',
        'ताजा छाछ (बिना नमक), टोंड दही',
        'सलाद: खीरा, ककड़ी, टमाटर (सीमित)'
      ],
      foodsToAvoid: [
        'सफेद चीनी, गुड़, मिठाई, और डिब्बाबंद जूस',
        'तले हुए नमकीन, पकौड़े, और समोसे',
        'अचार, पापड़, और अधिक नमक वाले प्रसंस्कृत खाद्य पदार्थ',
        'मैदा और बेकरी उत्पाद (बिस्कुट, सफेद ब्रेड)'
      ],
      hydrationGuidance: 'दिनभर में 2.5 से 3 लीटर सादा जल पिएं। भोजन के तुरंत बाद पानी न पिएं।',
      lifestyleAdvice: [
        'दोपहर और रात के भोजन के बाद 100 कदम धीमी गति से शतपावली (टहलना) जरूर करें।',
        'रोजाना सुबह 30 मिनट तेज गति से सैर करें।',
        'तनाव कम करने के लिए 10 मिनट प्राणायाम करें।'
      ]
    },
    date: '2026-09-16 11:30 AM',
    analysedBy: 'Dr. Yashwant Dubey'
  }
];

export async function ensureDefaultDietHistory() {
  try {
    const count = await DietHistory.countDocuments();
    if (count === 0) {
      console.log('Seeding initial default diet history into MongoDB...');
      await DietHistory.insertMany(INITIAL_DIET_SEEDS);
      console.log('Diet history records seeded successfully.');
    }
    // Enforce 2000 record maximum retention on boot
    await pruneOldDietHistory();
  } catch (err: any) {
    console.warn('Diet history auto-seed encountered non-fatal error:', err.message);
  }
}
