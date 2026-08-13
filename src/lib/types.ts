export type ExamBody = "WAEC" | "JAMB" | "NECO";

/**
 * 'owner' is you — the founder. There is meant to be exactly one, and only an
 * owner can hand out or take back admin rights. 'admin' covers everyone
 * helping run the platform: they can act on students, but cannot touch the
 * owner or change anybody's role.
 */
export type Role = "student" | "admin" | "owner";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  password_hash: string;
  school: string | null;
  class_level: string | null;
  state: string | null;
  avatar_hue: number;
  plan: "free" | "premium";
  plan_expires_at: string | null;
  locked_until: string | null;
  lock_reason: string | null;
  role: Role;
  created_at: string;
};

/** A user as it is safe to send to the browser. */
export type PublicUser = {
  id: number;
  name: string;
  username: string;
  school: string | null;
  class_level: string | null;
  avatar_hue: number;
};

export type Question = {
  id: number;
  exam_body: ExamBody;
  subject: string;
  year: number;
  number: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  topic: string | null;
  is_premium: number;
};

/** A question with the answer stripped out — what the quiz page receives. */
export type QuizQuestion = Omit<Question, "answer" | "explanation" | "is_premium">;

export type Attempt = {
  id: number;
  user_id: number;
  exam_body: string;
  subject: string;
  year: number;
  total: number;
  score: number;
  seconds_spent: number;
  mode: "paper" | "speed";
  finished_at: string;
};

export type Group = {
  id: number;
  name: string;
  description: string | null;
  exam_body: string | null;
  subject: string | null;
  invite_code: string;
  owner_id: number;
  is_private: number;
  created_at: string;
};

export type GroupWithMeta = Group & {
  member_count: number;
  is_member: number;
  owner_name: string;
};

export type Message = {
  id: number;
  group_id: number;
  user_id: number;
  body: string;
  created_at: string;
  author_name: string;
  author_username: string;
  avatar_hue: number;
};

export type Friendship = {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: "pending" | "accepted";
  created_at: string;
};

export const EXAM_BODIES: {
  id: ExamBody;
  name: string;
  full: string;
  blurb: string;
}[] = [
  {
    id: "WAEC",
    name: "WAEC",
    full: "West African Examinations Council",
    blurb: "SSCE past questions with worked answers, 2015 – 2024.",
  },
  {
    id: "JAMB",
    name: "JAMB",
    full: "Joint Admissions and Matriculation Board",
    blurb: "UTME CBT practice under real exam timing.",
  },
  {
    id: "NECO",
    name: "NECO",
    full: "National Examinations Council",
    blurb: "SSCE internal and external past papers.",
  },
];

export const CLASS_LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3", "Graduate"];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];
