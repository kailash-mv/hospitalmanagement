"use client";

import { useState } from "react";
import { Button, Typography, Layout, Card } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Home() {
  const [loading, setLoading] = useState({ login: false, signup: false });

  const handleClick = (button: "login" | "signup") => {
    setLoading((prev) => ({ ...prev, [button]: true }));
    setTimeout(
      () => setLoading((prev) => ({ ...prev, [button]: false })),
      2000
    );
  };

  return (
    <Layout className="!min-h-screen !h-screen !flex !items-center !justify-center !bg-[#00000]">
      <Content className="!w-full !max-w-3xl !text-center !p-6 sm:!py-30">
        <Card className="!p-10 !shadow-2xl !rounded-lg !bg-white">
          <Title level={1} className="!text-[#00AFAA] !mb-2">
            Hospital Management (MVP)
          </Title>
          <Text className="!text-lg !text-gray-600 !mb-6 !block">
            Shift Management and Careworker Scheduling.
          </Text>
          <div className="!flex !justify-center !gap-6 !mt-6">
            <Link href="/api/auth/signin" passHref>
              <Button
                type="primary"
                size="large"
                className="!px-6 !bg-[#00AFAA] !border-none !hover:bg-[#008C91]"
                loading={loading.login}
                onClick={() => handleClick("login")}
              >
                Login
              </Button>
            </Link>
            <Link href="/api/register" passHref>
              <Button
                size="large"
                className="!border-[#00AFAA] !text-[#00AFAA] !px-6 !hover:border-[#008C91] !hover:text-[#008C91]"
                loading={loading.signup}
                onClick={() => handleClick("signup")}
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
