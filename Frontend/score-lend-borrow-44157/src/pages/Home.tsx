import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Users, TrendingUp, CheckCircle, Zap, Award } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full text-secondary font-medium text-sm">
                AI-Powered Credit Scoring
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Financial Inclusion for{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">Every Indian</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                BharatScore uses AI and alternative data to create fair credit scores for millions without
                traditional credit history. Join the financial revolution.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bg-gradient-primary">
                  <Link to="/signup">Get Your Score</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop"
                alt="Financial inclusion"
                className="relative rounded-2xl shadow-xl animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose BharatScore?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing credit scoring in India with cutting-edge technology and inclusive approach
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary-foreground" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Alternative Data</h3>
              <p className="text-muted-foreground">
                We use UPI transactions, utility bills, and rent payments to assess creditworthiness fairly
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-secondary-foreground" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Results</h3>
              <p className="text-muted-foreground">
                Get your credit score in real-time with AI-powered analysis and transparent explanations
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="text-accent-foreground" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Financial Inclusion</h3>
              <p className="text-muted-foreground">
                Empowering millions without traditional credit history to access loans and financial services
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How BharatScore Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and powered by advanced AI
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Sign Up",
                description: "Create your account as a borrower or lender in minutes",
              },
              {
                icon: TrendingUp,
                title: "Upload Data",
                description: "Securely upload utility bills, UPI history, and payment records",
              },
              {
                icon: Award,
                title: "Get Your Score",
                description: "Our AI analyzes your data and generates your BharatScore instantly",
              },
              {
                icon: Shield,
                title: "Access Credit",
                description: "Use your score to apply for loans with verified lenders",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="text-primary-foreground" size={28} />
                </div>
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Your BharatScore?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of Indians building their financial future with fair and transparent credit scoring
          </p>
          <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
