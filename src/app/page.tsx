"use client";

import { Button, Typography, Layout } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-600">
      <Content className="text-center p-6 bg-white shadow-lg rounded-lg">
        <Title level={2} className="text-gray-200">
          Hospital Shift Tracker
        </Title>
        <Text type="secondary" className="block text-gray-600">
          Easily track and manage care worker shifts in real-time.
        </Text>
        <div className="flex gap-3 justify-center">
          <Link href="/api/auth/signin">
            <Button
              type="primary"
              size="large"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Login
            </Button>
          </Link>
          <Link href="/api/register">
            <Button
              size="large"
              className="border border-gray-300 hover:bg-gray-100"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </Content>
    </div>
  );
}
