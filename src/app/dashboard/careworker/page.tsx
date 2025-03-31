"use client";

import { useEffect, useState } from "react";
import { Table, Button, message, Card, Typography, Spin, Input } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";

const { Title } = Typography;
const GET_CAREWORKER_SHIFTS = gql`
  query GetShifts {
    shiftsByCareWorkerName {
      id
      clockInTime
      clockOutTime
      locationIn
      locationOut
      note
    }
  }
`;
const CLOCK_IN = gql`
  mutation ClockIn($userId: String!, $lat: Float!, $lng: Float!, $note: String) {
    clockIn(userId: $userId, lat: $lat, lng: $lng, note: $note) {
      id
      clockInTime
      locationIn
      note
    }
  }
`;
const CLOCK_OUT = gql`
  mutation ClockOut($userId: String!, $lat: Float!, $lng: Float!, $note: String) {
    clockOut(userId: $userId, lat: $lat, lng: $lng, note: $note) {
      id
      clockOutTime
      locationOut
      note
    }
  }
`;

export default function CareWorkerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const { loading: shiftsLoading, data, refetch } = useQuery(GET_CAREWORKER_SHIFTS, {
    variables: { userId: session?.user?.id },
    skip: !session, 
  });
  console.log(typeof session?.user?.id);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
    } 
  }, [session, status, router]);

  const [clockInMutation] = useMutation(CLOCK_IN, {
    refetchQueries: ["GetShifts"],
  });
  const [clockOutMutation] = useMutation(CLOCK_OUT, {
    refetchQueries: ["GetShifts"],
  });
  

  const handleClockIn = async () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await clockInMutation({
            variables: {
              userId: session?.user?.id,
              lat: latitude,
              lng: longitude,
              note: note || "",
            },
          });

          setClockedIn(true);
          message.success("Successfully clocked in!");
          setNote("");
        } catch (error) {
          message.error("Clock-in failed.");
          console.error("Clock-in error:", error);
          alert(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        message.error("Failed to get location. Please allow location access.");
        setLoading(false);
      }
    );
  };


  const handleClockOut = async () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser.");
      return;
    }
  
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
  
        try {
          await clockOutMutation({
            variables: {
              userId: session?.user?.id,
              lat: latitude,
              lng: longitude,
              note: note || "",
            },
          });
  
          message.success("Successfully clocked out!");
          setClockedIn(false);
          setNote("");
          refetch();
        } catch (error) {
          message.error("Clock-out failed.");
          console.error("Clock-out error:", error);
          alert(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        message.error("Failed to get location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  const columns = [
    {
      title: "Clock In Time",
      dataIndex: "clockInTime",
      key: "clockInTime",
    },
    {
      title: "Clock Out Time",
      dataIndex: "clockOutTime",
      key: "clockOutTime",
      render: (time: String) =>
        time ? time : "Still Clocked In",
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
        className="!bg-[#008C91]"
      >
        Clock In
      </Button>
      <Button
        type="default"
        danger
        onClick={handleClockOut}
        disabled={!clockedIn}
        loading={loading}
        className="!bg-[#008C91]"
      >
        Clock Out
      </Button>

      <Title level={4} style={{ marginTop: 20 }}>
        Shift History
      </Title>
      <Table
        dataSource={data?.shiftsByCareWorkerName || []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}
