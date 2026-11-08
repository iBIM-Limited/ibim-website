// All service copy comes from the previous site, with typos fixed and steps put in working order.
export type Service = {
  slug: string;
  state: string;
  name: string;
  short: string;
  title: string;
  description: string;
  lead: string;
  steps: { title: string; body: string }[];
  includes?: string[];
  stage: string;
  group?: 'architectural';
  serviceType?: string;
  explainer?: { title: string; body: string[]; list?: string[]; note?: string };
  questions?: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: 'bim-advisory',
    questions: [{ q: 'What is BIM?', a: 'Building Information Modelling is a way of creating and managing information about a building or asset through a shared digital model, so everyone works from the same information.' }],
    state: 'advise',
    stage: 'Advise',
    name: 'BIM Advisory & Implementation',
    short: 'BIM Advisory',
    title: 'BIM Advisory & Implementation',
    description: 'Transform your projects with iBIM’s BIM advisory and implementation services, from assessment and strategy to adoption and support.',
    lead: 'From consulting and strategy development to implementation and support, we help your business adopt BIM in a way that lasts.',
    steps: [
      { title: 'Evaluate current processes', body: 'We assess your existing workflows and systems to find the opportunities for BIM adoption and optimisation.' },
      { title: 'Develop a strategic roadmap', body: 'We align BIM implementation with your wider business goals, enabling digital transformation and process improvement.' },
      { title: 'Implement and optimise', body: 'We guide your organisation through adoption, making sure the integration is sustainable and keeps improving.' },
    ],
  },
  {
    slug: 'reality-capture-and-3d-modelling-services',
    questions: [{ q: 'What is scan to BIM?', a: 'A building or site is captured with laser scanning or other survey methods, and that data is then used to create a 3D model of what exists.' }],
    state: 'capture',
    stage: 'Capture',
    name: 'Reality Capture & 3D Modelling',
    short: 'Reality Capture',
    title: 'Reality Capture & 3D Modelling Services',
    description: 'iBIM turns drone, laser scan and survey data into accurate 3D models across architecture, MEP, structure, FF&E and civils.',
    lead: 'We turn real-world data into accurate 3D models for coordination and visualisation.',
    steps: [
      { title: 'Capture the environment', body: 'We use drones, laser scanning and surveying to gather accurate site data.' },
      { title: 'Create 3D models', body: 'We turn captured data into precise, reliable 3D representations, using automation. This covers projects and manufacturers who want to digitally productise what they offer.' },
      { title: 'Align and validate', body: 'We make sure disciplines stay consistent with each other and visualise designs for stakeholder approval.' },
    ],
    includes: ['Architecture', 'MEP', 'Structural', 'FF&E', 'Civil'],
  },
  {
    slug: 'information-management',
    questions: [{ q: 'What is a Common Data Environment?', a: 'A Common Data Environment, or CDE, is an agreed place and process for managing project information, so teams can share it and know which version is current.' }],
    state: 'information',
    stage: 'Coordinate',
    name: 'BIM Information Management',
    short: 'Information Management',
    title: 'BIM Information Management',
    description: 'Appoint iBIM as your Project Information Manager for common data environments, clash detection, auditing, dashboards and reporting.',
    lead: 'Appoint one of our team as your Project Information Manager. We look after collaboration, data integrity and coordination so the project keeps moving.',
    steps: [
      { title: 'Understand data needs', body: 'We evaluate project and organisational requirements, then design information workflows that improve collaboration and coordination across teams.' },
      { title: 'Implement data frameworks', body: 'We develop standardised data structures and protocols, establish a Common Data Environment (CDE) and integrate coordination workflows, working towards clash-free designs.' },
      { title: 'Ensure compliance and QA', body: 'We support ongoing information management through auditing, clash detection and coordination reviews, with compliance against standards and continuous improvement.' },
    ],
    includes: ['Project Information Manager', 'Common Data Environment', 'Clash detection', 'Auditing', 'Custom dashboards and reporting'],
  },
  {
    slug: 'construction-sequencing-and-cost-consultancy-4d5d',
    questions: [{ q: 'What are 4D and 5D BIM?', a: '4D links a model to the construction programme, so you can see how the sequence works. 5D adds cost information, so you can see how design and programme changes affect the budget.' }],
    state: 'sequence',
    stage: 'Time and cost',
    name: 'Construction Sequencing & Cost (4D/5D)',
    short: '4D and 5D',
    title: 'Construction Sequencing & Cost Consultancy (4D/5D)',
    description: 'Integrate time and cost data into your BIM models with iBIM’s 4D and 5D consultancy for smarter planning and decisions.',
    lead: 'We bring time and cost into your BIM workflows, for smarter project planning and decision-making.',
    steps: [
      { title: 'Incorporate time and cost data', body: 'We integrate scheduling (4D) and cost estimation (5D) with your BIM models.' },
      { title: 'Analyse scenarios', body: 'We simulate construction sequences and financial outcomes so you can plan with more evidence.' },
      { title: 'Enhance decision-making', body: 'You can make decisions earlier and optimise project schedules and budgets.' },
    ],
  },
  {
    slug: 'project-management',
    questions: [{ q: 'What is integrated project delivery?', a: 'It is an approach that brings the client, designers and contractors together early and shares information and decisions across the team, instead of working in separate stages.' }],
    state: 'delivery',
    stage: 'Deliver',
    name: 'Project Management & Integrated Project Delivery',
    short: 'Project Management',
    title: 'Project Management & Integrated Project Delivery',
    description: 'iBIM uses digital tools, BIM processes and integrated project procurement to deliver projects on time, within budget and with precision.',
    lead: 'We use digital tools to deliver projects on time, within budget and with precision.',
    steps: [
      { title: 'Foster collaboration', body: 'We bring the right people together, using real-time coordination and digital platforms to improve teamwork and streamline decisions.' },
      { title: 'Plan with digital precision', body: 'We use digital tools and BIM processes to develop accurate schedules, budgets and workflows.' },
      { title: 'Deliver efficiently', body: 'We implement integrated project procurement strategies to complete projects on time, within budget and with good use of resources.' },
    ],
  },
  {
    slug: 'digital-twins-and-fm-consultancy',
    questions: [{ q: 'What is a digital twin?', a: 'A digital twin is a virtual model of a physical asset that is connected to data about how the asset is performing, so it can support operational decisions.' }],
    state: 'twin',
    stage: 'Operate',
    name: 'Digital Twins & FM Consultancy',
    short: 'Digital Twins',
    title: 'Digital Twins & FM Consultancy',
    description: 'iBIM creates digital twins of physical assets to monitor performance, improve sustainability and reduce lifecycle costs.',
    lead: 'We create virtual replicas of physical assets to optimise operations and sustainability.',
    steps: [
      { title: 'Craft a precise digital twin', body: 'We develop accurate virtual representations of physical assets using BIM technologies.' },
      { title: 'Monitor and analyse in real time', body: 'We track performance metrics and operational data through the twin, enabling precise performance assessments.' },
      { title: 'Drive lifecycle excellence', body: 'We use insights from the twin to improve operational efficiency and sustainability, and to reduce lifecycle costs.' },
    ],
  },
];

// General architectural services. They state what guidance requires, and hold no invented projects, prices or credentials.
export const architecturalServices: Service[] = [
  {
    slug: 'architectural-drawings',
    state: 'drawings', stage: 'Architectural drawings', group: 'architectural',
    serviceType: 'Architectural drawing services',
    name: 'Architectural Drawings',
    short: 'Architectural Drawings',
    title: 'Architectural Drawings',
    description: 'Architectural drawings for homeowners, developers, land owners and contractors, from measured surveys to planning and building regulations packages.',
    lead: 'We produce architectural drawings for homes and commercial buildings, from a survey of what exists through to drawings ready for planning or building regulations.',
    steps: [
      { title: 'Survey what is there', body: 'We record the existing building and site, using measured survey and laser scanning where the project needs it.' },
      { title: 'Draw the proposal', body: 'We develop existing and proposed plans, elevations and sections, and can model the design in 3D so you can review it before anything is submitted.' },
      { title: 'Prepare for approval', body: 'We turn the agreed design into the drawing package needed for your planning application, building regulations or construction.' },
    ],
    includes: ['Existing plans and elevations', 'Proposed plans and elevations', 'Sections', 'Location and site plans', '3D models'],
    questions: [
      { q: 'What drawings do I need for my project?', a: 'It depends on the work and the approvals it needs. Most projects start with drawings of what exists and what is proposed. Planning and building regulations then need different information, so tell us what you are planning and we’ll advise.' },
      { q: 'Are you architects?', a: 'iBIM provides architectural drawing and BIM services. In the UK, only people registered with the Architects Registration Board can use the title architect. Ask us who will work on your project and what qualifications they hold.' },
      { q: 'How much do architectural drawings cost?', a: 'It depends on the size of the building, what already exists and which approvals you need. Tell us about the project and we’ll give you a quote.' },
    ],
  },
  {
    slug: 'planning-submissions',
    state: 'planning', stage: 'Planning', group: 'architectural',
    serviceType: 'Planning application drawings and submissions',
    name: 'Planning Submissions',
    short: 'Planning Submissions',
    title: 'Planning Drawings and Submissions',
    description: 'Planning drawings and application submissions, prepared to meet national requirements and your council’s local validation list.',
    lead: 'We prepare planning drawings and submit applications, so your application has what the council needs to validate and assess it.',
    steps: [
      { title: 'Check what you need', body: 'We look at your site and proposal, and work out which application and supporting documents it is likely to need.' },
      { title: 'Prepare the application', body: 'We produce the drawings and bring together the form, plans and supporting information.' },
      { title: 'Submit and respond', body: 'We submit the application and deal with questions from the planning officer about the drawings.' },
    ],
    explainer: {
      title: 'What a planning application needs',
      body: ['National guidance sets a minimum for every application. Your council can also ask for more through its local validation list, so requirements vary by area.'],
      list: [
        'A completed application form and the correct fee',
        'A location plan, typically at 1:1250 or 1:2500, with the site outlined in red and any other land you own in blue',
        'Plans and drawings with an identified scale, and plans showing north',
        'The correct ownership certificate',
        'Any other drawings or documents the proposal or local list requires, such as a Design and Access Statement for some applications',
      ],
    },
    questions: [
      { q: 'What drawings do I need for a planning application?', a: 'At minimum, a location plan. Most proposals also need further plans and drawings to show what is proposed, and your council’s local list may ask for more.' },
      { q: 'Do I need planning permission?', a: 'Not every project does, and the answer depends on the building, its location and the work. We can look at your proposal, and the council can confirm the position formally.' },
      { q: 'Can you guarantee planning permission?', a: 'No. The council makes the decision. We can make sure your application is complete and clearly presented, and tell you about any concerns we see.' },
    ],
  },
  {
    slug: 'building-regulations-drawings',
    state: 'regs', stage: 'Building regulations', group: 'architectural',
    serviceType: 'Building regulations drawings',
    name: 'Building Regulations Drawings',
    short: 'Building Regulations',
    title: 'Building Regulations Drawings',
    description: 'Building regulations drawings with the construction detail your builder and building control body need.',
    lead: 'We produce building regulations drawings with the construction information your builder and building control body need.',
    steps: [
      { title: 'Review the design', body: 'We start from your planning drawings or existing design, and identify which parts of the regulations affect the work.' },
      { title: 'Develop the technical detail', body: 'We add the sections, construction details and notes that show how the work is intended to meet the requirements.' },
      { title: 'Support your application', body: 'We prepare the package for your building control body and tell you early if you need information from others, such as a structural engineer.' },
    ],
    explainer: {
      title: 'Planning and building regulations are different',
      body: [
        'Planning looks at whether a development should go ahead, including its appearance and effect on the area. Building regulations cover how it is built, including structure, fire safety, insulation and access.',
        'Many projects need both, and having one doesn’t give you the other. The Approved Documents give guidance on how to meet the regulations.',
      ],
    },
    questions: [
      { q: 'Who checks building regulations work?', a: 'You can usually use the local authority’s building control team or a registered building control approver. Higher-risk buildings follow a separate route through the Building Safety Regulator.' },
      { q: 'What is the difference between full plans and a building notice?', a: 'With full plans, your drawings are checked before work starts. With a building notice, work is inspected as it goes, without an approved set of plans. A building notice can’t be used for all work, so check before choosing it.' },
    ],
  },
];

export const allServices = [...architecturalServices, ...services];

export const sheets = [
  { path: '/', name: 'Home' },
  ...allServices.map((s) => ({ path: `/${s.slug}`, name: s.short })),
  { path: '/preston-lancashire', name: 'Preston and Lancashire' },
  { path: '/software-development', name: 'Software Development' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/privacy', name: 'Privacy' },
];

export const contact = {
  phone: '+44 7825 885167',
  phoneHref: 'tel:+447825885167',
  email: 'jack@i-bim.co.uk',
  hours: '8.30 am to 5.30 pm',
  linkedin: 'https://www.linkedin.com/company/ibim-ltd/',
};
