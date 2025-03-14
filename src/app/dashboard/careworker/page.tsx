"use client";

import { useEffect, useState } from "react";
import { Table, Button, message, Card, Typography, Spin, Input } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function CareWorkerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
    } else {
      fetchShifts();
    }
  }, [session, status, router]);

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/shifts");
      if (!res.ok) throw new Error("Failed to fetch shifts");
      const data = await res.json();
      setShifts(data);
    } catch (error) {
      message.error("Failed to fetch shifts.");
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: session?.user?.name,
          locationIn: "Hospital A",
          note,
        }),
      });

      if (!res.ok) throw new Error("Clock-in failed");

      setClockedIn(true);
      message.success("Successfully clocked in!");
      setNote("");
      fetchShifts();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          locationOut: "Hospital B",
          note,
        }),
      });

      if (!res.ok) throw new Error("Clock-out failed");

      setClockedIn(false);
      message.success("Successfully clocked out!");
      setNote("");
      fetchShifts();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Clock In Time",
      dataIndex: "clockInTime",
      key: "clockInTime",
      render: (time: Date) => new Date(time).toLocaleString(),
    },
    {
      title: "Clock Out Time",
      dataIndex: "clockOutTime",
      key: "clockOutTime",
      render: (time: Date) =>
        time ? new Date(time).toLocaleString() : "Still Clocked In",
    },
    {
      title: "Location In",
      dataIndex: "locationIn",
      key: "locationIn",
    },
    {
      title: "Location Out",
      dataIndex: "locationOut",
      key: "locationOut",
      render: (location: String) => (location ? location : "Still Clocked In"),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (text: string) => (text ? text : ""),
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card style={{ maxWidth: 700, margin: "auto", marginTop: 20, padding: 20 }}>
      <Title level={3}>Care Worker Shift Tracker</Title>
      <p>
        Status:{" "}
        {clockedIn ? (
          <span style={{ color: "green" }}>
            <CheckCircleOutlined /> Clocked In
          </span>
        ) : (
          <span style={{ color: "red" }}>
            <CloseCircleOutlined /> Not Clocked In
          </span>
        )}
      </p>

      {/* Note Input Field */}
      <Input
        placeholder="Optional note for this shift..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <Button
        type="primary"
        onClick={handleClockIn}
        disabled={clockedIn}
        loading={loading}
        style={{ marginRight: 10 }}
      >
        Clock In
      </Button>
      <Button
        type="default"
        danger
        onClick={handleClockOut}
        disabled={!clockedIn}
        loading={loading}
      >
        Clock Out
      </Button>

      <Title level={4} style={{ marginTop: 20 }}>
        Shift History
      </Title>
      <Table
        dataSource={shifts}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}
