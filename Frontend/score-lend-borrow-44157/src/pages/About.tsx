import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Database, Brain, Shield, TrendingUp, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">
              About <span className="bg-gradient-hero bg-clip-text text-transparent">BharatScore</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing credit scoring in India through AI, alternative data, and financial inclusion
            </p>
          </div>

          {/* What is BharatScore */}
          <section className="mb-16">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6">What is BharatScore?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                BharatScore is a data-driven credit evaluation platform developed to overcome the shortcomings of
                conventional credit scoring models in India. Unlike traditional systems that rely solely on formal
                credit history, we integrate structured and alternative financial behavior indicators to provide a
                comprehensive credit assessment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our platform analyzes UPI transaction frequency, electricity and mobile bill payments, rental trends,
                and other digital financial behaviors to assess repayment capacity—especially for individuals without
                formal credit records. This approach enables millions of Indians to access credit opportunities
                previously unavailable to them.
              </p>
            </Card>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">How BharatScore Works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Database className="text-primary-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Data Collection</h3>
                <p className="text-muted-foreground text-sm">
                  We securely collect alternative data including UPI transactions, utility bill payments, mobile
                  recharges, rent payments, and digital spending patterns alongside traditional financial records.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  <Brain className="text-secondary-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Our machine learning models (XGBoost) analyze your financial behavior to calculate
                  an inclusive credit score, risk category, and default probability with high accuracy.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-accent-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Explainable AI</h3>
                <p className="text-muted-foreground text-sm">
                  We use Explainable AI (XAI) techniques to provide transparency. You'll understand exactly which
                  factors influenced your score and get actionable advice to improve it.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-primary-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Scoring</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant credit scores that update in real-time as your financial behavior improves. Track your
                  progress and see the impact of good financial habits.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-secondary-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Dual Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Borrowers get insights and score tracking. Lenders get risk assessment tools and borrower
                  evaluation features. Everyone benefits from transparency.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <Award className="text-accent-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Fair & Inclusive</h3>
                <p className="text-muted-foreground text-sm">
                  Our system is designed to be fair and inclusive, ensuring that everyone-regardless of their
                  traditional credit history-has access to financial opportunities.
                </p>
              </Card>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-16">
            <Card className="p-8 bg-gradient-hero text-white">
              <h2 className="text-3xl font-bold mb-6">Powered by Advanced Technology</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-3">Machine Learning Models</h3>
                  <ul className="space-y-2 text-white/90">
            
                    <li>• XGBoost for gradient boosting</li>
                  
                    <li>• SHAP values for explainability</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Data Processing</h3>
                  <ul className="space-y-2 text-white/90">
                
                    <li>• Real-time processing pipelines</li>
                    <li>• Alternative data integration</li>
                   
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Mission */}
          <section>
            <Card className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                To empower financial inclusion across India by providing fair, transparent, and accessible credit
                scoring for everyone-especially those traditionally excluded from the formal credit system. We believe
                that consistent digital financial behavior should be recognized and rewarded, enabling millions to
                access the credit they deserve.
              </p>
            </Card>
          </section>
        </div>
      </main>

      
    </div>
  );
};

export default About;
