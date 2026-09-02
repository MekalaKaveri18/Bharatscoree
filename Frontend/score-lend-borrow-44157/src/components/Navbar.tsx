// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { Menu, X } from "lucide-react";

// interface NavbarProps {
//   isAuthenticated?: boolean;
//   userRole?: "borrower" | "lender" | "admin";
//   onLogout?: () => void;
// }

// const Navbar = ({ isAuthenticated, userRole, onLogout }: NavbarProps) => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     if (onLogout) {
//       onLogout();
//     }
//     navigate("/");
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/" className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
//               <span className="text-primary-foreground font-bold text-lg">B</span>
//             </div>
//             <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
//               BharatScore
//             </span>
//           </Link>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="text-foreground hover:text-primary transition-colors">
//               Home
//             </Link>
//             <Link to="/about" className="text-foreground hover:text-primary transition-colors">
//               About
//             </Link>
//             {isAuthenticated && (
//               <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
//                 Dashboard
//               </Link>
//             )}
//             <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
//               Contact
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center space-x-4">
//             {!isAuthenticated ? (
//               <>
//                 <Button variant="ghost" asChild>
//                   <Link to="/login">Login</Link>
//                 </Button>
//                 <Button asChild className="bg-gradient-primary">
//                   <Link to="/signup">Get Started</Link>
//                 </Button>
//               </>
//             ) : (
//               <Button onClick={handleLogout} variant="outline">
//                 Logout
//               </Button>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden text-foreground"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="md:hidden py-4 space-y-4 animate-fade-in">
//             <Link
//               to="/"
//               className="block text-foreground hover:text-primary transition-colors"
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link
//               to="/about"
//               className="block text-foreground hover:text-primary transition-colors"
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               About
//             </Link>
//             {isAuthenticated && (
//               <Link
//                 to="/dashboard"
//                 className="block text-foreground hover:text-primary transition-colors"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Dashboard
//               </Link>
//             )}
//             <Link
//               to="/contact"
//               className="block text-foreground hover:text-primary transition-colors"
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Contact
//             </Link>
//             {!isAuthenticated ? (
//               <div className="space-y-2">
//                 <Button variant="ghost" asChild className="w-full">
//                   <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
//                     Login
//                   </Link>
//                 </Button>
//                 <Button asChild className="w-full bg-gradient-primary">
//                   <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
//                     Get Started
//                   </Link>
//                 </Button>
//               </div>
//             ) : (
//               <Button onClick={handleLogout} variant="outline" className="w-full">
//                 Logout
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
//phase-2
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: "borrower" | "lender" | "admin";
  onLogout?: () => void;
}

const Navbar = ({ isAuthenticated, userRole, onLogout }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    /* 🔒 Disable pointer events at nav layer */
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* 🔓 Re-enable pointer events ONLY for visible navbar */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border pointer-events-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BharatScore
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-primary">Home</Link>
              <Link to="/about" className="hover:text-primary">About</Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
              )}
              <Link to="/contact" className="hover:text-primary">Contact</Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-primary">
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
              {isAuthenticated && (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>

              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-gradient-primary">
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button onClick={handleLogout} className="w-full">
                  Logout
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
