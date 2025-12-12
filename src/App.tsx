import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { HowItWorks } from "./components/HowItWorks";
import { About } from "./components/About";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { SignupEnhanced } from "./components/auth/SignupEnhanced";
import { LoginEnhanced } from "./components/auth/LoginEnhanced";
import { OTPVerification } from "./components/auth/OTPVerification";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardHomeEnhanced } from "./components/pages/DashboardHomeEnhanced";
import { GoalsPage } from "./components/pages/GoalsPage";
import { GroupsPage } from "./components/pages/GroupsPage";
import { RequestsPage } from "./components/pages/RequestsPage";
import { AIAssistantPage } from "./components/pages/AIAssistantPage";
import { BotIntegrationPage } from "./components/pages/BotIntegrationPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { SettingsPage } from "./components/pages/SettingsPage";

type View = "landing" | "signup" | "login" | "otp" | "dashboard";
type DashboardPage = "Dashboard" | "Goals" | "Groups" | "Requests" | "AI Assistant" | "Bot Integration" | "Analytics" | "Settings";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: "easeInOut"
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [currentDashboardPage, setCurrentDashboardPage] = useState<DashboardPage>("Dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const session = localStorage.getItem("snappx_session");
    const userData = localStorage.getItem("snappx_user");
    
    if (session && userData) {
      setIsLoggedIn(true);
      setCurrentView("dashboard");
    }
  }, []);

  const handleNavigate = (view: string) => {
    if (view === "landing" || view === "signup" || view === "login" || view === "otp" || view === "dashboard") {
      setCurrentView(view as View);
    }
  };

  const handleSignupComplete = () => {
    // Get phone number from pending user data
    const pendingUser = localStorage.getItem("pendingUser");
    if (pendingUser) {
      const userData = JSON.parse(pendingUser);
      setUserPhoneNumber(userData.phoneNumber || "");
    }
    setCurrentView("otp");
  };

  const handleOTPComplete = () => {
    // Create session token
    const sessionToken = "session_" + Date.now() + "_" + Math.random().toString(36);
    localStorage.setItem("snappx_session", sessionToken);
    
    // Set user data
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      localStorage.setItem("snappx_user", currentUser);
    }
    
    setIsLoggedIn(true);
    setCurrentView("dashboard");
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("snappx_session");
    localStorage.removeItem("snappx_user");
    setIsLoggedIn(false);
    setCurrentView("landing");
  };

  const handleDashboardNavigate = (page: string) => {
    setCurrentDashboardPage(page as DashboardPage);
  };

  const renderDashboardContent = () => {
    const content = (() => {
      switch (currentDashboardPage) {
        case "Dashboard":
          return <DashboardHomeEnhanced onNavigate={handleDashboardNavigate} />;
        case "Goals":
          return <GoalsPage />;
        case "Groups":
          return <GroupsPage />;
        case "Requests":
          return <RequestsPage />;
        case "AI Assistant":
          return <AIAssistantPage />;
        case "Bot Integration":
          return <BotIntegrationPage />;
        case "Analytics":
          return <AnalyticsPage />;
        case "Settings":
          return <SettingsPage />;
        default:
          return <DashboardHomeEnhanced onNavigate={handleDashboardNavigate} />;
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDashboardPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (currentView === "signup") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="signup"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-4xl">
            <button
              onClick={() => handleNavigate("landing")}
              className="mb-4 text-cyan-600 hover:text-cyan-700 flex items-center gap-2"
            >
              ← Back to home
            </button>
            <SignupEnhanced onComplete={handleSignupComplete} />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentView === "login") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md">
            <button
              onClick={() => handleNavigate("landing")}
              className="mb-4 text-cyan-600 hover:text-cyan-700 flex items-center gap-2"
            >
              ← Back to home
            </button>
            <LoginEnhanced onSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentView === "otp") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="otp"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md">
            <OTPVerification 
              phoneNumber={userPhoneNumber} 
              onComplete={handleOTPComplete} 
            />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentView === "dashboard" && isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen bg-gray-50 flex flex-col"
        >
          <DashboardHeader onLogout={handleLogout} />
          <DashboardLayout currentPage={currentDashboardPage} onNavigate={handleDashboardNavigate}>
            {renderDashboardContent()}
          </DashboardLayout>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Landing page
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="landing"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen flex flex-col"
      >
        <Header onNavigate={handleNavigate} />
        <Hero onNavigate={handleNavigate} />
        <Services />
        <HowItWorks />
        <About />
        <Testimonials />
        <CTA onNavigate={handleNavigate} />
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}