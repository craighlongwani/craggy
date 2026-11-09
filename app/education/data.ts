// Education: the two schools, and the coursework that's actually relevant to
// a full-stack/database career (general education, PE, NSTP and electives
// outside that line are left out), simplified to short tags under the school
// that taught them. Where a course produced a project on the site, it links
// there.

export type Course = {
  name: string;
  // The slug of the project on this site that came out of the course
  project?: string;
};

export type School = {
  name: string;
  degree: string;
  // A short line under the degree: GPA, track, etc.
  detail?: string;
  honors?: string[];
  // Left out entirely rather than guessed, when the source doesn't give one
  period?: string;
  where: string;
  courses?: Course[];
};

export const schools: School[] = [
  {
    name: "De La Salle – College of Saint Benilde",
    degree: "BS Information Systems",
    detail: "GPA 3.22",
    honors: ["Second Honors Dean's Lister (A.Y. 2024–2025)"],
    period: "Sept 2024 – Expected Dec 2027",
    where: "Taft, Manila",
    courses: [
      { name: "Introduction to Computing" },
      { name: "Computer Programming 1 & 2" },
      { name: "Fundamentals of Information Systems" },
      { name: "Data Structures & Algorithms" },
      { name: "Enterprise Development", project: "inventory" },
      { name: "IT Infrastructure & Networks" },
      { name: "Application Development 1 & 2" },
      { name: "Systems Analysis & Design" },
      { name: "Web Development" },
      { name: "Enterprise Architecture" },
      { name: "Information Management" },
      { name: "UI/UX Design" },
      { name: "Database Management", project: "revora" },
      { name: "IS Project Management" },
      { name: "Mobile Development" },
      { name: "IS Strategy & Acquisition" },
      { name: "Applied Research" },
    ],
  },
  {
    name: "International Philippine School in Jeddah",
    degree: "High School Diploma · STEM",
    honors: ["With High Honors"],
    where: "Jeddah, Saudi Arabia",
  },
];
