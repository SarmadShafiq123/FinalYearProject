import LandingLayout from "../../components/landing/LandingLayout";

const About = () => {
 const teamMembers = [
  { name: "Azan Saeed", role: "Full Stack Developer" },
  { name: "Sarmad Shafiq", role: "Full Stack Engineer + AI Integrated Solutions" },
  { name: "Awab Haider", role: "Quality Assurance Engineer" },
];


  const techStack = [
    "React.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Cloudinary",
    "Tailwind CSS",
    "AES-256",
    "JWT",
    "Google OAuth",
    "Nodemailer",
  ];

  return (
    <LandingLayout>
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
          ABOUT US
        </div>
        <h1 className="text-3xl font-bold text-white mt-3">
          Built for privacy, not profit.
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-4 leading-relaxed">
          CloudStore was built as a final year project at University of Central Punjab by a team of three students passionate about privacy and security.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-base font-semibold text-white mb-3">Our Mission</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We believe privacy is a right, not a feature. Most cloud storage platforms store your files on centralized servers where service providers technically have access to your data. CloudStore changes that — every file is encrypted with your unique key before it ever leaves your device.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest text-center mb-8">
          THE TEAM
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                {member.name.charAt(0)}
              </div>
              <h4 className="text-sm font-semibold text-white">{member.name}</h4>
              <p className="text-xs text-zinc-500 mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest text-center mb-6">
          Built With
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </LandingLayout>
  );
};

export default About;
