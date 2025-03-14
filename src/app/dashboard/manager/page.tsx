"use client";

import { useState, useEffect } from "react";
import { Card, Table, Typography, InputNumber, Button, message } from "antd";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import turf from "@turf/turf";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const { Title } = Typography;

export default function ManagerDashboard() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [radius, setRadius] = useState(2); // Default 2 km
  const [clockedInStaff, setClockedInStaff] = useState([]);
  const [staffHistory, setStaffHistory] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchClockedInStaff();
    fetchStaffHistory();
    fetchAnalytics();
  }, []);

  const fetchClockedInStaff = async () => {
    try {
      const res = await fetch("/api/clocked-in-staff");
      const data = await res.json();
      setClockedInStaff(data);
    } catch (error) {
      message.error("Failed to fetch clocked-in staff");
    }
  };

  const fetchStaffHistory = async () => {
    try {
      const res = await fetch("/api/staff-history");
      const data = await res.json();
      console.log(data);
      setStaffHistory(data);
    } catch (error) {
      message.error("Failed to fetch shift history");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      message.error("Failed to fetch analytics");
    }
  };

  const handleSetLocation = () => {
    message.success(`Location perimeter set at ${radius} km.`);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Clock In Time", dataIndex: "clockInTime", key: "clockInTime" },
    { title: "Location", dataIndex: "location", key: "location" },
  ];

  const historyColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Clock In", dataIndex: "clockInTime", key: "clockInTime" },
    { title: "Clock Out", dataIndex: "clockOutTime", key: "clockOutTime" },
    { title: "Hours Worked", dataIndex: "hoursWorked", key: "hoursWorked" },
  ];

  const chartData = {
    labels: analytics?.dates || [],
    datasets: [
      {
        label: "Avg Hours Per Day",
        data: analytics?.avgHours || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div>
      <Card style={{ marginBottom: 20 }}>
        <Title level={3}>Set Clock-In Location Perimeter</Title>
        <InputNumber
          value={radius}
          onChange={setRadius}
          min={0.5}
          max={10}
          step={0.5}
        />{" "}
        km
        <Button
          type="primary"
          onClick={handleSetLocation}
          style={{ marginLeft: 10 }}
        >
          Set
        </Button>
      </Card>

      <Card>
        <Title level={3}>Currently Clocked-In Staff</Title>
        <Table dataSource={clockedInStaff} columns={columns} rowKey="id" />
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Title level={3}>Shift History</Title>
        <Table dataSource={staffHistory} columns={historyColumns} rowKey="id" />
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Title level={3}>Analytics</Title>
        <Bar data={chartData} />
      </Card>
    </div>
  );
}
