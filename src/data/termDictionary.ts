import { TermDictionary } from '../types'

export const termDictionary: TermDictionary = {
  // Financial Terms
  'P/E ratio': {
    term: 'P/E ratio',
    definition: 'Price-to-Earnings ratio - A measure of a company\'s stock price relative to its earnings per share.',
    category: 'Finance',
    examples: ['A P/E ratio of 15 means investors pay $15 for every $1 of earnings.']
  },
  'EBITDA': {
    term: 'EBITDA',
    definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization - A measure of a company\'s operating performance.',
    category: 'Finance',
    examples: ['EBITDA is often used to compare profitability between companies.']
  },
  'ROI': {
    term: 'ROI',
    definition: 'Return on Investment - A performance measure used to evaluate the efficiency of an investment.',
    category: 'Finance',
    examples: ['An ROI of 20% means the investment returned 20% more than the initial cost.']
  },
  'CAPEX': {
    term: 'CAPEX',
    definition: 'Capital Expenditure - Money spent by a company to acquire or upgrade physical assets.',
    category: 'Finance',
    examples: ['CAPEX includes spending on buildings, machinery, and technology.']
  },
  'EBIT': {
    term: 'EBIT',
    definition: 'Earnings Before Interest and Taxes - A measure of a firm\'s profit that includes all expenses except interest and income tax expenses.',
    category: 'Finance',
    examples: ['EBIT is used to analyze a company\'s operating performance.']
  },
  'DCF': {
    term: 'DCF',
    definition: 'Discounted Cash Flow - A valuation method used to estimate the value of an investment based on its expected future cash flows.',
    category: 'Finance',
    examples: ['DCF analysis helps determine if an investment is worth pursuing.']
  },
  'IPO': {
    term: 'IPO',
    definition: 'Initial Public Offering - The first sale of stock by a private company to the public.',
    category: 'Finance',
    examples: ['Many tech companies go through an IPO to raise capital and provide liquidity to early investors.']
  },
  'M&A': {
    term: 'M&A',
    definition: 'Mergers and Acquisitions - The consolidation of companies or assets through various types of financial transactions.',
    category: 'Finance',
    examples: ['M&A activity often increases during periods of economic growth.']
  },

  // Technology Terms
  'API': {
    term: 'API',
    definition: 'Application Programming Interface - A set of rules that allows one software application to interact with another.',
    category: 'Technology',
    examples: ['Developers use APIs to integrate third-party services into their applications.']
  },
  'SDK': {
    term: 'SDK',
    definition: 'Software Development Kit - A collection of software development tools in one installable package.',
    category: 'Technology',
    examples: ['Mobile app developers use SDKs to add features like push notifications.']
  },
  'UI/UX': {
    term: 'UI/UX',
    definition: 'User Interface/User Experience - The design of user interfaces and the overall experience of using a product.',
    category: 'Technology',
    examples: ['Good UI/UX design focuses on making products intuitive and enjoyable to use.']
  },
  'SaaS': {
    term: 'SaaS',
    definition: 'Software as a Service - A software licensing and delivery model where software is licensed on a subscription basis.',
    category: 'Technology',
    examples: ['Netflix and Spotify are examples of SaaS products.']
  },
  'MVP': {
    term: 'MVP',
    definition: 'Minimum Viable Product - A version of a product with just enough features to be usable by early customers.',
    category: 'Technology',
    examples: ['Startups often build MVPs to test their ideas with real users.']
  },
  'DevOps': {
    term: 'DevOps',
    definition: 'Development and Operations - A set of practices that combines software development and IT operations.',
    category: 'Technology',
    examples: ['DevOps aims to shorten the development lifecycle and provide continuous delivery.']
  },
  'Machine Learning': {
    term: 'Machine Learning',
    definition: 'A subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
    category: 'Technology',
    examples: ['Machine learning is used in recommendation systems and fraud detection.']
  },
  'Blockchain': {
    term: 'Blockchain',
    definition: 'A distributed ledger technology that maintains a continuously growing list of records, called blocks.',
    category: 'Technology',
    examples: ['Bitcoin and other cryptocurrencies are built on blockchain technology.']
  },

  // Legal Terms
  'NDA': {
    term: 'NDA',
    definition: 'Non-Disclosure Agreement - A legal contract that establishes a confidential relationship between parties.',
    category: 'Legal',
    examples: ['Companies often require employees to sign NDAs to protect trade secrets.']
  },
  'IP': {
    term: 'IP',
    definition: 'Intellectual Property - Creations of the mind, such as inventions, literary and artistic works, and symbols.',
    category: 'Legal',
    examples: ['Patents, copyrights, and trademarks are forms of IP protection.']
  },
  'Force Majeure': {
    term: 'Force Majeure',
    definition: 'A clause in contracts that frees both parties from liability or obligation when an extraordinary event occurs.',
    category: 'Legal',
    examples: ['Natural disasters and pandemics often trigger force majeure clauses.']
  },
  'Due Diligence': {
    term: 'Due Diligence',
    definition: 'An investigation or audit of a potential investment or product to confirm all facts.',
    category: 'Legal',
    examples: ['Investors conduct due diligence before making major investments.']
  },
  'Liability': {
    term: 'Liability',
    definition: 'A legal obligation or responsibility that one party has to another.',
    category: 'Legal',
    examples: ['Companies carry liability insurance to protect against legal claims.']
  },

  // Medical Terms
  'MRI': {
    term: 'MRI',
    definition: 'Magnetic Resonance Imaging - A medical imaging technique used to visualize internal structures of the body.',
    category: 'Medical',
    examples: ['MRIs are commonly used to diagnose brain and spinal cord conditions.']
  },
  'CT Scan': {
    term: 'CT Scan',
    definition: 'Computed Tomography Scan - An imaging procedure that uses X-rays to create detailed pictures of the body.',
    category: 'Medical',
    examples: ['CT scans are often used to diagnose cancer and internal injuries.']
  },
  'EKG': {
    term: 'EKG',
    definition: 'Electrocardiogram - A test that records the electrical activity of the heart.',
    category: 'Medical',
    examples: ['EKGs help diagnose heart rhythm problems and heart attacks.']
  },
  'Biopsy': {
    term: 'Biopsy',
    definition: 'A medical procedure that involves taking a small sample of tissue for examination.',
    category: 'Medical',
    examples: ['Biopsies are commonly used to diagnose cancer and other diseases.']
  },
  'Symptom': {
    term: 'Symptom',
    definition: 'A physical or mental feature that indicates the existence of something, especially of an undesirable situation.',
    category: 'Medical',
    examples: ['Fever and cough are common symptoms of the flu.']
  },

  // Business Terms
  'KPI': {
    term: 'KPI',
    definition: 'Key Performance Indicator - A measurable value that demonstrates how effectively a company is achieving key business objectives.',
    category: 'Business',
    examples: ['Sales growth and customer satisfaction are common KPIs.']
  },
  'B2B': {
    term: 'B2B',
    definition: 'Business to Business - Commerce between businesses, rather than between a business and individual consumers.',
    category: 'Business',
    examples: ['Software companies often operate in the B2B market.']
  },
  'B2C': {
    term: 'B2C',
    definition: 'Business to Consumer - Commerce between businesses and individual consumers.',
    category: 'Business',
    examples: ['Retail stores and e-commerce sites are B2C businesses.']
  },
  'Market Share': {
    term: 'Market Share',
    definition: 'The percentage of an industry\'s sales that a particular company owns.',
    category: 'Business',
    examples: ['Apple has a significant market share in the smartphone industry.']
  },
  'Revenue': {
    term: 'Revenue',
    definition: 'The total amount of income generated by the sale of goods or services.',
    category: 'Business',
    examples: ['Annual revenue is a key metric for evaluating business performance.']
  }
} 