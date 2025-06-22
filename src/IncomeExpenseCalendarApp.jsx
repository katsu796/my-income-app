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

const CATEGORY_COLORS = ["#FF6384", "#FFCE56", "#36A2EB", "#4BC0C0", "#9966FF", "#FF9F40"];
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

  const getMonthSummary = () => {
    const list = getMonthEntries();
    const summary = list.reduce(
      (acc, { income, expense }) => {
        acc.income += income;
        acc.expense += expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );
    summary.balance = summary.income - summary.expense;
    return summary;
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
      style={{ padding: "10px", maxWidth: "480px", margin: "0 auto", fontSize: "15px", lineHeight: "1.6", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#fafafa" }}>

      <motion.h2 layoutId="title" style={{ fontSize: "1.5rem", textAlign: "center", margin: "20px 0", color: "#333" }}>💼 バイト収支</motion.h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <button onClick={handlePrevMonth}>←</button>
        <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{selectedDate.toISOString().slice(0, 7)}</span>
        <button onClick={handleNextMonth}>→</button>
      </div>

      <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "12px", color: "#444" }}>📝 入力</h3>
        <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="収入（円）" style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="支出（円）" style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
          <option value="">カテゴリを選択</option>
          <option value="食費">🍚 食費</option>
          <option value="交通費">🚃 交通費</option>
          <option value="娯楽">🎮 娯楽</option>
          <option value="日用品">🧻 日用品</option>
          <option value="医療">💊 医療</option>
          <option value="その他">📦 その他</option>
        </select>
        <input type="file" onChange={(e) => setReceipt(e.target.files[0])} accept="image/*" style={{ marginBottom: "10px" }} />
        <button onClick={handleAddEntry} style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "#4CAF50", color: "white", border: "none", fontWeight: "bold" }}>＋追加</button>
      </motion.div>

      <div style={{ marginTop: "25px" }}>
        <h3 style={{ marginBottom: "10px" }}>📅 {selectedDate.toLocaleDateString()}</h3>
        <AnimatePresence>
          {getDateDetails().map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: entry.receiptUrl ? "pointer" : "default",
                fontSize: "0.95rem"
              }}
              onClick={() => {
                if (entry.receiptUrl) {
                  const img = new Image();
                  img.src = entry.receiptUrl;
                  const w = window.open("");
                  w.document.write(img.outerHTML);
                }
              }}
            >
              <span style={{ flex: 2 }}>{entry.category || DEFAULT_CATEGORY}</span>
              <span style={{ flex: 1, color: "green" }}>+¥{entry.income}</span>
              <span style={{ flex: 1, color: "red" }}>-¥{entry.expense}</span>
              {entry.receiptUrl && <span style={{ flex: 0.5, fontSize: "0.8em" }}>🧾</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📊 月別棒グラフ</h3>
        <div style={{ width: "100%", height: "250px", overflowX: "auto" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthEntries()}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="income" fill="green" name="収入" />
              <Bar dataKey="expense" fill="red" name="支出" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📈 支出カテゴリ円グラフ</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={getPieChartData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {getPieChartData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
