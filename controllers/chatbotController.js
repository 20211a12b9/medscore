const express = require('express');
const router = express.Router();
const Message = require('../models/chatModel');
const asyncHandler = require("express-async-handler");

// Language-specific responses including questions and answers
const responses = {
  greeting: {
    en: "Welcome to MedScore! Please choose your preferred language:\na. English\nb. हिंदी (Hindi)\nc. తెలుగు (Telugu)",
    hi: "मेडस्कोर में आपका स्वागत है! कृपया अपनी पसंदीदा भाषा चुनें:\na. English\nb. हिंदी\nc. తెలుగు",
    te: "మెడ్‌స్కోర్‌కి స్వాగతం! దయచేసి మీ భాషను ఎంచుకోండి:\na. English\nb. हिंदी\nc. తెలుగు"
  },
  suggestedQuestions: {
    en: [
      "1. What is MedScore?",
      "2. How does MedScore work? Explain its flow.",
      "3. How does a retailer check a pharmacy's credit score?",
      "4. Can a retailer directly send a notice to a pharmacy?",
      "5. What factors influence a pharmacy's credit score?",
      "6. What happens when a retailer uploads outstanding payments?",
      "7. What areas does MedScore cover?",
      "8. How can I contact the MedScore team?"
    ],
    hi: [
      "1. मेडस्कोर क्या है?",
      "2. MedScore कैसे काम करता है? इसके प्रवाह को समझाइए।",
      "3. खुदरा विक्रेता फार्मेसी का क्रेडिट स्कोर कैसे चेक करता है?",
      "4. क्या खुदरा विक्रेता सीधे फार्मेसी को नोटिस भेज सकता है?",
      "5. फार्मेसी के क्रेडिट स्कोर को कौन से कारक प्रभावित करते हैं?",
      "6. जब खुदरा विक्रेता बकाया भुगतान अपलोड करता है तो क्या होता है?",
      "7. मेडस्कोर (MedScore) किन क्षेत्रों में उपयोग किया जाता है?",
      "8. MedScore टीम से कैसे संपर्क करें?"
    ],
    te: [
      "1. మెడ్‌స్కోర్ అంటే ఏమిటి?",
      "2. MedScore ఎలా పని చేస్తుంది? దాని ప్రవాహాన్ని వివరించండి.",
      "3. రిటైలర్ ఫార్మసీ క్రెడిట్ స్కోర్‌ను ఎలా తనిఖీ చేస్తారు?",
      "4. రిటైలర్ నేరుగా ఫార్మసీకి నోటీసు పంపగలరా?",
      "5. ఫార్మసీ క్రెడిట్ స్కోర్‌ను ప్రభావితం చేసే అంశాలు ఏమిటి?",
      "6. రిటైలర్ బకాయి చెల్లింపులను అప్‌లోడ్ చేసినప్పుడు ఏమి జరుగుతుంది?",
      "7. మెడ్‌స్కోర్(MedScore) ఏయే ప్రాంతాల్లో ఉపయోగించబడుతుంది?",
      "8. MedScore టీమ్‌ను ఎలా సంప్రదించాలి?"
    ]
  },
  answers: {
    en: {
      "1": "MedScore is a credit risk assessment platform for pharma & healthcare distribution.",
      "2": `MedScore is the world’s first Credit Risk Assessment Platform for Pharma & Healthcare Distribution, revolutionizing credit risk management in the pharmaceutical industry. It operates for both distributors and retailers/pharmacies.

Flow for Retailers/Pharmacies:
Registration & Login : Users (retailers/pharmacies) must register using their Drug License (DL) Number for verification. After successful registration, they can log in to the system.
Dashboard Access : After logging in, users can access the dashboard, where they can view credit-related details.
Search for Credit Score: Users can search for a distributor or another pharmacy by entering a DL number or pharmacy name to check their credit score.
Send Notices & Mark Defaults: Before taking any action, the user must first link with the distributor/pharmacy. Once linked, they can send notices and mark defaults if there are payment delays.
Upload Outstanding Balances: Users can upload outstanding dues for the linked distributors/pharmacies.
Impact on Credit Score: The credit score of a pharmacy changes based on outstanding payments and default delays. If payments are overdue for an extended period, the score decreases, impacting their credibility.
MedScore ensures transparent, data-driven credit risk management, helping distributors and pharmacies make informed financial decisions.

`,
      "3": "Retailers can check by searching using the DL number or pharmacy name.",
      "4": "No, they must first link to the pharmacy.",
      "5": "Outstanding payments, defaults, and delay days influence the credit score.",
      "6": "The system updates the pharmacy's credit score based on payment delays.",
      "7": "MedScore is used in Kamareddy, Delhi, Rajahmundry, and Aurangabad.",
      "8": "You can send queries to this email: medscore24@gmail.com or send a WhatsApp message to this number: +91 9063570310."
    },
    hi: {
      "1": "मेडस्कोर फार्मा और हेल्थकेयर वितरण के लिए एक क्रेडिट जोखिम आकलन मंच है।",
      "2":`MedScore दुनिया का पहला क्रेडिट रिस्क असेसमेंट प्लेटफॉर्म है, जिसे फार्मा और हेल्थकेयर डिस्ट्रीब्यूशन के लिए डिज़ाइन किया गया है, जो फार्मास्युटिकल उद्योग में क्रेडिट रिस्क मैनेजमेंट को नया रूप दे रहा है। यह डिस्ट्रीब्यूटरों और फार्मेसियों/रिटेलर्स दोनों के लिए काम करता है।

फार्मेसियों के लिए MedScore का प्रक्रिया:
रजिस्ट्रेशन और लॉगिन: उपयोगकर्ताओं को ड्रग लाइसेंस (DL) नंबर के साथ पंजीकरण करना होगा। सफल पंजीकरण के बाद, वे सिस्टम में लॉगिन कर सकते हैं।
डैशबोर्ड एक्सेस: लॉगिन करने के बाद, उपयोगकर्ता डैशबोर्ड तक पहुंच सकते हैं और अपने क्रेडिट संबंधी विवरण देख सकते हैं।
क्रेडिट स्कोर खोजें: उपयोगकर्ता DL नंबर या फार्मेसी का नाम दर्ज करके किसी डिस्ट्रीब्यूटर या अन्य फार्मेसी का क्रेडिट स्कोर देख सकते हैं।
नोटिस भेजें और डिफॉल्ट मार्क करें: किसी भी कार्रवाई से पहले, उपयोगकर्ता को पहले डिस्ट्रीब्यूटर या फार्मेसी के साथ लिंक करना होगा। लिंक करने के बाद, वे नोटिस भेज सकते हैं और डिफॉल्ट मार्क कर सकते हैं।
बकाया राशि अपलोड करें: उपयोगकर्ता लिंक किए गए डिस्ट्रीब्यूटर या फार्मेसी के लिए बकाया राशि अपलोड कर सकते हैं।
क्रेडिट स्कोर पर प्रभाव: फार्मेसी का क्रेडिट स्कोर बकाया भुगतान और विलंबित दिनों के आधार पर बढ़ या घट सकता है। यदि भुगतान देर से किया जाता है, तो स्कोर घटता है, जिससे उनकी साख प्रभावित होती है।
MedScore एक पारदर्शी, डेटा-संचालित क्रेडिट रिस्क प्रबंधन प्रणाली प्रदान करता है, जो डिस्ट्रीब्यूटर्स और फार्मेसियों को बेहतर वित्तीय निर्णय लेने में मदद करता है।`,
      "3": "खुदरा विक्रेता डीएल नंबर या फार्मेसी के नाम का उपयोग करके खोज सकते हैं।",
      "4": "नहीं, उन्हें पहले फार्मेसी से जुड़ना होगा।",
      "5": "बकाया भुगतान, डिफ़ॉल्ट और विलंब दिन क्रेडिट स्कोर को प्रभावित करते हैं।",
      "6": "सिस्टम भुगतान में देरी के आधार पर फार्मेसी का क्रेडिट स्कोर अपडेट करता है।",
      "7": "मेडस्कोर (MedScore) कामारेड्डी, दिल्ली, राजमंड्री और औरंगाबाद में उपयोग किया जाता है।",
      "8": "आप अपने प्रश्न इस ईमेल पर भेज सकते हैं: medscore24@gmail.com या इस नंबर पर व्हाट्सएप संदेश भेजें: +91 9063570310।"
    },
    te: {
      "1": "మెడ్‌స్కోర్ అనేది ఫార్మా & హెల్త్‌కేర్ పంపిణీ కోసం క్రెడిట్ రిస్క్ అసెస్‌మెంట్ ప్లాట్‌ఫారమ్.",
      "2":`MedScore అనేది ఫార్మా & హెల్త్‌కేర్ పంపిణీ కోసం ప్రపంచంలోనే మొట్టమొదటి క్రెడిట్ రిస్క్ అసెస్‌మెంట్ ప్లాట్‌ఫామ్, ఇది ఔషధ పరిశ్రమలో క్రెడిట్ రిస్క్ నిర్వహణను విప్లవాత్మకంగా మార్చుతోంది. ఇది డిస్ట్రిబ్యూటర్లు మరియు ఫార్మసీలు/రిటైల్ దుకాణాలు కోసం పనిచేస్తుంది.

ఫార్మసీల కోసం MedScore ప్రాసెస్:
నమోదు & లాగిన్: వినియోగదారులు డ్రగ్ లైసెన్స్ (DL) నంబర్ ద్వారా ధృవీకరణ పొందాలి. విజయవంతమైన నమోదు తర్వాత, వారు లాగిన్ అవ్వవచ్చు.
డాష్‌బోర్డ్ యాక్సెస్: లాగిన్ అయిన తర్వాత, వినియోగదారులు డాష్‌బోర్డ్ ని యాక్సెస్ చేసి, క్రెడిట్ సంబంధిత వివరాలను చూడవచ్చు.
క్రెడిట్ స్కోర్ కోసం శోధన: వినియోగదారులు DL నంబర్ లేదా ఫార్మసీ పేరు ద్వారా డిస్ట్రిబ్యూటర్ లేదా మరొక ఫార్మసీని వెతికి, వారి క్రెడిట్ స్కోర్‌ను తెలుసుకోవచ్చు.
నోటీసులు పంపడం & డిఫాల్ట్‌గా మార్క్ చేయడం: ఏదైనా చర్య తీసుకునే ముందు, వినియోగదారులు ముందుగా డిస్ట్రిబ్యూటర్ లేదా ఫార్మసీతో లింక్ అవ్వాలి. లింక్ అయిన తర్వాత, వారు నోటీసులు పంపగలరు మరియు డిఫాల్ట్‌గా గుర్తించగలరు.
అవుట్‌స్టాండింగ్ బకాయిలు అప్‌లోడ్ చేయడం: వినియోగదారులు లింక్ చేసిన ఫార్మసీ లేదా డిస్ట్రిబ్యూటర్ల కోసం అవుట్‌స్టాండింగ్ బకాయిలను అప్‌లోడ్ చేయవచ్చు.
క్రెడిట్ స్కోర్‌పై ప్రభావం: అవుట్‌స్టాండింగ్ చెల్లింపులు మరియు ఆలస్య రద్దీ రోజులు ఆధారంగా క్రెడిట్ స్కోర్ పెరగవచ్చు లేదా తగ్గవచ్చు. చెల్లింపులు ఆలస్యమైతే, స్కోర్ తగ్గుతుంది, ఇది వారి విశ్వసనీయతను ప్రభావితం చేస్తుంది.
MedScore సుస్పష్టమైన, డేటా ఆధారిత క్రెడిట్ రిస్క్ నిర్వహణను అందిస్తుంది, ఇది డిస్ట్రిబ్యూటర్లు మరియు ఫార్మసీలకు ఆర్థిక నిర్ణయాలను సులభతరం చేస్తుంది.`,
      "3": "రిటైలర్లు DL నంబర్ లేదా ఫార్మసీ పేరుతో శోధించవచ్చు.",
      "4": "లేదు, వారు ముందుగా ఫార్మసీతో లింక్ అవ్వాలి.",
      "5": "బకాయి చెల్లింపులు, డిఫాల్ట్‌లు మరియు ఆలస్య రోజులు క్రెడిట్ స్కోర్‌ను ప్రభావితం చేస్తాయి.",
      "6": "చెల్లింపు ఆలస్యాల ఆధారంగా సిస్టమ్ ఫార్మసీ క్రెడిట్ స్కోర్‌ను అప్‌డేట్ చేస్తుంది.",
      "7": "మెడ్‌స్కోర్ (MedScore) కామారెడ్డి, ఢిల్లీ, రాజమండ్రి, మరియు ఔరంగాబాద్‌లో ఉపయోగించబడుతుంది.",
      "8": "మీరు మీ ప్రశ్నలను ఈ ఇమెయిల్‌కి పంపవచ్చు: medscore24@gmail.com లేదా ఈ నంబర్‌కు వాట్సాప్ సందేశం పంపండి: +91 9063570310."
    }
  },
  languageSelected: {
    en: "You've selected English. Here are some common questions you can ask:",
    hi: "आपने हिंदी चुना है। यहाँ कुछ सामान्य प्रश्न हैं जो आप पूछ सकते हैं:",
    te: "మీరు తెలుగు ఎంచుకున్నారు. మీరు అడగగలిగే కొన్ని సాధారణ ప్రశ్నలు ఇవి:"
  }
};

// Enhanced bot response generation
function generateBotResponse(userMessage, language = 'en') {
  const lowerMessage = userMessage.toLowerCase();

  // Handle language selection
  if (['a', 'b', 'c'].includes(userMessage)) {
    const langMap = { 'a': 'en', 'b': 'hi', 'c': 'te' };
    const selectedLang = langMap[userMessage];
    return {
      text: responses.languageSelected[selectedLang] + '\n\n' + 
            responses.suggestedQuestions[selectedLang].join('\n'),
      language: selectedLang
    };
  }

  // Handle numbered questions (1-6)
  if (/^[1-6]$/.test(userMessage)) {
    return {
      text: responses.answers[language][userMessage],
      language
    };
  }

  // Handle other queries by looking for keywords
  for (let i = 0; i < responses.suggestedQuestions[language].length; i++) {
    const questionNumber = (i + 1).toString();
    if (lowerMessage.includes(responses.suggestedQuestions[language][i].toLowerCase())) {
      return {
        text: responses.answers[language][questionNumber],
        language
      };
    }
  }

  // Default response: show questions again
  return {
    text: "Please choose a question from the following:\n\n" + 
          responses.suggestedQuestions[language].join('\n'),
    language
  };
}

// Rest of the code remains the same (initChat, postmessage, getHistory functions)
const initChat = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const greeting = new Message({
      text: responses.greeting.en,
      isBot: true,
      sessionId: sessionId,
      language: 'en'
    });
    await greeting.save();
    
    res.json({ message: greeting });
  } catch (error) {
    console.error('Error initializing chat:', error);
    res.status(500).json({ error: 'Error initializing chat' });
  }
});

const postmessage = asyncHandler(async (req, res) => {
  try {
    const { message, sessionId, language = 'en' } = req.body;

    const userMessage = new Message({
      text: message,
      isBot: false,
      sessionId: sessionId,
      language: language
    });
    await userMessage.save();

    const botResponse = generateBotResponse(message, language);
    
    const botMessage = new Message({
      text: botResponse.text,
      isBot: true,
      sessionId: sessionId,
      language: botResponse.language
    });
    await botMessage.save();

    res.json({ 
      response: botResponse.text,
      language: botResponse.language 
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Error processing message' });
  }
});

const getHistory = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ 
      sessionId: req.params.sessionId 
    }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Error fetching message history' });
  }
});

module.exports = {
  initChat,
  postmessage,
  getHistory
};