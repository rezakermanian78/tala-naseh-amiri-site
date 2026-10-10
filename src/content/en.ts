const todo = (what: string) => `TODO: ${what}`

export const en = {
  meta: { name: 'Tala Naseh Amiri', monogram: 'T' },
  nav: {
    links: [
      { id: 'about', label: 'About' },
      { id: 'education', label: 'Education' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'languages', label: 'Languages' },
      { id: 'goals', label: 'Goals' },
      { id: 'contact', label: 'Contact' },
    ],
    menu: 'Menu',
    toggleTheme: 'Toggle dark mode',
    toggleLang: 'فارسی',
    toggleLangLabel: 'Switch to Persian',
    skip: 'Skip to content',
    skipIntro: 'Skip intro',
    close: 'Close menu',
  },
  hero: {
    greeting: 'Hello, I am',
    name: 'Tala Naseh Amiri',
    nativeName: 'طلا ناصح امیری',
    title: 'Electrical Engineer · Aspiring AI Researcher',
    tagline:
      'Electrical engineering graduate from the University of Tabriz, bringing a circuits-and-signals mindset to the world of artificial intelligence.',
    contact: 'Contact me',
    cv: 'Download CV',
    avatarAlt: 'Portrait of Tala Naseh Amiri',
    status: 'Open to MSc in AI',
  },
  about: {
    eyebrow: 'About',
    title: 'From circuits to intelligence',
    paragraphs: [
      'I am a graduate of Electrical Engineering from the University of Tabriz. My training in circuits, signals and systems taught me to reason carefully about how complex things work.',
      'That curiosity is now pointing toward Artificial Intelligence: I plan to pursue a Master’s degree in AI and build on my engineering foundations with machine learning research.',
      todo('add one or two personal sentences about your story and motivation'),
    ],
    stats: [
      { value: 4, label: 'Languages spoken' },
      { value: 13, label: 'Model variants in my paper' },
      { value: 1, label: 'Paper under review' },
    ],
    facts: [
      { label: 'Field', value: 'Electrical Engineering' },
      { label: 'University', value: 'University of Tabriz' },
      { label: 'Next step', value: 'Master’s in Artificial Intelligence' },
    ],
  },
  education: {
    eyebrow: 'Education',
    title: 'Academic journey',
    items: [
      {
        period: todo('start – end year'),
        degree: 'B.Sc. in Electrical Engineering',
        school: 'University of Tabriz',
        details: todo('specialisation, thesis topic, honours (optional)'),
      },
    ],
  },
  skills: {
    eyebrow: 'Skills',
    title: 'What I work with',
    groups: [
      {
        name: 'Engineering',
        items: [
          'Electrical Engineering',
          'Power Systems',
          'Control Systems',
          'Signal Processing',
          'MATLAB / Simulink',
        ],
      },
      {
        name: 'Programming & AI',
        items: [
          'Python',
          'Machine Learning',
          'Deep Learning',
          'LLMs & RAG',
          'Explainable AI (XAI)',
          'Data Analysis',
          'FastAPI',
          'React',
        ],
      },
      { name: 'Tools', items: ['Git & GitHub', 'Jupyter', 'LaTeX', 'Linux', 'Docker'] },
    ],
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Selected work',
    linkLabel: 'View project',
    coauthorsLabel: 'Co-authors',
    items: [
      {
        title:
          'When most ideas fail: pre-registered kill-tests, walk-forward discipline, and honest failure reporting in machine-learning trading system development: evidence from intraday gold (XAU/USD)',
        badge: 'Research paper · Under review (2026)',
        coauthors: 'Reza Kermanian, Tala Naseh Amiri',
        description:
          'A pre-registered, walk-forward study of 13 machine-learning model variants on 5-minute XAU/USD data (2023-2026). Nine variants failed their own criteria and two edges survived, with every failure reported openly, including a 2026 out-of-time degradation.',
        tags: [
          'Machine Learning',
          'Algorithmic Trading',
          'Walk-Forward Validation',
          'Reproducibility',
        ],
        href: '',
      },
    ],
  },
  languages: {
    eyebrow: 'Languages',
    title: 'Languages I speak',
    levelLabel: 'Proficiency',
    items: [
      { name: 'Persian', native: 'فارسی', level: 5, levelText: 'Native' },
      { name: 'Turkish', native: 'Türkçe', level: 5, levelText: 'Excellent' },
      { name: 'Azeri', native: 'Azərbaycanca', level: 5, levelText: 'Excellent' },
      { name: 'English', native: 'English', level: 5, levelText: 'Excellent' },
      { name: 'German', native: 'Deutsch', level: 3, levelText: 'Intermediate' },
    ],
  },
  goals: {
    eyebrow: 'Next step',
    title: 'Master’s in Artificial Intelligence',
    intro:
      'I am preparing to continue my studies with a Master’s degree in AI, connecting my electrical engineering background to modern machine learning.',
    areasTitle: 'Research interests',
    areas: [
      'Large Language Models in Healthcare',
      'Explainable AI for Intrusion Detection',
      'AI-Driven Compiler Optimization',
      'Fog/Edge Computing Resource Allocation',
      'Machine Learning for Algorithmic Trading',
      'AI for Electrical & Energy Systems',
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Let’s get in touch',
    intro: 'Interested in collaborating or have a question? Send a message.',
    channelsTitle: 'Find me online',
    email: 'Email',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    instagram: 'Instagram',
    todoLink: todo('add link'),
    form: {
      name: 'Your name',
      email: 'Your email',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      success: 'Thank you! Your message was sent.',
      error: 'Something went wrong. Please try again or email directly.',
      mailtoSubject: 'Message from your website',
    },
  },
  footer: { rights: 'All rights reserved.', built: 'Built with care.', top: 'Back to top' },
}

export type Content = typeof en
