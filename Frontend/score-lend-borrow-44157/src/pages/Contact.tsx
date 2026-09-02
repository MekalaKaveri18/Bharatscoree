import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulated form submission
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Mail className="text-primary-foreground" size={24} />
                </div>
                <h3 className="font-bold mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm">support@bharatscore.in</p>
                <p className="text-muted-foreground text-sm">hello@bharatscore.in</p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  <Phone className="text-secondary-foreground" size={24} />
                </div>
                <h3 className="font-bold mb-2">Call Us</h3>
                <p className="text-muted-foreground text-sm">+91 1800-123-4567</p>
                <p className="text-muted-foreground text-sm">Mon-Fri, 9AM-6PM IST</p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="text-accent-foreground" size={24} />
                </div>
                <h3 className="font-bold mb-2">Visit Us</h3>
                <p className="text-muted-foreground text-sm">
                  G. Narayanamma Institute of Technology and Sciences
                </p>
                <p className="text-muted-foreground text-sm">Hyderabad, India</p>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2 p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary">
                  <Send className="mr-2" size={18} />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-2">How is BharatScore different from CIBIL?</h3>
                <p className="text-muted-foreground text-sm">
                  BharatScore uses alternative data sources like UPI transactions, utility bills, and rent payments
                  to assess creditworthiness, making it accessible to those without traditional credit history.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">Is my data secure?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! We use bank-grade encryption and follow strict data protection regulations. Your data is never
                  shared without your explicit consent.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">How quickly can I get my score?</h3>
                <p className="text-muted-foreground text-sm">
                  Once you complete your profile and upload necessary documents, your BharatScore is generated
                  instantly using our AI-powered system.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">Can lenders trust BharatScore?</h3>
                <p className="text-muted-foreground text-sm">
                  Absolutely! Our ML models achieve 95% accuracy and are built on proven algorithms used by major
                  financial institutions worldwide.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Contact;
