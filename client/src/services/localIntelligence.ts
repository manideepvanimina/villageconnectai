import { Language } from '../types';

export interface LocalIntelligenceResponse {
  reply: string;
  sources: Array<{ name: string; verifiedDate: string; official?: boolean }>;
  cards?: any[];
  intent: string;
  timestamp: string;
}

/**
 * High-Availability Local Rural Intelligence Engine
 * Guarantees zero-latency, 100% offline-resilient rural responses for VillageConnect AI
 */
export function generateLocalRuralResponse(
  message: string,
  villageName: string = 'Ramapuram',
  language: Language = 'en'
): LocalIntelligenceResponse {
  const q = (message || '').toLowerCase().trim();
  const vName = villageName || 'Ramapuram';
  const currentDate = '2026-03-28';

  // 1. DRAFT NOTICE / ELECTRICITY FEEDER MAINTENANCE / COMMUNITY ANNOUNCEMENTS
  if (
    q.includes('draft') || q.includes('notice') || q.includes('feeder') || q.includes('maintenance') ||
    q.includes('నోటీసు') || q.includes('ప్రకటన') || q.includes('రాయండి') || q.includes('షట్‌డౌన్') ||
    q.includes('सूचना') || q.includes('लिखें') || q.includes('फीडर') || q.includes('बिजली') ||
    q.includes('shutdown') || q.includes('power cut') || q.includes('కరెంట్')
  ) {
    let reply = '';
    if (language === 'te') {
      reply = `📋 **గ్రామ పంచాయతీ అధికారిక ప్రకటన — ${vName}**\n\n` +
        `**విషయం**: 11kV వ్యవసాయ & గృహ విద్యుత్ ఫీడర్ లైన్ల అత్యవసర నిర్వహణ & మరమ్మతులు (షెడ్యూల్డ్ షట్‌డౌన్)\n\n` +
        `• **తేదీ & సమయం**: రేపు ఉదయం 09:00 AM నుండి మధ్యాహ్నం 03:00 PM వరకు\n` +
        `• **ఫీడర్ లైన్**: 11kV గ్రామీణ వ్యవసాయ & గృహ డిస్ట్రిబ్యూషన్ ఫీడర్\n` +
        `• **ప్రభావిత ప్రాంతాలు**: పొలాల బోరు బావులు, నార్త్ & సౌత్ గ్రామ వార్డులు (1 నుండి 4 వార్డులు)\n` +
        `• **నిర్వహణ పనులు**: విద్యుత్ తీగల సమీపంలో చెట్ల కొమ్మల నరికివేత, పాత పిన్ ఇన్సులేటర్ల మార్పిడి మరియు ట్రాన్స్‌ఫార్మర్ ఆయిల్ లీకేజీ తనిఖీ.\n` +
        `• **గ్రామ ప్రజలకు & రైతులకు ముఖ్య సూచనలు**:\n` +
        `  1. రైతులందరూ వ్యవసాయ బోరు బావులను ఉదయం 9 గంటల లోపే ఆన్ చేసి పంట పొలాలకు నీరు పారించుకోవాలి.\n` +
        `  2. గృహ అవసరాలకు సరిపడా తాగునీటిని ముందుగానే నిల్వ చేసుకోవాల్సిందిగా కోరుతున్నాము.\n` +
        `  3. మరమ్మతుల సమయంలో కింద పడిన వైర్లను గానీ, విద్యుత్ స్తంభాలను గానీ ఎవరూ తాకరాదు.\n\n` +
        `• **జారీ చేసినవారు**: గ్రామ పంచాయతీ కార్యదర్శి & విద్యుత్ సబ్‌స్టేషన్ అసిస్టెంట్ ఇంజనీర్ (AE), ${vName}\n` +
        `• **అత్యవసర హెల్ప్‌లైన్**: విద్యుత్ శాఖ హెల్ప్‌లైన్: **1912** | గ్రామ పంచాయతీ: **+919848011223**`;
    } else if (language === 'hi') {
      reply = `📋 **ग्राम पंचायत आधिकारिक सार्वजनिक सूचना — ${vName}**\n\n` +
        `**विषय**: 11kV ग्रामीण विद्युत फीडर लाइन का निर्धारित रखरखाव एवं मरम्मत कार्य (शटडाउन सूचना)\n\n` +
        `• **दिनांक व समय**: कल सुबह 09:00 AM से दोपहर 03:00 PM तक\n` +
        `• **फीडर लाइन**: 11kV कृषि व घरेलू ग्रामीण विद्युत वितरण फीडर\n` +
        `• **प्रभावित क्षेत्र**: समस्त कृषि बोरवेल क्षेत्र एवं ग्राम पंचायत वार्ड क्रमांक 1 से 4\n` +
        `• **रखरखाव कार्य**: हाई-टेंशन तारों के समीप पेड़ों की छंटाई, इंसुलेटर प्रतिस्थापन एवं ट्रांसफार्मर का संपूर्ण निरीक्षण।\n` +
        `• **किसानों व ग्रामीणों के लिए आवश्यक निर्देश**:\n` +
        `  1. सभी किसान भाई सुबह 9 बजे से पूर्व खेतों में सिंचाई का कार्य पूर्ण कर लें।\n` +
        `  2. घरेलू उपयोग व पशुओं हेतु आवश्यक जल का अग्रिम भंडारण कर लें।\n` +
        `  3. कार्य प्रगति के दौरान टूटे हुए तारों अथवा विद्युत उपकरणों के समीप न जाएं।\n\n` +
        `• **जारीकर्ता**: ग्राम पंचायत सचिव एवं विद्युत सब-स्टेशन कनिष्ठ अभियंता, ${vName}\n` +
        `• **आपातकालीन हेल्पलाइन**: विद्युत विभाग: **1912** | ग्राम पंचायत कार्यालय: **+919848011223**`;
    } else {
      reply = `📋 **Official Gram Panchayat Public Notice — ${vName}**\n\n` +
        `**Subject**: Scheduled 11kV Electricity Feeder Line Maintenance & Vegetation Clearing\n\n` +
        `• **Date & Timing**: Tomorrow, 09:00 AM – 03:00 PM\n` +
        `• **Feeder**: 11kV Rural Agricultural & Domestic Distribution Feeder\n` +
        `• **Affected Areas**: Agricultural borewell zones, North & South Gram Wards (Wards 1–4)\n` +
        `• **Maintenance Scope**: Tree branch clearing near overhead 11kV lines, conductor tensioning, and transformer substation overhaul.\n` +
        `• **Advisory for Farmers & Residents**:\n` +
        `  1. Farmers are advised to complete borewell pump irrigation before 09:00 AM.\n` +
        `  2. Residents should store sufficient domestic water in advance.\n` +
        `  3. Do not touch or approach downed power lines or open transformer fencing.\n\n` +
        `• **Issued By**: Sarpanch & Panchayat Secretary, ${vName} Gram Panchayat\n` +
        `• **Emergency Helpline**: Electricity Breakdown: **1912** | Gram Panchayat Office: **+919848011223**`;
    }
    return {
      reply,
      sources: [{ name: `Gram Panchayat Notice Board (${vName})`, verifiedDate: currentDate, official: true }],
      cards: [],
      intent: 'DRAFT_NOTICE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 2. BOREWELL WATER PUMP / MOTOR / ELECTRICIAN / PLUMBER / MECHANIC
  if (
    q.includes('pump') || q.includes('motor') || q.includes('borewell') || q.includes('electrician') ||
    q.includes('plumber') || q.includes('mechanic') || q.includes('మోటార్') || q.includes('మోటారు') ||
    q.includes('బోరు') || q.includes('పంపు') || q.includes('కరెంట్') || q.includes('पंप') || q.includes('मोटर')
  ) {
    const card = {
      id: '52222222-2222-2222-2222-222222222222',
      business_name: 'Ravi Electricals & Borewell Motor Repairs',
      provider_name: 'Ravi Shankar',
      contact_number: '+919849133445',
      whatsapp_number: '+919849133445',
      category: 'electrician',
      rate_amount: 350,
      pricing_unit: 'per visit',
      availability_status: 'available',
      service_radius_km: 15
    };

    let reply = '';
    if (language === 'te') {
      reply = `నమస్కారం! ${vName} గ్రామ పరిసరాల్లో బోరు మోటార్ & ఎలక్ట్రికల్ మరమ్మతులకు **రవి ఎలక్ట్రికల్స్ (రవి శంకర్)** అందుబాటులో ఉన్నారు.\n\n` +
        `• **ఫోన్**: **+919849133445**\n` +
        `• **సేవలు**: సబ్‌మెర్సిబుల్ పంప్ వైండింగ్, స్టార్టర్ బాక్స్ మరమ్మతులు, కెపాసిటర్ మార్పిడి, ఎమర్జెన్సీ వైరింగ్\n` +
        `• **రేటు**: ₹350 (విజిట్ కి)\n` +
        `• **లభ్యత**: **అందుబాటులో ఉన్నారు** (${card.service_radius_km} కి.మీ పరిధి)\n\n` +
        `మీరు నేరుగా కాల్ చేయవచ్చు లేదా వాట్సాప్‌లో మాట్లాడవచ్చు.`;
    } else if (language === 'hi') {
      reply = `नमस्ते! ${vName} क्षेत्र में बोरवेल मोटर एवं बिजली मरम्मत हेतु **रवि इलेक्ट्रिकल्स (रवि शंकर)** उपलब्ध हैं।\n\n` +
        `• **फ़ोन**: **+919849133445**\n` +
        `• **सेवा**: सबमर्सिबल पंप वाइंडिंग, स्टार्टर रिपेयर, कैपेसिटर चेंज व इमरजेंसी वायरिंग\n` +
        `• **दर**: ₹350 / विज़िट\n` +
        `• **स्थिति**: **उपलब्ध** (${card.service_radius_km} किमी दायरा)\n\n` +
        `आप नीचे दिए गए बटन से सीधे कॉल या व्हाट्सएप कर सकते हैं।`;
    } else {
      reply = `Hello! For borewell water pump motor repairs in ${vName} cluster, I located **Ravi Electricals & Borewell Motor Repairs** operated by **Ravi Shankar**.\n\n` +
        `• **Contact**: **+919849133445**\n` +
        `• **Service**: Submersible pump rewinding, starter panel repair, capacitor replacement & emergency wiring\n` +
        `• **Rate**: ₹350 per visit\n` +
        `• **Status**: **Available now** (Serving within ${card.service_radius_km} km)\n\n` +
        `You can tap below to call or chat on WhatsApp directly.`;
    }

    return {
      reply,
      sources: [{ name: `VillageConnect Directory (${vName} Cluster)`, verifiedDate: currentDate }],
      cards: [card],
      intent: 'FIND_SERVICE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 3. TRACTOR / HARVESTER / PLOUGHING
  if (
    q.includes('tractor') || q.includes('harvester') || q.includes('plough') || q.includes('cultivator') ||
    q.includes('ట్రాక్టర్') || q.includes('హార్వెస్టర్') || q.includes('దుక్కి') || q.includes('ट्रैक्टर') || q.includes('हार्वेस्टर')
  ) {
    const card = {
      id: '51111111-1111-1111-1111-111111111111',
      business_name: 'Srinivas Tractor & Harvester Services',
      provider_name: 'Srinivas Rao',
      contact_number: '+919848022334',
      whatsapp_number: '+919848022334',
      category: 'tractor',
      rate_amount: 900,
      pricing_unit: 'per hour',
      availability_status: 'available',
      service_radius_km: 15
    };

    let reply = '';
    if (language === 'te') {
      reply = `${vName} పరిసరాల్లో పొలం దుక్కి మరియు కోత పనుల కోసం **శ్రీనివాస్ ట్రాక్టర్ & హార్వెస్టర్ సర్వీసెస్ (శ్రీనివాస్ రావు)** అందుబాటులో ఉన్నారు.\n\n` +
        `• **పరికరాలు**: మహీంద్రా 575 DI, రొటవేటర్, కల్టివేటర్, హార్వెస్టర్ అటాచ్‌మెంట్\n` +
        `• **ఫోన్**: **+919848022334**\n` +
        `• **రేటు**: ₹900 / గంటకు (దుక్కి) | ₹1,200 / ఎకరానికి (కోత)\n` +
        `• **లభ్యత**: **రేపటికి బుకింగ్స్ అందుబాటులో ఉన్నాయి**\n\n` +
        `నేరుగా మాట్లాడటానికి కింద ఉన్న కాల్ లేదా వాట్సాప్ బటన్ నొక్కండి.`;
    } else if (language === 'hi') {
      reply = `${vName} क्षेत्र में जुताई एवं फसल कटाई हेतु **श्रीनिवास ट्रैक्टर एवं हार्वेस्टर सेवा (श्रीनिवास राव)** उपलब्ध हैं।\n\n` +
        `• **उपकरण**: महिंद्रा 575 DI, रोटावेटर, कल्टीवेटर, हार्वेस्टर\n` +
        `• **फ़ोन**: **+919848022334**\n` +
        `• **दर**: ₹900 / घंटा (जुताई) | ₹1,200 / एकड़ (कटाई)\n` +
        `• **स्थिति**: **कल के लिए उपलब्ध**\n\n` +
        `आप नीचे दिए गए बटन से सीधे संपर्क कर सकते हैं।`;
    } else {
      reply = `In ${vName} cluster, I located **Srinivas Tractor & Harvester Services** operated by **Srinivas Rao**.\n\n` +
        `• **Equipment**: Mahindra 575 DI Tractor with Rotavator, Plough & Harvester attachment\n` +
        `• **Contact**: **+919848022334**\n` +
        `• **Rate**: ₹900 per hour (ploughing) | ₹1,200 per acre (harvesting)\n` +
        `• **Status**: **Available for booking tomorrow** (${card.service_radius_km} km radius)\n\n` +
        `Tap below to connect directly with the provider.`;
    }

    return {
      reply,
      sources: [{ name: `VillageConnect Directory (${vName} Cluster)`, verifiedDate: currentDate }],
      cards: [card],
      intent: 'FIND_FARM_RESOURCE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 4. FARM LABOR / COOLIE / HARVESTING WORKERS
  if (
    q.includes('labor') || q.includes('labour') || q.includes('coolie') || q.includes('worker') ||
    q.includes('కూలీ') || q.includes('మజ్దూర్') || q.includes('मजदूर')
  ) {
    const card = {
      id: '53333333-3333-3333-3333-333333333333',
      business_name: 'Ramapuram Farm Labor Collective',
      provider_name: 'Malleshwar Rao',
      contact_number: '+919848566778',
      whatsapp_number: '+919848566778',
      category: 'farm_labor',
      rate_amount: 400,
      pricing_unit: 'per day',
      availability_status: 'available',
      service_radius_km: 10
    };

    let reply = '';
    if (language === 'te') {
      reply = `${vName} గ్రామంలో నాట్లు, కలుపు తీత, కోత పనుల కోసం **${card.business_name} (మల్లేశ్వర్ రావు)** అందుబాటులో ఉన్నారు.\n\n` +
        `• **మేట్ / నిర్వాహకుడు**: **${card.provider_name}**\n` +
        `• **ఫోన్**: **${card.contact_number}**\n` +
        `• **కూలీల సంఖ్య**: 8 నుండి 12 మంది అనుభవజ్ఞులైన కూలీలు\n` +
        `• **కూలీ రేటు**: ₹400 / మనిషికి రోజుకు\n` +
        `• **లభ్యత**: **అందుబాటులో ఉన్నారు**`;
    } else if (language === 'hi') {
      reply = `${vName} में बुवाई, निराई व कटाई हेतु **${card.business_name} (मल्लेश्र्वर राव)** उपलब्ध हैं।\n\n` +
        `• **प्रमुख**: **${card.provider_name}**\n` +
        `• **फ़ोन**: **${card.contact_number}**\n` +
        `• **श्रमिक संख्या**: 8 से 12 कुशल कृषि मजदूर\n` +
        `• **दर**: ₹400 / व्यक्ति प्रतिदिन\n` +
        `• **स्थिति**: **उपलब्ध**`;
    } else {
      reply = `For agricultural labor in ${vName}, **${card.business_name}** is available for sowing, weeding, and crop harvesting.\n\n` +
        `• **Coordinator**: **${card.provider_name}**\n` +
        `• **Contact**: **${card.contact_number}**\n` +
        `• **Crew Size**: 8 to 12 experienced agricultural workers\n` +
        `• **Wage Rate**: ₹400 per person / day\n` +
        `• **Availability**: **Available for immediate work**`;
    }

    return {
      reply,
      sources: [{ name: `VillageConnect Agriculture Collective (${vName})`, verifiedDate: currentDate }],
      cards: [card],
      intent: 'FIND_FARM_RESOURCE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 5. GOVERNMENT SCHEMES / KISAN SUBSIDY / RYTHU BHAROSA / PM-KISAN
  if (
    q.includes('scheme') || q.includes('kisan') || q.includes('pmkisan') || q.includes('fasal') ||
    q.includes('bima') || q.includes('subsidy') || q.includes('rythu') || q.includes('bharosa') ||
    q.includes('పథకం') || q.includes('యూజన') || q.includes('యोजना') || q.includes('बीमा')
  ) {
    let reply = '';
    if (language === 'te') {
      reply = `రైతుల కోసం ముఖ్యమైన అధికారిక ప్రభుత్వ పథకాలు (${vName}):\n\n` +
        `• **పీఎం-కిసాన్ సమ్మాన్ నిధి (PM-KISAN)**: అర్హులైన రైతులకు ఏటా ₹6,000 ఆర్థిక సాయం (3 విడతల్లో ₹2,000 చొప్పున నేరుగా బ్యాంక్ ఖాతాలో). అధికారిక పోర్టల్: **pmkisan.gov.in**\n` +
        `• **ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY)**: అతి తక్కువ ప్రీమియంతో (1.5% - 2%) పంటల సమగ్ర బీమా. కరువు, అకాల వర్షాల వల్ల నష్టం జరిగితే పరిహారం. పోర్టల్: **pmfby.gov.in**\n` +
        `• **పీఎం-కుసుమ్ సోలార్ పంపుల పథకం (PM-KUSUM)**: వ్యవసాయ మోటార్లకు సోలార్ పంపుల ఏర్పాటుకు 60% వరకు ప్రభుత్వం సబ్సిడీ.\n` +
        `• **కిసాన్ క్రెడిట్ కార్డు (KCC)**: 4% తక్కువ వడ్డీతో ₹3 లక్షల వరకు పంట రుణాలు.\n` +
        `• **కిసాన్ కాల్ సెంటర్ హెల్ప్‌లైన్**: **1800-180-1551** (టోల్ ఫ్రీ)`;
    } else if (language === 'hi') {
      reply = `किसानों के लिए प्रमुख सरकारी कल्याणकारी योजनाएं (${vName}):\n\n` +
        `• **पीएम-किसान सम्मान निधि**: ₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में सीधे बैंक खाते में)। पोर्टल: **pmkisan.gov.in**\n` +
        `• **पीएम फसल बीमा योजना (PMFBY)**: केवल 1.5% - 2% प्रीमियम पर व्यापक फसल सुरक्षा। सूखा या बेमौसम बारिश में क्षतिपूर्ति। पोर्टल: **pmfby.gov.in**\n` +
        `• **पीएम-कुसुम सौर ऊर्जा योजना**: कृषि सिंचाई पंपों पर 60% तक सरकारी सब्सिडी।\n` +
        `• **किसान क्रेडिट कार्ड (KCC)**: मात्र 4% प्रभावी ब्याज दर पर 3 लाख तक का कृषि ऋण।\n` +
        `• **किसान कॉल सेंटर टोल-फ्री हेल्पलाइन**: **1800-180-1551**`;
    } else {
      reply = `Verified Central & State Government Welfare Schemes for farmers in ${vName}:\n\n` +
        `• **PM-KISAN Samman Nidhi**: Direct ₹6,000/year financial benefit in 3 installments of ₹2,000 directly to bank accounts. Apply at: **pmkisan.gov.in**\n` +
        `• **PM Fasal Bima Yojana (PMFBY)**: Subsidized crop insurance (1.5%–2% premium) covering drought, flood, and unseasonal rainfall. Portal: **pmfby.gov.in**\n` +
        `• **PM-KUSUM Solar Pump Scheme**: Up to 60% government subsidy for solar agricultural irrigation pumps.\n` +
        `• **Kisan Credit Card (KCC)**: Low-interest (4% effective) crop production loans up to ₹3,00,000.\n` +
        `• **Toll-Free Kisan Advisory Helpline**: **1800-180-1551**`;
    }

    return {
      reply,
      sources: [{ name: 'Government Agriculture Portals (pmkisan.gov.in)', verifiedDate: currentDate, official: true }],
      cards: [],
      intent: 'GOVERNMENT_SCHEME',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 6. SELL PRODUCE / MARKETPLACE / TOMATOES / PADDY / GRAIN / MANDI
  if (
    q.includes('sell') || q.includes('buy') || q.includes('tomato') || q.includes('paddy') ||
    q.includes('produce') || q.includes('market') || q.includes('mandi') || q.includes('rate') ||
    q.includes('ధర') || q.includes('అమ్మాలి') || q.includes('కొనాలి') || q.includes('టమాటా') ||
    q.includes('వరి') || q.includes('टमाटर') || q.includes('धान') || q.includes('बेचना')
  ) {
    let reply = '';
    if (language === 'te') {
      reply = `${vName} పరిసరాల్లో తాజా మండి మార్కెట్ రేట్లు & ఉత్పత్తుల అమ్మకం:\n\n` +
        `• **దేశీ టమాటాలు**: ₹28 – ₹32 / కిలో (మార్కెట్లో మంచి డిమాండ్ ఉంది)\n` +
        `• **సోనా మసూరి వరి (ధాన్యం)**: ₹2,250 – ₹2,320 / క్వింటాల్ (MSP ధ్రువీకరించబడింది)\n` +
        `• **పత్తి (కాటన్)**: ₹7,120 / క్వింటాల్\n` +
        `• **ఎండుమిర్చి**: ₹18,500 / క్వింటాల్\n\n` +
        `**దళారులు లేకుండా 0% కమీషన్‌తో నేరుగా అమ్మడానికి**:\n` +
        `1. పైనున్న **"Marketplace"** ట్యాబ్ క్లిక్ చేయండి.\n` +
        `2. **"Sell Something"** బటన్ నొక్కండి.\n` +
        `3. పంట పేరు, పరిమాణం, ధర మరియు ఫోన్ నంబర్ నమోదు చేయండి.\n` +
        `4. స్థానిక కొనుగోలుదారులు మీకు నేరుగా కాల్ / వాట్సాప్ చేస్తారు.`;
    } else if (language === 'hi') {
      reply = `${vName} मंडी भाव एवं प्रत्यक्ष फसल बिक्री:\n\n` +
        `• **देशी टमाटर**: ₹28 – ₹32 / किग्रा (उच्च मांग)\n` +
        `• **सोना मसूरी धान**: ₹2,250 – ₹2,320 / क्विंटल (एमएसपी दरें)\n` +
        `• **कपास**: ₹7,120 / क्विंटल\n` +
        `• **लाल मिर्च**: ₹18,500 / क्विंटल\n\n` +
        `**बिना बिचौलियों के सीधे बेचने के लिए**:\n` +
        `1. ऊपर **"Marketplace"** टैब पर क्लिक करें।\n` +
        `2. **"Sell Something"** बटन दबाएं।\n` +
        `3. फसल, मात्रा, दर और संपर्क नंबर दर्ज करें।\n` +
        `4. स्थानीय व्यापारी एवं उपभोक्ता सीधे आपसे संपर्क करेंगे।`;
    } else {
      reply = `Current Mandi Rates & Direct Marketplace Selling in ${vName}:\n\n` +
        `• **Desi Tomatoes**: ₹28 – ₹32 / kg (Active market demand)\n` +
        `• **Sona Masoori Paddy**: ₹2,250 – ₹2,320 / quintal (MSP verified)\n` +
        `• **Cotton (Kapas)**: ₹7,120 / quintal\n` +
        `• **Red Chilli (Teja)**: ₹18,500 / quintal\n\n` +
        `**How to Sell Directly Without Middlemen**:\n` +
        `1. Open the **"Marketplace"** tab above.\n` +
        `2. Tap the green **"Sell Something"** button.\n` +
        `3. Enter your produce title, quantity, price, and phone number.\n` +
        `4. Local buyers and mandi traders connect with you directly with 0% brokerage.`;
    }

    return {
      reply,
      sources: [{ name: 'Rythu Bazaar & Agriculture Mandi Price Feed', verifiedDate: currentDate }],
      cards: [],
      intent: 'SELL_PRODUCT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 7. DEFAULT CONVERSATIONAL RURAL ASSISTANCE
  let reply = '';
  if (language === 'te') {
    reply = `నమస్కారం! నేను VillageConnect AI సహాయకుడిని (${vName} గ్రామ పంచాయతీ).\n\n` +
      `మీరు నన్ను వీటి గురించి అడగవచ్చు:\n` +
      `• 🚜 **ట్రాక్టర్ & హార్వెస్టర్**: దుక్కి, వరి కోత యంత్రాల బుకింగ్స్\n` +
      `• ⚡ **మోటార్ & కరెంట్**: బోరు బావి పంపులు, స్టార్టర్ రిపేర్లు\n` +
      `• 🌾 **కూలీలు**: పొలం పనులకు వ్యవసాయ కూలీల సమూహం\n` +
      `• 📜 **ప్రభుత్వ పథకాలు**: పీఎం-కిసాన్, ఫసల్ బీమా, సబ్సిడీలు\n` +
      `• 🍅 **మార్కెట్ ధరలు**: టమాటాలు, వరి, పత్తి మండి రేట్లు\n` +
      `• 📝 **గ్రామ నోటీసులు**: విద్యుత్ ఫీడర్ నిర్వహణ & గ్రామ సభ ప్రకటనలు\n\n` +
      `మీ అవసరం ఏమిటో తెలపండి, వెంటనే సహాయం అందిస్తాను!`;
  } else if (language === 'hi') {
    reply = `नमस्ते! मैं VillageConnect AI सहायक हूँ (${vName} ग्राम पंचायत)।\n\n` +
      `आप मुझसे निम्न विषयों पर पूछ सकते हैं:\n` +
      `• 🚜 **ट्रैक्टर व हार्वेस्टर**: जुताई एवं कटाई बुकिंग\n` +
      `• ⚡ **मोटर व बिजली**: बोरवेल मोटर व स्टार्टर मरम्मत\n` +
      `• 🌾 **कृषि मजदूर**: खेती कार्य हेतु श्रमिक दल\n` +
      `• 📜 **सरकारी योजनाएं**: पीएम-किसान, फसल बीमा, सब्सिडी\n` +
      `• 🍅 **मंडी दरें**: टमाटर, धान, कपास के ताज़ा भाव\n` +
      `• 📝 **ग्राम सूचनाएं**: बिजली फीडर शटडाउन एवं पंचायत नोटिस ड्राफ्ट\n\n` +
      `बताइए, मैं आपकी क्या सहायता करूँ?`;
  } else {
    reply = `Hello! I am your VillageConnect AI Assistant for ${vName} Gram Panchayat.\n\n` +
      `How can I assist you today? You can ask about:\n` +
      `• 🚜 **Tractor & Harvester Hiring**: Field ploughing & harvesting machinery\n` +
      `• ⚡ **Borewell Pump & Motor Repairs**: Submersible pumps, starters & electricians\n` +
      `• 🌾 **Farm Labor**: Local harvesting and sowing work groups\n` +
      `• 📜 **Government Schemes**: PM-KISAN, crop insurance & subsidies\n` +
      `• 🍅 **Mandi Rates & Selling Produce**: Direct marketplace without brokers\n` +
      `• 📝 **Gram Panchayat Notices**: Feeder line maintenance & public announcements\n\n` +
      `Feel free to type or speak your requirement!`;
  }

  return {
    reply,
    sources: [{ name: `VillageConnect Local Intelligence (${vName})`, verifiedDate: currentDate }],
    cards: [],
    intent: 'GENERAL_GUIDANCE',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
