import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_COLORS_MAP = {
  食費: "#FF6384",
  交通費: "#FFCE56",
  娯楽: "#36A2EB",
  光熱費: "#4BC0C0",
  通信費: "#9966FF",
  その他: "#FF9F40",
  未分類: "#8884d8",
};
const CATEGORY_COLORS = Object.values(CATEGORY_COLORS_MAP);
const DEFAULT_CATEGORY = "未分類";

export default function IncomeExpenseCalendarApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [category, setCategory] = useState("");
  const [receipt, setReceipt] = useState(null);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem("income-expense-data");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("income-expense-data", JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = () => {
    if (!income && !expense) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    const newEntry = {
      date: dateStr,
      income: Number(income),
      expense: Number(expense),
      category: category || DEFAULT_CATEGORY,
      receiptUrl: receipt ? URL.createObjectURL(receipt) : null,
    };
    setEntries([...entries, newEntry]);
    setIncome("");
    setExpense("");
    setCategory("");
    setReceipt(null);
  };

  const getMonthEntries = () => {
    const month = selectedDate.toISOString().slice(0, 7);
    return entries.filter((e) => e.date.startsWith(month));
  };

  const getPieChartData = () => {
    const dataMap = {};
    getMonthEntries().forEach(({ expense, category }) => {
      if (!expense) return;
      const key = category || DEFAULT_CATEGORY;
      if (!dataMap[key]) dataMap[key] = 0;
      dataMap[key] += expense;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  };

  const getDateDetails = () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return entries.filter((e) => e.date === dateStr);
  };

  const getDateSummary = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayEntries = entries.filter((e) => e.date === dateStr);
    const incomeSum = dayEntries.reduce((acc, e) => acc + e.income, 0);
    const expenseSum = dayEntries.reduce((acc, e) => acc + e.expense, 0);
    return { income: incomeSum, expense: expenseSum };
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const { income, expense } = getDateSummary(date);
    return (
      <div style={{ fontSize: "0.65rem", textAlign: "center" }}>
        {income > 0 && <div style={{ color: "green" }}>+¥{income}</div>}
        {expense > 0 && <div style={{ color: "red" }}>-¥{expense}</div>}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: "10px",
        maxWidth: "100%",
        width: "min(100%, 480px)",
        margin: "0 auto",
        fontSize: "15px",
        lineHeight: "1.6",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#fefefe",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div style={{ marginTop: "30px" }}>
        <h3>📊 月別棒グラフ</h3>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getMonthEntries()}
              margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
              barCategoryGap={8}
            >
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="income" fill="green" name="収入" radius={[8, 8, 0, 0]} isAnimationActive={true} />
              <Bar dataKey="expense" fill="red" name="支出" radius={[8, 8, 0, 0]} isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📈 支出カテゴリ円グラフ</h3>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getPieChartData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
                isAnimationActive={true}
              >
                {getPieChartData().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS_MAP[entry.name] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
