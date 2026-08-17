import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";

const LandingLayout = ({ children }) => {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
