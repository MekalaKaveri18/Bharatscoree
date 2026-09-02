import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Activity, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = "http://localhost:8000/api/v1/lenders/admin/overview";

interface AdminStats {
  total_users: number;
  total_borrowers: number;
  scored_borrowers: number;
  average_score: number;
  high_risk_borrowers: number;
  active_loans: number;
}

const COLORS = ["#34d399", "#f87171"];

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Loading real admin metrics...
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-muted-foreground">No data available</p>;
  }

  const riskData = [
    { name: "Low Risk", value: stats.scored_borrowers - stats.high_risk_borrowers },
    { name: "High Risk", value: stats.high_risk_borrowers },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.total_users}</h3>
          <p className="text-muted-foreground text-sm">Total Users</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.total_borrowers}</h3>
          <p className="text-muted-foreground text-sm">Total Borrowers</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.average_score || "—"}</h3>
          <p className="text-muted-foreground text-sm">Average BharatScore</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.active_loans}</h3>
          <p className="text-muted-foreground text-sm">Active Loans</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Risk Split</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {riskData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Platform Summary</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li>Total Borrowers: <strong>{stats.total_borrowers}</strong></li>
            <li>Scored Borrowers: <strong>{stats.scored_borrowers}</strong></li>
            <li>High Risk Borrowers: <strong>{stats.high_risk_borrowers}</strong></li>
            <li>Active Loans: <strong>{stats.active_loans}</strong></li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
