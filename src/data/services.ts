// Service copy follows brand book section 04 (voice) and 5.9 (the service page).
// Deliverables, "Honestly?" notes and typical-job details are drafts for Jack to confirm.
// Nothing here invents a project, client, price or figure.

export type Pillar = 'architectural' | 'bim';
export type Figure = 'plan' | 'elevation' | 'section' | 'visual' | 'wire' | 'cloud' | 'cde' | 'sequence' | 'programme' | 'twin';

export type Service = {
  slug: string;
  pillar: Pillar;
  name: string; // plain-English name, sentence case (brand book 1.9)
  short: string;
  title: string; // page title, kept from the live site for search
  description: string;
  icon: string; // Lucide icon name (brand book 4.10)
  card: string; // one sentence for service cards
  what: string;
  receive: string[];
  steps: { title: string; body: string }[];
  honestly: string;
  typical: { inputs: string; standards: string; timescale: string };
  figure: Figure;
  figureCaption: string;
  includes?: { title: string; items: string[] };
  serviceType?: string;
  explainer?: { title: string; body: string[]; list?: string[] };
  questions?: { q: string; a: string }[];
};

const PER_JOB = 'stated per job, in writing';

export const architecturalServices: Service[] = [
  {
    slug: 'architectural-drawings',
    pillar: 'architectural',
    serviceType: 'Architectural drawing services',
    name: 'Architectural drawings',
    short: 'Architectural drawings',
    title: 'Architectural drawings',
    description: 'Architectural drawings for homeowners, developers, landowners and contractors, from measured surveys to planning and building regulations packages.',
    icon: 'pencil-ruler',
    card: 'We survey the building and draw what is there and what you propose.',
    what: 'We survey the building, then draw what exists and what you propose: plans, elevations and sections, to scale.',
    receive: ['Existing and proposed plans, elevations and sections as PDF', 'Location and site plans', 'DWG files on request', '3D model views where they help the design'],
    steps: [
      { title: 'Survey what is there', body: 'We measure the building and site. On larger or complex buildings we laser scan.' },
      { title: 'Draw the proposal', body: 'We draw the existing and proposed layouts, and can model the design in 3D so you see it before anything is submitted.' },
      { title: 'Issue for approval', body: 'We turn the agreed design into the package your planning application, building regulations or builder needs.' },
    ],
    honestly: 'If you only need a floor plan to sell or let a property, a simple measured plan costs less than a full drawing set. We’ll tell you.',
    typical: { inputs: 'address, access for a survey, any existing drawings', standards: 'drawn to a stated scale, with a north point', timescale: PER_JOB },
    figure: 'plan',
    figureCaption: 'Plan · existing and proposed',
    questions: [
      { q: 'What drawings do I need for my project?', a: 'It depends on the work and the approvals it needs. Most projects start with drawings of what exists and what is proposed. Planning and building regulations then need different information, so tell us what you are planning and we’ll advise.' },
      { q: 'Are you architects?', a: 'No. iBIM provides architectural drawing and BIM services. In the UK, only people registered with the Architects Registration Board can use the title architect. Our director, Jack Ward, holds a BSc (Hons) in Building Surveying and a Postgraduate Diploma in BIM and Project Management.' },
      { q: 'How much do architectural drawings cost?', a: 'It depends on the size of the building, what already exists and which approvals you need. Tell us about the project and we’ll send a written quote.' },
    ],
  },
  {
    slug: 'planning-submissions',
    pillar: 'architectural',
    serviceType: 'Planning application drawings and submissions',
    name: 'Planning submissions',
    short: 'Planning submissions',
    title: 'Planning drawings and submissions',
    description: 'Planning drawings and application submissions, handled in house or with planning consultants we work with, to meet national and local requirements.',
    icon: 'file-check',
    card: 'We prepare the drawings and documents your council needs, and submit them.',
    what: 'We prepare the drawings and documents your council needs to validate a planning application, and submit it. Depending on the project, we do this in house or with planning consultants we work with.',
    receive: ['Location plan at 1:1250 or 1:2500, site outlined in red', 'Block or site plan', 'Existing and proposed plans and elevations as PDF', 'The application form and supporting documents, submitted for you'],
    steps: [
      { title: 'Check what you need', body: 'We look at the site and proposal, and list the application type and the documents your council’s validation list asks for.' },
      { title: 'Prepare the application', body: 'We draw the plans and bring together the form, the drawings and the supporting information.' },
      { title: 'Submit and respond', body: 'We submit the application. Questions from the planning officer are answered by us or by the planning consultant on the job.' },
    ],
    honestly: 'Some work doesn’t need planning permission. If yours may be permitted development, we’ll say so before you pay for a full application. The council can confirm it formally.',
    typical: { inputs: 'address, what you want to build, any pre-application advice', standards: 'national requirements and your council’s local validation list', timescale: PER_JOB },
    figure: 'elevation',
    figureCaption: 'Elevation · proposed',
    explainer: {
      title: 'What a planning application needs.',
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
      { q: 'Who handles the planning work?', a: 'Sometimes we handle it in house, and sometimes we work with planning consultants, depending on the project. We’ll tell you who is involved before work starts.' },
      { q: 'Can you guarantee planning permission?', a: 'No. The council makes the decision. We make sure your application is complete and clearly presented, and tell you about any concerns we see.' },
    ],
  },
  {
    slug: 'building-regulations-drawings',
    pillar: 'architectural',
    serviceType: 'Building regulations drawings',
    name: 'Building regulations drawings',
    short: 'Building regulations',
    title: 'Building regulations drawings',
    description: 'Building regulations drawings with the construction detail your builder and building control body need.',
    icon: 'layers',
    card: 'We add the construction detail your builder and building control need.',
    what: 'We add the construction detail to your design, so your builder and building control body can see how the work meets the Building Regulations.',
    receive: ['Plans, sections and construction details as PDF', 'Specification notes on the drawings', 'A package ready for a full plans application'],
    steps: [
      { title: 'Review the design', body: 'We start from your planning drawings or existing design, and list the parts of the regulations the work affects.' },
      { title: 'Draw the technical detail', body: 'We add the sections, construction details and notes that show how the work meets the requirements.' },
      { title: 'Support the application', body: 'We prepare the package for your building control body, and tell you at the start if you need a structural engineer or other input.' },
    ],
    honestly: 'Some small jobs can go ahead under a building notice, without full plans. If that suits your work, we’ll tell you before you pay for a full set.',
    typical: { inputs: 'planning drawings or an agreed design', standards: 'the Building Regulations and Approved Documents', timescale: PER_JOB },
    figure: 'section',
    figureCaption: 'Section · construction detail',
    explainer: {
      title: 'Planning and building regulations are different.',
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
  {
    slug: '3d-visuals-and-real-time-visualisation',
    pillar: 'architectural',
    serviceType: '3D visualisation and real-time space visualisation',
    name: '3D visuals and real-time visualisation',
    short: '3D visuals',
    title: '3D visuals and real-time space visualisation',
    description: '3D visuals and real-time space visualisation, so you can understand a building or space and make decisions before it is built or changed.',
    icon: 'box',
    card: 'We show the design as still images and a model you can move around.',
    what: 'We build a 3D model of the design or the existing space, then produce still images and a real-time view you can move around in.',
    receive: ['Still visualisations as JPG or PNG', 'A real-time view of the space you can explore', 'The 3D model, on request'],
    steps: [
      { title: 'Start from real information', body: 'We work from your drawings, an existing model or a point cloud captured on site.' },
      { title: 'Build the model', body: 'We model the building or space to the detail the images need.' },
      { title: 'Show the space', body: 'We produce the stills and the real-time view, and walk you through them on a call.' },
    ],
    honestly: 'For a straightforward extension, a few 3D views from the drawing model are often enough. You don’t always need a full visualisation.',
    typical: { inputs: 'drawings, a model or a survey', standards: 'honest lighting and materials, labelled “visualisation”', timescale: PER_JOB },
    figure: 'visual',
    figureCaption: 'Visualisation · illustrative, not a client project',
    questions: [
      { q: 'What is real-time visualisation?', a: 'It is a view of a 3D model that you can move around and explore as you choose, instead of looking at a fixed image.' },
      { q: 'Do I need a BIM model first?', a: 'No. We can start from drawings or a survey and build what the project needs.' },
    ],
  },
];

export const services: Service[] = [
  {
    slug: 'bim-advisory',
    pillar: 'bim',
    name: 'BIM advisory and implementation',
    short: 'BIM advisory',
    title: 'BIM advisory and implementation',
    description: 'BIM advisory and implementation from iBIM: we review how your team works, then set up BIM processes, templates and plans it will keep using.',
    icon: 'compass',
    card: 'We set up BIM processes your team will still use in a year.',
    what: 'We look at how your team produces and shares information now, then set up building information modelling (BIM) processes it will still use in a year.',
    receive: ['A review of your current workflows (PDF)', 'BIM execution plan (BEP) and templates', 'Support while your team adopts them'],
    steps: [
      { title: 'Review how you work', body: 'We look at your current drawings, models, software and file sharing, and talk to the people who use them.' },
      { title: 'Agree a plan', body: 'We write down what to change, in what order and why, sized to the work you actually win.' },
      { title: 'Set it up and support it', body: 'We build the templates and processes with your team and stay on hand while they bed in.' },
    ],
    honestly: 'You don’t need full BIM for every job. If a scan and a 2D pack will do, we’ll say so.',
    typical: { inputs: 'your current templates, software and a recent project', standards: 'BS EN ISO 19650 and the UK BIM Framework', timescale: PER_JOB },
    figure: 'wire',
    figureCaption: 'Model · federated view',
    questions: [{ q: 'What is BIM?', a: 'Building information modelling (BIM) is one shared digital record of a building, used by everyone on the job, so they all work from the same information.' }],
  },
  {
    slug: 'reality-capture-and-3d-modelling-services',
    pillar: 'bim',
    name: 'Reality capture and 3D modelling',
    short: 'Reality capture',
    title: 'Reality capture and 3D modelling services',
    description: 'iBIM turns drone, laser scan and survey data into accurate 3D models across architecture, MEP, structure, FF&E and civils.',
    icon: 'scan-line',
    card: 'We scan the building and model what is there.',
    what: 'We laser scan the building and produce a model and drawings of what is actually there.',
    receive: ['Registered point cloud', 'Native model', 'IFC export (open model format)', 'Plans, sections and elevations as PDF and DWG'],
    steps: [
      { title: 'Capture the building', body: 'We laser scan the building or site, and use drone or measured survey where it suits the job.' },
      { title: 'Model what is there', body: 'We turn the point cloud into a model and drawings, using automation for the repeated work.' },
      { title: 'Check and issue', body: 'We check the model against the scan and walk you through it before we issue.' },
    ],
    honestly: 'If you only need two floor plans, a measured survey is cheaper. We’ll tell you.',
    typical: { inputs: 'access, existing drawings if any', standards: 'agreed level of detail, BS EN ISO 19650', timescale: PER_JOB },
    figure: 'cloud',
    figureCaption: 'Point cloud → model',
    includes: { title: 'What we model.', items: ['Point cloud to floor plan conversion', 'Architecture', 'MEP', 'Structure', 'FF&E', 'Civils'] },
    questions: [{ q: 'What is scan to BIM?', a: 'A building or site is captured with laser scanning or other survey methods, and that data is used to create a 3D model of what exists.' }],
  },
  {
    slug: 'information-management',
    pillar: 'bim',
    name: 'Information management',
    short: 'Information management',
    title: 'BIM information management',
    description: 'Appoint iBIM as your project information manager for common data environments, clash detection, auditing, dashboards and reporting.',
    icon: 'folder-tree',
    card: 'We keep project information in one place, to one standard.',
    what: 'We act as your project information manager. We set up the common data environment (CDE), keep information to the agreed standard and run clash detection.',
    receive: ['Information protocol and BIM execution plan (BEP)', 'CDE set-up and naming convention', 'Clash reports listing each clash with an owner and a date', 'Audit reports and dashboards'],
    steps: [
      { title: 'Agree what is needed', body: 'We set out who produces what information, when and in what format.' },
      { title: 'Set up the CDE', body: 'We set up the one agreed place project files live, with naming, status and review rules.' },
      { title: 'Check and coordinate', body: 'We audit information as it arrives, run clash detection and report clashes with an owner and a date.' },
    ],
    honestly: 'On a small project with one designer, a full CDE can be more process than the job needs. A shared folder and a naming convention may do.',
    typical: { inputs: 'the client’s information requirements, the team list and programme', standards: 'BS EN ISO 19650-2', timescale: PER_JOB },
    figure: 'cde',
    figureCaption: 'CDE · work in progress → shared → published',
    includes: { title: 'What this covers.', items: ['Project information manager', 'Common data environment', 'Clash detection', 'Auditing', 'Dashboards and reporting'] },
    questions: [{ q: 'What is a common data environment?', a: 'A common data environment (CDE) is the one agreed place project files live, with a process for sharing them, so teams know which version is current.' }],
  },
  {
    slug: 'construction-sequencing-and-cost-consultancy-4d5d',
    pillar: 'bim',
    name: 'Sequencing and cost (4D/5D)',
    short: '4D and 5D',
    title: 'Construction sequencing and cost consultancy (4D/5D)',
    description: 'iBIM links your model to the construction programme (4D) and to cost (5D), so you can see the build sequence and what a change does to the budget.',
    icon: 'calendar-range',
    card: 'We link the model to the programme and the budget.',
    what: 'We link the model to the construction programme (4D) and to cost (5D), so you can see the build sequence and what a change does to the budget.',
    receive: ['4D sequence video (MP4)', 'The model linked to your programme', 'Quantities taken from the model (XLSX)'],
    steps: [
      { title: 'Link programme and model', body: 'We connect each part of the model to its activity in your programme.' },
      { title: 'Add cost', body: 'We take quantities from the model and link them to your cost plan.' },
      { title: 'Test the options', body: 'We show you how a change to the sequence or design affects time and cost.' },
    ],
    honestly: '4D and 5D earn their place on complex or phased sites. On a simple build, a programme and a cost plan are usually enough.',
    typical: { inputs: 'the model, the programme and the cost plan', standards: 'agreed level of detail for quantities', timescale: PER_JOB },
    figure: 'sequence',
    figureCaption: '4D · sequence by week',
    questions: [{ q: 'What are 4D and 5D BIM?', a: '4D links a model to the construction programme, so you can see how the sequence works. 5D adds cost, so you can see how design and programme changes affect the budget.' }],
  },
  {
    slug: 'project-management',
    pillar: 'bim',
    name: 'Project management',
    short: 'Project management',
    title: 'Project management and integrated project delivery',
    description: 'iBIM manages design and delivery with programme, cost and information kept in one place, so the client, designers and contractor work from the same picture.',
    icon: 'clipboard-list',
    card: 'We run the project with programme, cost and information in one place.',
    what: 'We manage design and delivery for you, with programme, cost and information kept in one place, so the client, designers and contractor work from the same picture.',
    receive: ['Project programme', 'Progress reports (PDF)', 'Risk and issue log (XLSX)', 'Record of decisions'],
    steps: [
      { title: 'Bring the team together', body: 'We get the client, designers and contractor working from one plan early, not in separate stages.' },
      { title: 'Plan from the model', body: 'We build the programme and budget from the project information, so they stay in step with the design.' },
      { title: 'Deliver and report', body: 'We track progress, cost and risk, and report with owners and dates.' },
    ],
    honestly: 'If your contractor already provides a project manager, you may only need us for the information side.',
    typical: { inputs: 'the brief, budget and team', standards: 'BS EN ISO 19650 for project information', timescale: PER_JOB },
    figure: 'programme',
    figureCaption: 'Programme · RIBA stages',
    questions: [{ q: 'What is integrated project delivery?', a: 'It is an approach that brings the client, designers and contractors together early and shares information and decisions across the team, instead of working in separate stages.' }],
  },
  {
    slug: 'digital-twins-and-fm-consultancy',
    pillar: 'bim',
    name: 'Digital twins and FM',
    short: 'Digital twins',
    title: 'Digital twins and FM consultancy',
    description: 'iBIM connects your building’s model to its asset data, so estates and facilities teams can find equipment, records and maintenance history in one place.',
    icon: 'building-2',
    card: 'We connect the building’s model to the data you run it with.',
    what: 'We connect the building’s model to its asset data, so your estates and facilities management (FM) team can find equipment, its records and its maintenance history in one place.',
    receive: ['Asset register linked to the model (XLSX or COBie)', 'The model in an open format (IFC)', 'A viewer or dashboard for your team'],
    steps: [
      { title: 'Start with one building', body: 'We agree which assets matter to your team and pilot on one building.' },
      { title: 'Connect model and data', body: 'We link the model to your asset register and maintenance records.' },
      { title: 'Hand it over', body: 'You get the data in open formats, a short guide and a check-in after the first month.' },
    ],
    honestly: 'Start with the assets you actually maintain. A twin of everything is rarely worth it on day one.',
    typical: { inputs: 'handover files, asset lists and maintenance records', standards: 'BS EN ISO 19650-3', timescale: PER_JOB },
    figure: 'twin',
    figureCaption: 'Digital twin · selected asset',
    questions: [{ q: 'What is a digital twin?', a: 'A digital twin is a live model of a building in use, connected to its data, so it can support operational decisions.' }],
  },
];

export const allServices = [...architecturalServices, ...services];

export const pillars = [
  { key: 'architectural', name: 'Architectural', summary: 'Drawings, planning, building regulations', body: 'Architectural drawings, planning submissions, building regulations drawings and 3D visuals.', href: '/architectural-drawings', icon: 'pencil-ruler' },
  { key: 'bim', name: 'BIM and digital', summary: 'Capture, modelling, information, twins', body: 'BIM advisory, reality capture and 3D modelling, information management, 4D/5D, project management and digital twins.', href: '/bim-advisory', icon: 'box' },
  { key: 'software', name: 'Software and automation', summary: 'Tools that remove repeated admin', body: 'Custom tools, scripts and platforms that remove repeated admin from design, delivery and operation.', href: '/software-development', icon: 'workflow' },
];

// Real work supplied by Jack. Add detail only when he confirms it and the client gives permission.
export const recentWork = [
  { title: 'Point cloud to floor plan conversions', tag: 'Reality capture', body: 'Point cloud survey data turned into floor plans.', slug: 'reality-capture-and-3d-modelling-services' },
  { title: 'Planning drawings for a house in Lytham', tag: 'Planning · residential', body: 'Drawings prepared for a residential planning application.', slug: 'planning-submissions' },
  { title: '3D visuals for projects', tag: '3D visuals', body: 'Showing what a project will look like before work starts.', slug: '3d-visuals-and-real-time-visualisation' },
];

export const sheets = [
  { path: '/', name: 'Home' },
  ...allServices.map((s) => ({ path: `/${s.slug}`, name: s.short })),
  { path: '/preston-lancashire', name: 'Preston and Lancashire' },
  { path: '/software-development', name: 'Software and automation' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/privacy', name: 'Privacy' },
];

export const contact = {
  person: 'Jack Ward',
  role: 'Director',
  phone: '+44 7825 885167',
  phoneHref: 'tel:+447825885167',
  email: 'jack@i-bim.co.uk',
  hours: '8.30 am to 5.30 pm',
  linkedin: 'https://www.linkedin.com/company/ibim-ltd/',
  companyNumber: '16143866',
  registeredOffice: '12 Greenfields Crescent, Wesham, Preston, England, PR4 3EH',
};

export const promise = 'Simplifying AEC with integrated digital solutions.';
