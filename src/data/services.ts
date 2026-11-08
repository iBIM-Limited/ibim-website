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
};

export const services: Service[] = [
  {
    slug: 'bim-advisory',
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

export const sheets = [
  { path: '/', name: 'Home' },
  ...services.map((s) => ({ path: `/${s.slug}`, name: s.short })),
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
