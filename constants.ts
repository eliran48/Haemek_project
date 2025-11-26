
import { TeamMember, Role, ProjectPhase, ModuleCost, Task, TaskStatus, MeetingNote, ProposalStep } from './types';

export const TEAM_MEMBERS: TeamMember[] = [
  { 
    id: '1', 
    name: 'אלירן אור', 
    role: Role.PROJECT_MANAGER, 
    avatar: 'https://picsum.photos/seed/eliran/100',
    email: 'eliran@wiseguys.co.il',
    phone: '050-1234567'
  },
  { 
    id: '2', 
    name: 'רפאל', 
    role: Role.DESIGNER, 
    avatar: 'https://picsum.photos/seed/rafael/100',
    email: 'rafael@wiseguys.co.il'
  },
  { 
    id: '3', 
    name: 'יוסי', 
    role: Role.DEVELOPER, 
    avatar: 'https://picsum.photos/seed/yossi/100',
    email: 'yossi@wiseguys.co.il'
  },
  { 
    id: '4', 
    name: 'רועי', 
    role: Role.DEVELOPER, 
    avatar: 'https://picsum.photos/seed/roi/100',
    email: 'roi@wiseguys.co.il'
  },
  { 
    id: '5', 
    name: 'לקוח (איריס/שני/שרון)', 
    role: Role.CLIENT, 
    avatar: 'https://picsum.photos/seed/client/100',
    email: 'contact@museum.co.il'
  },
];

export const INITIAL_PHASES: ProjectPhase[] = [
  { id: 1, name: 'אפיון, עיצוב והכנה', description: 'פגישות אפיון, עיצוב סקיצות, הקמת דרייב לחומרים', status: 'active', percentage: 40 },
  { id: 2, name: 'פיתוח', description: 'בניית האתר בסביבת פיתוח, הקמת תבניות וטפסים', status: 'pending', percentage: 0 },
  { id: 3, name: 'הדרכה', description: 'הדרכה על מערכת הניהול ותפעול שוטף', status: 'pending', percentage: 0 },
  { id: 4, name: 'QA ובדיקות', description: 'בדיקות מקיפות, תאימות מובייל, תיקון באגים', status: 'pending', percentage: 0 },
  { id: 5, name: 'עלייה לאוויר', description: 'העברה לדומיין רשמי, הפניות 301', status: 'pending', percentage: 0 },
];

export const PROJECT_MODULES: ModuleCost[] = [
  {
    name: 'חבילת בסיס (חובה) - אפיון, עיצוב ופיתוח',
    description: 'בניית תשתית האתר, עיצוב מלא וחווית משתמש',
    selected: true,
    features: [
        'אפיון ועיצוב מלא לאתר החדש, מותאם למובייל עם תמונות גדולות וצבעוניות.',
        'בנייה בסביבת פיתוח נפרדת ללא פגיעה באתר הנוכחי.',
        'הקמת מערכת טפסים פשוטה ליצירת קשר והזמנת הדרכות.',
        'הקמת קטגוריית גלריה לאירועי עבר וארכיון אירועים מסודר.',
        'קישור למערכת הארכיון החיצונית של המועצה לשימור אתרים.',
        'יצירת תשתית לאינטראקטיביות (QR, תכנים דינמיים).',
        'יצירת תבניות פשוטות לניהול, עיצוב ועדכון תכנים שוטף.'
    ]
  },
  {
    name: 'מודול 1: פלטפורמות תוכן וקטלוגים',
    description: 'שדרוג התוכן הסטטי למערכות דינמיות ומרשימות',
    selected: true,
    features: [
        'הטמעה או קישור של "פלטפורמת סיפור היישובים".',
        'הקמת סקשן ייעודי ל"פלטפורמת כלים חקלאיים" (פריטים, תמונות, וידאו).',
        'שדרוג דף הקורסים וההדרכות לקטלוג דינמי עם אפשרות סינון והזמנה.'
    ]
  },
  {
    name: 'מודול 2: מערכת אירועים והרשמה',
    description: 'ניהול מלא של מחזור חיי האירועים וההרשמות',
    selected: true,
    features: [
        'הקמת לוח אירועים דינמי וברור עם ניווט חודשי.',
        'אינטגרציה ל"תיקצ\'ק" לאירועים בתשלום.',
        'מערכת הרשמה פנימית לאירועים בחינם (כולל ניהול מלאי).',
        'מערך הרשמה ל"מזוודת הבריחה" עם בחירת תאריך, שעה ומספר משתתפים.'
    ]
  },
];

export const PROPOSAL_STEPS: ProposalStep[] = [
    {
        step: "שלב א'",
        title: "אפיון, עיצוב והכנה",
        description: "פגישות אפיון ומעבר על האתר הקיים. יצירת סקיצות לאתר והקמת Google Drive ייעודי להעלאת חומרים."
    },
    {
        step: "שלב ב'",
        title: "פיתוח",
        description: "בניית האתר בסביבת פיתוח ייעודית (Staging) לפי העיצוב שאושר. מעקב אחר ההתקדמות בקישור ייעודי."
    },
    {
        step: "שלב ג'",
        title: "הדרכה",
        description: "הדרכה מסודרת על מערכת הניהול, התבניות שהוקמו וכיצד לתפעל את האתר באופן שוטף."
    },
    {
        step: "שלב ד'",
        title: "QA ובדיקות",
        description: "בדיקות מקיפות לכלל הפונקציות, התאמה למובייל ולדפדפנים שונים, ותיקון באגים אחרונים."
    },
    {
        step: "שלב ה'",
        title: "עלייה לאוויר",
        description: "העברה לדומיין הרשמי, ביצוע הפניות 301 לשמירה על SEO והעברת האתר לאחריות הלקוח."
    }
];

export const INITIAL_TASKS: Task[] = [
  { id: '101', title: 'איסוף חומרים לדרייב', description: 'העלאת טקסטים ותמונות ע"י הלקוח', assigneeId: '5', status: TaskStatus.IN_PROGRESS, dueDate: '2025-12-01' },
  { id: '102', title: 'עיצוב סקיצה ראשונית', description: 'עמוד הבית + עמוד פנימי', assigneeId: '2', status: TaskStatus.TODO, dueDate: '2025-12-05' },
  { id: '103', title: 'הקמת סביבת פיתוח', description: 'התקנת וורדפרס ואלמנטור בשרת זמני', assigneeId: '3', status: TaskStatus.TODO, dueDate: '2025-12-10' },
];

export const INITIAL_NOTES: MeetingNote[] = [
    {
      id: '1',
      date: '2025-11-24',
      title: 'פגישת התנעה - מוזיאון העמק',
      content: 'סוכם על לוח זמנים.\n- אלירן ישלח חוזה\n- הלקוח יעביר חומרים עד סוף שבוע\n- רפאל יכין סקיצה',
      actionItems: [
        { text: 'אלירן ישלח חוזה', isDone: true },
        { text: 'הלקוח יעביר חומרים עד סוף שבוע', isDone: false },
        { text: 'רפאל יכין סקיצה', isDone: false }
      ]
    }
];
