// "use client";

// import { useState, useEffect } from "react";
// import { Card, Table, Typography, InputNumber, Button, message } from "antd";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
// } from "chart.js";
// import { Bar } from "react-chartjs-2";
// import { useQuery, gql } from "@apollo/client";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement
// );

// const { Title } = Typography;

// type AnalyticsData = {
//   avgHoursPerDay: { date: string; avgHours: number }[];
//   numPeoplePerDay: { date: string; count: number }[];
// };

// type Perimeter = {
//   lat: number;
//   lng: number;
//   radius: number;
// };


// const GET_STAFF_HISTORY = gql`
// query {
//   shifts {
//     id
//     name
//     clockInTime
//     clockOutTime
//     locationIn
//     locationOut
//   }
// }
// `;
// const GET_CLOCKEDIN_STAFF_HISTORY = gql`
// query {
//   shifts {
//     id
//     name
//     clockInTime
//     locationIn
//   }
// }
// `;

// export default function ManagerDashboard() {
//   const [location, setLocation] = useState({ lat: 0, lng: 0 });
//   const [radius, setRadius] = useState<number | null>(2);
//   const [savedPerimeter, setSavedPerimeter] = useState<Perimeter | null>(null);
//   const [clockedInStaff, setClockedInStaff] = useState([]);
//   const [staffHistory, setStaffHistory] = useState([]);
//   const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
//   const {
//     data: staffData,
//     loading: staffLoading,
//     error: staffError,
//   } = useQuery(GET_STAFF_HISTORY);

//   // Fetching currently clocked-in staff
//   const {
//     data: clockedInData,
//     loading: clockedInLoading,
//     error: clockedInError,
//   } = useQuery(GET_CLOCKEDIN_STAFF_HISTORY);
 
//   useEffect(() => {
//     if (staffData?.shifts) {
//       setStaffHistory(staffData.shifts);
//     }
//   }, [staffData]);

//   useEffect(() => {
//     if (clockedInData?.shifts) {
//       setClockedInStaff(clockedInData.shifts);
//     }
//   }, [clockedInData]);

//   useEffect(() => {
//     fetchClockedInStaff();
//     fetchStaffHistory();
//     fetchAnalytics();
//     fetchPerimeter();
//     getCurrentLocation();
//   }, []);

//  console.log("STAFF STATE", staffHistory);
//  console.log("STAFF STATE", clockedInStaff);
 
//   const getCurrentLocation = () => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         });
//       },
//       () => message.error("Failed to get current location")
//     );
//   };

//   const fetchClockedInStaff = async () => {
//     try {
//       const res = await fetch("/api/clocked-in-staff");
//       const data = await res.json();
//       setClockedInStaff(data);
//     } catch (error) {
//       message.error("Failed to fetch clocked-in staff");
//     }
//   };

//   const fetchStaffHistory = () => {
//     if (staffLoading) {
//       message.loading("Fetching shift history...");
//       return;
//     }
//     if (staffError) {
//       message.error("Failed to fetch shift history");
//       return;
//     }
//     if (staffData?.shifts) {
//       setStaffHistory(staffData.shifts);
//     }
//   };

//   const fetchAnalytics = async () => {
//     try {
//       const res = await fetch("/api/analytics");
//       const data = await res.json();
//       setAnalytics(data);
//     } catch (error) {
//       message.error("Failed to fetch analytics");
//     }
//   };

//   const fetchPerimeter = async () => {
//     try {
//       const res = await fetch("/api/location-perimeter");
//       const data = await res.json();
//       if (data) {
//         setSavedPerimeter(data);
//       }
//     } catch (error) {
//       message.error("Failed to fetch location perimeter");
//     }
//   };

//   const handleSetLocation = async () => {
//     if (!location.lat || !location.lng) {
//       message.error("Invalid location data. Try again.");
//       return;
//     }

//     console.log("Sending to API:", {
//       lat: location.lat,
//       lng: location.lng,
//       radius,
//     });

//     try {
//       const res = await fetch("/api/location-perimeter", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ lat: location.lat, lng: location.lng, radius }),
//       });

//       const data = await res.json();
//       // console.log("Response from API:", data);

//       if (data.error) throw new Error(data.error);

//       setSavedPerimeter(data);
//       message.success("Location perimeter updated successfully.");
//     } catch (error) {
//       console.error("API error:", error);
//       message.error("Failed to set location perimeter");
//     }
//   };

//   const columns = [
//     { title: "Name", dataIndex: "name", key: "name" },
//     { title: "Clock In Time", dataIndex: "clockInTime", key: "clockInTime" },
//     { title: "Location", dataIndex: "locationIn", key: "locationIn" },
//   ];

//   const historyColumns = [
//     { title: "Name", dataIndex: "name", key: "name" },
//     { title: "Clock In", dataIndex: "clockInTime", key: "clockInTime" },
//     { title: "Clock Out", dataIndex: "clockOutTime", key: "clockOutTime" },
//     { title: "Location In", dataIndex: "locationIn", key: "locationIn" },
//     { title: "Location Out", dataIndex: "locationOut", key: "locationOut" },
//   ];

//   const chartData = {
//     labels: analytics?.avgHoursPerDay?.map((item: any) => item.date) || [],
//     datasets: [
//       {
//         label: "Avg Hours Per Day",
//         data:
//           analytics?.avgHoursPerDay?.map((item: any) => item.avgHours) || [],
//         backgroundColor: "rgba(54, 162, 235, 0.5)",
//       },
//       {
//         label: "People Clocking In Per Day",
//         data: analytics?.numPeoplePerDay?.map((item: any) => item.count) || [],
//         backgroundColor: "rgba(255, 99, 132, 0.5)",
//       },
//     ],
//   };

//   return (
//     <div className="md:p-10 md:px-26">
//       <Card style={{ marginBottom: 20 }}>
//         <Title level={3}>Set Clock-In Location Perimeter</Title>
//         <InputNumber
//           value={radius}
//           onChange={setRadius}
//           min={0.5}
//           max={10}
//           step={0.5}
//         />{" "}
//         km
//         <Button
//           type="primary"
//           onClick={handleSetLocation}
//           style={{ marginLeft: 10 }}
//           className="!bg-[#00AFAA]"
//         >
//           Set
//         </Button>
//         {savedPerimeter && (
//           <p>
//             Current Perimeter: Lat {savedPerimeter.lat}, Lng{" "}
//             {savedPerimeter.lng}, Radius {savedPerimeter.radius} km
//           </p>
//         )}
//       </Card>

//       <Card>
//         <Title level={3}>Currently Clocked-In Staff</Title>
//         <Table dataSource={clockedInStaff} columns={columns} rowKey="id" />
//       </Card>

//       <Card style={{ marginTop: 20 }}>
//         <Title level={3}>Shift History</Title>
//         <Table dataSource={staffHistory} columns={historyColumns} rowKey="id" />
//       </Card>

//       <Card style={{ marginTop: 20 }}>
//         <Title level={3}>Analytics</Title>
//         <Bar data={chartData} />
//       </Card>
//     </div>
//   );
// }

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
import { useQuery, useMutation, gql } from "@apollo/client";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const { Title } = Typography;

type AnalyticsData = {
  avgHoursPerDay: { date: string; avgHours: number }[];
  numPeoplePerDay: { date: string; count: number }[];
};

type Perimeter = {
  lat: number;
  lng: number;
  radius: number;
};

const GET_SHIFTS = gql`
query {
  shifts {
    id
    name
    clockInTime
    clockOutTime
    locationIn
    locationOut
  }
}
`;

const GET_LOCATION_PERIMETER = gql`
  query GetLocationPerimeter {
    locationPerimeters {
      id
      lat
      lng
      radius
    }
  }
`;

const SET_LOCATION_PERIMETER = gql`
  mutation SetLocationPerimeter($lat: Float!, $lng: Float!, $radius: Float!) {
    setLocationPerimeter(lat: $lat, lng: $lng, radius: $radius) {
      id
      lat
      lng
      radius
    }
  }
`;

export default function ManagerDashboard() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [radius, setRadius] = useState<number | null>(2);
  const [savedPerimeter, setSavedPerimeter] = useState<Perimeter | null>(null);
  const [clockedInStaff, setClockedInStaff] = useState([]);
  const [staffHistory, setStaffHistory] = useState([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const { data, loading, error } = useQuery(GET_SHIFTS);
  const [setLocationPerimeter] = useMutation(SET_LOCATION_PERIMETER);
  const { data: perimeterData, refetch: refetchPerimeter } = useQuery(GET_LOCATION_PERIMETER);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => message.error("Failed to get current location")
    );
  };

  useEffect(() => {
    if (perimeterData) {
      setSavedPerimeter(perimeterData.locationPerimeters[0]);
    }
  }, [perimeterData]);

  useEffect(() => {
    if (data?.shifts) {
      setStaffHistory(data.shifts.filter((shift: any) => shift.clockOutTime));
      setClockedInStaff(data.shifts.filter((shift: any) => !shift.clockOutTime));
    }
  }, [data]);

  useEffect(() => {
    fetchAnalytics();
    fetchPerimeter();
    getCurrentLocation();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      message.error("Failed to fetch analytics");
    }
  };

  const fetchPerimeter = async () => {
    try {
      const res = await fetch("/api/location-perimeter");
      const data = await res.json();
      if (data) {
        setSavedPerimeter(data);
      }
    } catch (error) {
      message.error("Failed to fetch location perimeter");
    }
  };

  const handleSetLocation = async () => {
    if (!location.lat || !location.lng) {
      message.error("Invalid location data. Try again.");
      return;
    }

    try {
      const { data } = await setLocationPerimeter({
        variables: { lat: location.lat, lng: location.lng, radius },
      });
      if (data) {
        setSavedPerimeter(data.setLocationPerimeter);
        message.success("Location perimeter updated successfully.");
        refetchPerimeter();
      }
    } catch (error) {
      message.error("Failed to set location perimeter");
    }
  };


  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Clock In Time", dataIndex: "clockInTime", key: "clockInTime" },
    { title: "Location", dataIndex: "locationIn", key: "locationIn" },
  ];

  const historyColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Clock In", dataIndex: "clockInTime", key: "clockInTime" },
    { title: "Clock Out", dataIndex: "clockOutTime", key: "clockOutTime" },
    { title: "Location In", dataIndex: "locationIn", key: "locationIn" },
    { title: "Location Out", dataIndex: "locationOut", key: "locationOut" },
  ];

  const chartData = {
    labels: analytics?.avgHoursPerDay?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Avg Hours Per Day",
        data: analytics?.avgHoursPerDay?.map((item) => item.avgHours) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "People Clocking In Per Day",
        data: analytics?.numPeoplePerDay?.map((item) => item.count) || [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="md:p-10 md:px-26">
      <Card style={{ marginBottom: 20 }}>
        <Title level={3}>Set Clock-In Location Perimeter</Title>
        <InputNumber
          value={radius}
          onChange={setRadius}
          min={0.5}
          max={10}
          step={0.5}
        /> km
        <Button type="primary" onClick={handleSetLocation} style={{ marginLeft: 10 }}>
          Set
        </Button>
        {savedPerimeter && (
          <p>
            Current Perimeter: Lat {savedPerimeter.lat}, Lng {savedPerimeter.lng}, Radius {savedPerimeter.radius} km
          </p>
        )}
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
