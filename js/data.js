/* ============================================
   SpecialRx – Sample Pharmaceutical Data
   ============================================ */

const PHARMACIES = [
  {
    id: 'ph-001',
    name: 'Green Cross Pharmacy',
    gphc: 'GPhC-9012345',
    address: '42 High Street, Kensington, London W8 4PT',
    initials: 'GC',
    accountNo: 'B5010'
  },
  {
    id: 'ph-002',
    name: 'CarePlus Pharmacy',
    gphc: 'GPhC-9023456',
    address: '15 Victoria Road, Birmingham B1 1PN',
    initials: 'CP',
    accountNo: 'B5011'
  },
  {
    id: 'ph-003',
    name: 'MedPoint Pharmacy',
    gphc: 'GPhC-9034567',
    address: '7 Castle Street, Manchester M3 4LZ',
    initials: 'MP',
    accountNo: 'B5012'
  }
];

const MEDICINES = [
  {
    id: 'med-001',
    name: 'Liothyronine Sodium 20mcg Tablets',
    code: 'SPX-LIO-020',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '28 Tablets',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C. Protect from light.',
    description: 'Liothyronine (T3) is a thyroid hormone used in the treatment of hypothyroidism and myxoedema coma. This unlicensed special is manufactured to order for patients with specific clinical needs.',
    availability: 'In Stock – 2-3 business days'
  },
  {
    id: 'med-002',
    name: 'Hydrocortisone 2.5mg Modified Release Capsules',
    code: 'SPX-HYD-025',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '30 Capsules',
    rxRequired: true,
    inStock: true,
    storage: 'Store in a dry place below 25°C.',
    description: 'Modified release hydrocortisone capsules for adrenal insufficiency. Designed to mimic physiological cortisol release patterns. Manufactured as an unlicensed special.',
    availability: 'In Stock – 2-3 business days'
  },
  {
    id: 'med-003',
    name: 'Chenodeoxycholic Acid 250mg Capsules',
    code: 'IMP-CHE-250',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '100 Capsules',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 30°C.',
    description: 'Imported chenodeoxycholic acid capsules for the treatment of cerebrotendinous xanthomatosis (CTX). Licensed in EU but imported for UK patients with clinical need.',
    availability: 'In Stock – 5-7 business days'
  },
  {
    id: 'med-004',
    name: 'Melatonin 2mg/5ml Oral Solution',
    code: 'SPX-MEL-002',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '150ml',
    rxRequired: true,
    inStock: true,
    storage: 'Store in refrigerator (2-8°C). Protect from light.',
    description: 'Sugar-free melatonin oral solution for paediatric use. Manufactured as an unlicensed special for patients unable to swallow tablets.',
    availability: 'In Stock – 3-4 business days'
  },
  {
    id: 'med-005',
    name: 'Acetazolamide 250mg Tablets',
    code: 'TAR-ACE-250',
    category: 'tariff',
    categoryLabel: 'Tariff',
    packSize: '112 Tablets',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C in original packaging.',
    description: 'Tariff-listed acetazolamide tablets used for glaucoma, epilepsy, and altitude sickness. Available through special order due to supply constraints.',
    availability: 'In Stock – 1-2 business days'
  },
  {
    id: 'med-006',
    name: 'Trihexyphenidyl 5mg/5ml Oral Solution',
    code: 'SPX-TRI-005',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '200ml',
    rxRequired: true,
    inStock: false,
    storage: 'Store below 25°C. Discard 28 days after opening.',
    description: 'Trihexyphenidyl liquid preparation for patients with dystonia who cannot swallow solid dosage forms. Manufactured as an unlicensed special.',
    availability: 'Out of Stock – ETA 10-14 days'
  },
  {
    id: 'med-007',
    name: 'Glycopyrronium Bromide 1mg/5ml Oral Solution',
    code: 'SPX-GLY-001',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '150ml',
    rxRequired: true,
    inStock: true,
    storage: 'Store in refrigerator (2-8°C).',
    description: 'Glycopyrronium oral solution used for excessive drooling (sialorrhoea) in paediatric and adult patients with neurological conditions.',
    availability: 'In Stock – 2-3 business days'
  },
  {
    id: 'med-008',
    name: 'Levothyroxine 25mcg/5ml Oral Solution',
    code: 'SPX-LEV-025',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '100ml',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C. Protect from light.',
    description: 'Levothyroxine liquid preparation for thyroid hormone replacement. For patients who require liquid dosage forms or dose titration.',
    availability: 'In Stock – 2-3 business days'
  },
  {
    id: 'med-009',
    name: 'Midodrine 2.5mg Tablets',
    code: 'IMP-MID-025',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '100 Tablets',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C.',
    description: 'Imported midodrine tablets for severe orthostatic hypotension. Licensed outside the UK and imported for patients with documented clinical need.',
    availability: 'In Stock – 5-7 business days'
  },
  {
    id: 'med-010',
    name: 'Chloral Hydrate 500mg/5ml Oral Solution',
    code: 'SPX-CHL-500',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '150ml',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C. Protect from light.',
    description: 'Chloral hydrate solution for sedation. Schedule 4 controlled substance, manufactured as an unlicensed special. Requires additional compliance checks.',
    availability: 'In Stock – 3-5 business days'
  },
  {
    id: 'med-011',
    name: 'Potassium Citrate Mixture BP',
    code: 'TAR-POT-CIT',
    category: 'tariff',
    categoryLabel: 'Tariff',
    packSize: '200ml',
    rxRequired: false,
    inStock: true,
    storage: 'Store below 25°C.',
    description: 'Official BP preparation used for urinary alkalinisation and mild urinary tract discomfort. Tariff-listed item available on special order.',
    availability: 'In Stock – 1-2 business days'
  },
  {
    id: 'med-012',
    name: 'Sodium Valproate 200mg/5ml Sugar-Free',
    code: 'NT-SOD-200',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '300ml',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C. Discard 21 days after opening.',
    description: 'Sugar-free sodium valproate oral solution for epilepsy management. Non-tariff preparation for patients requiring sugar-free formulation.',
    availability: 'In Stock – 2-3 business days'
  },
  {
    id: 'med-013',
    name: 'Unlicensed Omeprazole 2mg/ml Suspension',
    code: 'SPX-OME-002',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '150ml',
    rxRequired: true,
    inStock: true,
    storage: 'Store in refrigerator (2-8°C). Shake well before use.',
    description: 'Unlicensed omeprazole suspension for paediatric GORD patients who cannot swallow capsules. Manufactured to order.',
    availability: 'In Stock – 3-4 business days'
  },
  {
    id: 'med-014',
    name: 'Fludrocortisone 100mcg Tablets',
    code: 'OBT-FLU-100',
    category: 'obtain',
    categoryLabel: 'Obtain',
    packSize: '30 Tablets',
    rxRequired: true,
    inStock: false,
    storage: 'Store below 25°C. Protect from moisture.',
    description: 'Fludrocortisone tablets for adrenal insufficiency and orthostatic hypotension. Temporarily difficult to obtain through normal channels.',
    availability: 'Out of Stock – Sourcing in progress'
  },
  {
    id: 'med-015',
    name: 'Vigabatrin 500mg Sachets',
    code: 'IMP-VIG-500',
    category: 'non-tariff',
    categoryLabel: 'Non-Tariff',
    packSize: '50 Sachets',
    rxRequired: true,
    inStock: true,
    storage: 'Store below 25°C.',
    description: 'Imported vigabatrin sachets for infantile spasms and refractory epilepsy. Licensed in EU territory and imported under special clinical need.',
    availability: 'In Stock – 5-7 business days'
  }
];

const ORDERS = [
  {
    id: 'SRX-20260522-0042',
    date: '22 May 2026',
    dateShort: '22/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Liothyronine Sodium 20mcg Tablets', qty: 2, packSize: '28 Tablets' }
    ],
    status: 'transit',
    statusLabel: 'Invoiced',
    statusClass: 'status-transit',
    trackingStep: 5,
    estimatedDelivery: '24 May 2026'
  },
  {
    id: 'SRX-20260521-0039',
    date: '21 May 2026',
    dateShort: '21/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Acetazolamide 250mg Tablets', qty: 3, packSize: '112 Tablets' }
    ],
    status: 'transit',
    statusLabel: 'Invoiced',
    statusClass: 'status-transit',
    trackingStep: 4,
    estimatedDelivery: '23 May 2026'
  },
  {
    id: 'SRX-20260521-0038',
    date: '21 May 2026',
    dateShort: '21/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Hydrocortisone 2.5mg MR Capsules', qty: 2, packSize: '30 Capsules' }
    ],
    status: 'processing',
    statusLabel: 'Processing',
    statusClass: 'status-processing',
    trackingStep: 3,
    estimatedDelivery: '25 May 2026'
  },
  {
    id: 'SRX-20260520-0035',
    date: '20 May 2026',
    dateShort: '20/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Chenodeoxycholic Acid 250mg Capsules', qty: 1, packSize: '100 Capsules' }
    ],
    status: 'transit',
    statusLabel: 'Invoiced',
    statusClass: 'status-transit',
    trackingStep: 5,
    estimatedDelivery: '26 May 2026'
  },
  {
    id: 'SRX-20260519-0033',
    date: '19 May 2026',
    dateShort: '19/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Midodrine 2.5mg Tablets', qty: 2, packSize: '100 Tablets' }
    ],
    status: 'processing',
    statusLabel: 'Processing',
    statusClass: 'status-processing',
    trackingStep: 3,
    estimatedDelivery: 'TBC'
  },
  {
    id: 'SRX-20260518-0030',
    date: '18 May 2026',
    dateShort: '18/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Potassium Citrate Mixture BP', qty: 4, packSize: '200ml' },
      { name: 'Levothyroxine 25mcg/5ml Solution', qty: 2, packSize: '100ml' }
    ],
    status: 'delivered',
    statusLabel: 'Invoiced',
    statusClass: 'status-transit',
    trackingStep: 7,
    estimatedDelivery: '20 May 2026',
    deliveredDate: '20 May 2026'
  },
  {
    id: 'SRX-20260516-0027',
    date: '16 May 2026',
    dateShort: '16/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Sodium Valproate 200mg/5ml SF', qty: 1, packSize: '300ml' }
    ],
    status: 'delivered',
    statusLabel: 'Invoiced',
    statusClass: 'status-transit',
    trackingStep: 7,
    estimatedDelivery: '18 May 2026',
    deliveredDate: '18 May 2026'
  },
  {
    id: 'SRX-20260515-0024',
    date: '15 May 2026',
    dateShort: '15/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Liothyronine Sodium 20mcg Tablets', qty: 1, packSize: '28 Tablets' },
      { name: 'Melatonin 2mg/5ml Oral Solution', qty: 2, packSize: '150ml' },
      { name: 'Acetazolamide 250mg Tablets', qty: 1, packSize: '112 Tablets' }
    ],
    status: 'delivered',
    statusLabel: 'Invoiced',
    statusClass: 'status-transit',
    trackingStep: 7,
    estimatedDelivery: '17 May 2026',
    deliveredDate: '17 May 2026'
  },
  {
    id: 'SRX-20260510-0018',
    date: '10 May 2026',
    dateShort: '10/05/2026',
    pharmacy: 'Green Cross Pharmacy',
    items: [
      { name: 'Trihexyphenidyl 5mg/5ml Solution', qty: 1, packSize: '200ml' }
    ],
    status: 'cancelled',
    statusLabel: 'Cancelled',
    statusClass: 'status-cancelled',
    trackingStep: 0,
    estimatedDelivery: 'N/A'
  }
];

const TRACKING_STEPS = [
  { key: 'received', label: 'Order Received', desc: 'Your order has been received and recorded' },
  // { key: 'review', label: 'Under Review', desc: 'Our pharmaceutical team is reviewing your order' },
  // { key: 'approved', label: 'Approved', desc: 'Your order has been approved for processing' },
  { key: 'processing', label: 'Processing', desc: 'Your medicines are being prepared' },
  // { key: 'dispatched', label: 'Dispatched', desc: 'Your order has been dispatched from our facility' },
  { key: 'transit', label: 'Invoiced', desc: 'Your order is currently on its way to your pharmacy' }
];

const NOTIFICATIONS = [
  {
    id: 'n-001',
    type: 'repeat-reminder',
    icon: 'green',
    title: 'Prescription Reminder',
    text: 'This is a gentle reminder to check if you have received the repeat prescription item you ordered with us last month.',
    orderId: 'SRX-20250528-0018',
    orderDate: '28 May 2025',
    reminderDate: '2 Jun 2026',
    time: 'Just now',
    unread: true,
    previousOrder: {
      date: '28 May 2025',
      items: [
        { name: 'Omeprazole 10mg/5ml Suspension 75ml', qty: 3 }
      ]
    }
  }
];

const SUPPORT_TICKETS = [
  {
    id: 'SR-2026-0015',
    type: 'order-support',
    orderId: 'SRX-20260519-0033',
    pharmaName: 'Green Cross Pharmacy',
    orderDate: '2026-05-19',
    orderCategory: 'open',
    issueType: 'Delayed Delivery',
    description: 'Order has been on hold for 3 days with no update.',
    priority: 'High',
    notes: 'Please check on supply issues.',
    status: 'open',
    statusLabel: 'Open',
    statusClass: 'status-review',
    date: '20 May 2026'
  },
  {
    id: 'SR-2026-0012',
    type: 'order-support',
    orderId: 'SRX-20260515-0024',
    pharmaName: 'Green Cross Pharmacy',
    orderDate: '2026-05-15',
    orderCategory: 'close',
    issueType: 'Damaged in Transit',
    description: 'One bottle of Melatonin arrived with a broken seal.',
    priority: 'Medium',
    notes: 'Replacement was requested.',
    status: 'open',
    statusLabel: 'Open',
    statusClass: 'status-processing',
    date: '18 May 2026'
  },
  {
    id: 'SR-2026-0008',
    type: 'order-support',
    orderId: 'SRX-20260510-0018',
    pharmaName: 'Green Cross Pharmacy',
    orderDate: '2026-05-10',
    orderCategory: 'close',
    issueType: 'Missing Items',
    description: 'Resolved - replacement Acetazolamide dispatched.',
    priority: 'High',
    notes: 'Delivered and verified.',
    status: 'closed',
    statusLabel: 'Closed',
    statusClass: 'status-delivered',
    date: '12 May 2026'
  },
  {
    id: 'SR-2026-0005',
    type: 'product-support',
    productName: 'Liothyronine Sodium 20mcg Tablets',
    productCategory: 'Non-Tariff',
    issueType: 'Product Quality',
    description: 'Required for Liothyronine Sodium 20mcg Tablets.',
    contactNo: '020 7946 0148',
    priority: 'Email',
    notes: 'Batch LN-90214.',
    status: 'open',
    statusLabel: 'Open',
    statusClass: 'status-review',
    date: '10 May 2026'
  },
  {
    id: 'SR-2026-0003',
    type: 'product-support',
    productName: 'Trihexyphenidyl 5mg/5ml Solution',
    productCategory: 'Non-Tariff',
    issueType: 'Availability Inquiry',
    description: 'Urgent query on availability for dystonia patient.',
    contactNo: '020 7946 0148',
    priority: 'High',
    notes: 'Stock is now returned.',
    status: 'closed',
    statusLabel: 'Closed',
    statusClass: 'status-delivered',
    date: '08 May 2026'
  }
];

const FAQS = [
  {
    q: 'How do I place a special order?',
    a: 'Navigate to the Search screen, find your required medicine, add it to cart, fill in the verification details and prescription (if required), then submit your order. Orders are processed within 24 hours.'
  },
  {
    q: 'What documents are required for ordering?',
    a: 'All Rx medicines require a valid prescription upload (PDF, JPG, or PNG). You will also need to provide your GPhC registration number and pharmacist name for compliance verification.'
  },
  {
    q: 'How does the credit account work?',
    a: 'Your pharmacy has a pre-approved credit account with set limits. Orders are charged against your credit balance. Payment terms are typically Net 30 days. You can view your credit status in the Account section.'
  },
  {
    q: 'What are the delivery timeframes?',
    a: 'Standard delivery is 1-2 business days for tariff items, and 2-3 business days for non-tariff items. Expedited delivery may be available for urgent clinical needs.'
  },
  {
    q: 'How do I track my order?',
    a: 'Go to My Orders, select an order, and tap "Track Order" to see real-time tracking with status updates from order placement to delivery.'
  },
  {
    q: 'What if a medicine is out of stock?',
    a: 'Out of stock items can still be ordered. We will source the product and provide an estimated delivery date. You can also set up a notification alert for when it becomes available.'
  },
  {
    q: 'How do I raise a complaint?',
    a: 'Go to Help & Support, create a New Request, select the relevant category and provide details. Our support team will respond within 24 business hours.'
  }
];

const ISSUE_CATEGORIES = [
  'Order Delay',
  'Wrong Product',
  'Missing Product',
  'Delivery Issue',
  'Rx Issue',
  'General Inquiry'
];

const ISSUE_TYPES = {
  'Order Delay': ['Late Delivery', 'Processing Delay', 'Dispatch Delay'],
  'Wrong Product': ['Wrong Medicine', 'Wrong Quantity', 'Wrong Strength'],
  'Missing Product': ['Incomplete Order', 'Item Not Received'],
  'Delivery Issue': ['Damaged Package', 'Wrong Address', 'Failed Delivery'],
  'Rx Issue': ['Prescription Rejected', 'Upload Error', 'Verification Failed'],
  'General Inquiry': ['Account Query', 'Product Query', 'Credit Query', 'Other']
};
