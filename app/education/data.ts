// Education and course modules, taken from the résumé and current EDUVOS
// academic plan.
export type CourseGroup = {
  name: string;
  courses: string[];
};

export type School = {
  name: string;
  degree: string;
  period: string;
  where: string;
  courseGroups: CourseGroup[];
  optionalCertifications: string[];
};

export const schools: School[] = [
  {
    name: "EDUVOS",
    degree: "Bachelor of Science in Computer Science",
    period: "2025 - Present",
    where: "South Africa",
    courseGroups: [
      {
        name: "Programming & Software",
        courses: [
          "Introduction to Programming using C++",
          "Object-Oriented Programming using C++",
          "Object-Oriented Programming in C#",
          "Data Structures and Algorithms in C# (elective)",
          "Generic Algorithm Design",
          "Software Design",
          "Web Development and e-Commerce",
          "Object Oriented and Distributed Programming in Java",
        ],
      },
      {
        name: "Networks & Systems",
        courses: [
          "Computer Network and Security",
          "Computer Network Technologies",
          "Advanced Networking",
          "Network Security",
          "Linux-based Operating Systems",
          "Operating Systems",
          "Cloud Based Technologies",
          "Computer Architecture Essentials",
          "Digital Electronics and Microcontrollers",
        ],
      },
      {
        name: "Data, AI & Mathematics",
        courses: [
          "Database Systems",
          "Artificial Intelligence Techniques",
          "AI Ethics and Privacy",
          "Maths for Computing",
          "Mathematics 1A",
          "Mathematics 1B",
        ],
      },
      {
        name: "Professional Practice",
        courses: [
          "Non-Technical Skills for IT Professionals",
          "Computer Skills (Microsoft)",
          "IT Project Management",
          "Object Oriented Systems Analysis and Design",
          "Social Practices and Security",
          "4IR Technologies",
          "Project",
          "Business Management and Entrepreneurship",
        ],
      },
    ],
    optionalCertifications: [
      "A+ certification voucher",
      "Network+ certification voucher",
    ],
  },
];
