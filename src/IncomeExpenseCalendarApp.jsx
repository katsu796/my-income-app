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
import { motion } from "framer-motion";

const CATEGORY_LIST = [
  { name: "食費", color: "#FF6384" },
  { name: "交通", color: "#FFCE56" },
  { name: "日用品", color: "#36A2EB" },
  { name: "交際費", color: "#4BC0C0" },
  { name: "趣味", color: "#9966FF" },
  { name: "医療", color: "#FF9F40" },
  { name: "給与", color: "#8BC34A" },
  { name: "その他", color: "#A9A9A9" },
];

const DEFAULT_CATEGORY = "未分類";

export default function 家計簿() {
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

  const handleDeleteEntry = (indexToDelete) => {
    setEntries((prev) => prev.filter((_, i) => i !== indexToDelete));
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

  const getCategoryColor = (categoryName) => {
    const found = CATEGORY_LIST.find((cat) => cat.name === categoryName);
    return found ? found.color : "#ccc";
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
      <h2 style={{ textAlign: "center" }}>バイト収支カレンダー</h2>

      <div style={{ marginTop: "20px" }}>
        <h3>📅 カレンダー</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={handlePrevMonth}>← 前の月</button>
          <button onClick={handleNextMonth}>次の月 →</button>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📝 入力フォーム</h3>
        <input
          type="number"
          placeholder="収入"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <input
          type="number"
          placeholder="支出"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            display: "block",
            marginTop: "8px",
            padding: "5px",
            fontSize: "14px",
            borderRadius: "4px",
            borderColor: "#ccc",
          }}
        >
          <option value="">カテゴリを選択</option>
          {CATEGORY_LIST.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setReceipt(e.target.files[0])}
        />
        <button onClick={handleAddEntry} style={{ marginTop: "10px" }}>追加</button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📋 日別詳細</h3>
        {getDateDetails().map((entry, i) => (
          <div key={i} style={{
            backgroundColor: "#f9f9f9",
            margin: "6px 0",
            padding: "8px",
            borderRadius: "6px",
            fontSize: "13px",
            borderLeft: `5px solid ${getCategoryColor(entry.category)}`
          }}>
            <div>📅 {entry.date}</div>
            <div>📂 カテゴリ: {entry.category}</div>
            <div>💰 収入: ¥{entry.income} / 支出: ¥{entry.expense}</div>
            {entry.receiptUrl && (
              <div>
                🧾 レシート:<br />
                <img src={entry.receiptUrl} alt="receipt" style={{ width: "100%", maxHeight: "120px", objectFit: "contain" }} />
              </div>
            )}
            <button onClick={() => handleDeleteEntry(entries.indexOf(entry))} style={{ marginTop: "5px", backgroundColor: "#e57373", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }}>
              削除
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>📊 月別棒グラフ</h3>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthEntries()} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="income" fill="green" name="収入" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="red" name="支出" radius={[8, 8, 0, 0]} />
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
              >
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
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
