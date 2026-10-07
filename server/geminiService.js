const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiApiKey = process.env.GEMINI_API_KEY || '';

let genAI = null;
let geminiModel = null;

try {
  if (geminiApiKey && !geminiApiKey.startsWith('AQ.')) {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
} catch (e) {
  console.warn('⚠️ Standard Gemini SDK init skipped (using robust agent engine):', e.message);
}

/**
 * Intelligent Intent & Entity Classifier for Rural Local Needs
 */
function parseRuralIntent(query, language = 'en') {
  const q = query.toLowerCase().trim();

  // Intent 1: FIND_FARM_RESOURCE (Tractor, Harvester, Labor, Seeds, Fertilizer)
  if (
    q.includes('tractor') || q.includes('ట్రాక్టర్') || q.includes('ट्रैक्टर') ||
    q.includes('harvester') || q.includes('హార్వెస్టర్') || q.includes('हार्वेस्टर') ||
    q.includes('labor') || q.includes('labour') || q.includes('కూలీ') || q.includes('మజ్దూర్') || q.includes('मजदूर') ||
    q.includes('plough') || q.includes('rotavator') || q.includes('harvest')
  ) {
    let resource = 'tractor';
    if (q.includes('harvester') || q.includes('హార్వెస్టర్')) resource = 'harvester';
    if (q.includes('labor') || q.includes('labour') || q.includes('కూలీ') || q.includes('మజ్దూర్')) resource = 'farm_labor';

    return {
      intent: 'FIND_FARM_RESOURCE',
      category: resource,
      entities: {
        resourceType: resource,
        purpose: q.includes('harvest') ? 'Crop Harvesting' : 'Field Ploughing / Agriculture',
        date: q.includes('tomorrow') || q.includes('రేపు') || q.includes('कल') ? 'Tomorrow' : 'Immediate / Flexible',
        urgency: q.includes('urgent') || q.includes('জরুরি') || q.includes('తక్షణం') ? 'High' : 'Normal',
      },
      tools: ['search_farm_resources', 'get_service_availability']
    };
  }

  // Intent 2: FIND_SERVICE (Electrician, Plumber, Mechanic, Driver, Water pump)
  if (
    q.includes('pump') || q.includes('motor') || q.includes('మోటార్') || q.includes('మోటారు') || q.includes('पंप') ||
    q.includes('electrician') || q.includes('కరెంట్') || q.includes('इलेक्ट्रीशियन') ||
    q.includes('plumber') || q.includes('పైప్') || q.includes('ప్లంబర్') || q.includes('प्लंबर') ||
    q.includes('mechanic') || q.includes('గ్యారేజ్') || q.includes('మెకానిక్') || q.includes('मैकेनिक') ||
    q.includes('auto') || q.includes('ఆటో') || q.includes('driver') || q.includes('డ్రైవర్')
  ) {
    let category = 'electrician';
    if (q.includes('pump') || q.includes('motor') || q.includes('electrician') || q.includes('మోటార్') || q.includes('కరెంట్')) category = 'electrician';
    else if (q.includes('plumber') || q.includes('పైప్') || q.includes('ప్లంబర్')) category = 'plumber';
    else if (q.includes('mechanic') || q.includes('repair') || q.includes('పుంచర్')) category = 'mechanic';
    else if (q.includes('auto') || q.includes('driver')) category = 'auto';

    return {
      intent: 'FIND_SERVICE',
      category: category,
      entities: {
        serviceType: category,
        problem: q.includes('pump') || q.includes('motor') ? 'Water Pump / Motor Repair' : 'General Service / Repair',
        urgency: 'High',
      },
      tools: ['search_services', 'get_service_availability']
    };
  }

  // Intent 3: SELL_PRODUCT or FIND_PRODUCT (Tomatoes, Paddy, Produce, Goods)
  if (
    q.includes('sell') || q.includes('అమ్మాలి') || q.includes('बेचना') ||
    q.includes('tomato') || q.includes('టమాటా') || q.includes('టమోటా') || q.includes('टमाटर') ||
    q.includes('paddy') || q.includes('వరి') || q.includes('ధాన్యం') || q.includes('धान') ||
    q.includes('buy') || q.includes('కొనాలి') || q.includes('खरीदना') ||
    q.includes('ghee') || q.includes('నెయ్యి') || q.includes('sprayer') || q.includes('స్ప్రేయర్')
  ) {
    const isSell = q.includes('sell') || q.includes('అమ్మాలి') || q.includes('बेचना');
    let crop = 'Produce';
    if (q.includes('tomato') || q.includes('టమాటా') || q.includes('टमाटर')) crop = 'Tomatoes';
    if (q.includes('paddy') || q.includes('వరి') || q.includes('धान')) crop = 'Paddy / Grain';

    return {
      intent: isSell ? 'SELL_PRODUCT' : 'FIND_PRODUCT',
      category: 'produce',
      entities: {
        product: crop,
        action: isSell ? 'Connect with buyers & local market' : 'Purchase fresh produce',
        location: 'Active Village & Local Mandi',
      },
      tools: ['search_products', 'create_draft_listing']
    };
  }

  // Intent 4: GOVERNMENT_SCHEME
  if (
    q.includes('scheme') || q.includes('పథకం') || q.includes('యూజన') || q.includes('योजना') ||
    q.includes('kisan') || q.includes('కిసాన్') || q.includes('subsidy') || q.includes('సబ్సిడీ') ||
    q.includes('fasal bima') || q.includes('crop insurance') || q.includes('బీమా') ||
    q.includes('kusum') || q.includes('solar') || q.includes('రైతు')
  ) {
    return {
      intent: 'GOVERNMENT_SCHEME',
      category: 'agriculture',
      entities: {
        queryType: 'Official Government Agricultural Subsidy & Welfare',
        sourceType: 'Verified Official Portals (pmkisan.gov.in, pmfby.gov.in, pmkusum.mnre.gov.in)',
      },
      tools: ['search_government_sources']
    };
  }

  // Intent 5: COMMUNITY_INFORMATION or EMERGENCY
  if (
    q.includes('notice') || q.includes('meeting') || q.includes('కరెంట్ పోయిందా') ||
    q.includes('water') || q.includes('నీళ్లు') || q.includes('flood') || q.includes('వర్షం') ||
    q.includes('emergency') || q.includes('రోడ్డు') || q.includes('panchayat') || q.includes('పంచాయతీ')
  ) {
    const isEmergency = q.includes('flood') || q.includes('వర్షం') || q.includes('overflow') || q.includes('emergency') || q.includes('danger');
    return {
      intent: isEmergency ? 'EMERGENCY_INFORMATION' : 'COMMUNITY_INFORMATION',
      category: isEmergency ? 'emergency' : 'notice',
      entities: {
        topic: 'Village Infrastructure & Public Notices',
        urgency: isEmergency ? 'Critical' : 'Normal',
      },
      tools: ['search_updates', 'get_village_context']
    };
  }

  // Default: GENERAL_GUIDANCE
  return {
    intent: 'GENERAL_GUIDANCE',
    category: 'other',
    entities: {
      topic: query,
    },
    tools: ['search_services', 'search_products', 'search_updates']
  };
}

module.exports = {
  genAI,
  geminiModel,
  parseRuralIntent,
};
